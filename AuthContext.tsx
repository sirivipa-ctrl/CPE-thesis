import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { 
  authenticateKuUser, 
  authenticateAdvisor,
  registerStudentInDb, 
  RegisterStudentData,
  registerAdvisorInDb,
  RegisterAdvisorData,
  authenticateAdminWithAuth,
  registerAdminWithAuth,
  deleteUserFromDb,
  ADMIN_EMAIL
} from '../services/userService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  activeRole: UserRole;
  loginWithGoogle: () => Promise<void>;
  loginWithKuEmail: (email: string, password: string) => Promise<UserProfile>;
  loginAsAdvisor: (identifier: string, password?: string, customEmail?: string) => Promise<UserProfile>;
  registerAdvisor: (data: RegisterAdvisorData) => Promise<UserProfile>;
  loginAsAdmin: (password: string, email?: string) => Promise<UserProfile>;
  registerAdmin: (email: string, password: string) => Promise<UserProfile>;
  registerStudent: (data: RegisterStudentData) => Promise<UserProfile>;
  deleteUserAccount: (userId: string, targetName?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<UserRole>('student');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          
          const isAdminUser = user.email === ADMIN_EMAIL;
          if (isAdminUser) {
            // Auto bootstrap admin doc in /admins/{uid}
            try {
              const adminRef = doc(db, 'admins', user.uid);
              const adminSnap = await getDoc(adminRef);
              if (!adminSnap.exists()) {
                await setDoc(adminRef, {
                  uid: user.uid,
                  email: user.email,
                  role: 'admin',
                  createdAt: serverTimestamp(),
                });
              }
            } catch {
              // Ignore
            }
          }

          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            const finalRole: UserRole = isAdminUser ? 'admin' : (data.role || 'student');
            const mergedProfile: UserProfile = { ...data, uid: user.uid, role: finalRole };
            setUserProfile(mergedProfile);
            setActiveRole(finalRole);
          } else {
            // Document does not exist yet (e.g. from Google sign-in)
            const newRole: UserRole = isAdminUser 
              ? 'admin' 
              : (user.email?.includes('ku.th') && !user.email.match(/[0-9]/) ? 'advisor' : 'student');
            
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || (isAdminUser ? 'ผู้ดูแลระบบกลาง (Admin CPE)' : 'นิสิตวิศวกรรมคอมพิวเตอร์'),
              photoURL: user.photoURL || '',
              role: newRole,
              department: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์',
              campus: 'วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร (มก.ฉกส.)',
              studentId: newRole === 'student' ? '653040123-4' : undefined,
              room: newRole === 'advisor' ? 'EN3-408' : undefined,
              academicRank: newRole === 'advisor' ? 'อาจารย์ประจำหลักสูตร' : undefined,
              status: 'active',
              registeredAt: new Date().toLocaleDateString('th-TH')
            };

            await setDoc(userDocRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            setUserProfile(newProfile);
            setActiveRole(newRole);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setActiveRole('student');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in using KU Email & Password against Firebase Auth
   */
  const loginWithKuEmail = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await authenticateKuUser(email, password);
      setUserProfile(profile);
      setActiveRole(profile.role);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in as Advisor by identifier/email with specific advisor password
   */
  const loginAsAdvisor = async (identifier: string, password?: string, customEmail?: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await authenticateAdvisor(identifier, password, customEmail);
      setUserProfile(profile);
      setActiveRole('advisor');
      return profile;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register or set password for an advisor with Firebase Auth
   */
  const registerAdvisor = async (data: RegisterAdvisorData): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await registerAdvisorInDb(data);
      setUserProfile(profile);
      setActiveRole('advisor');
      return profile;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in as Admin via Firebase Auth using password only
   */
  const loginAsAdmin = async (password: string, email?: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const adminProfile = await authenticateAdminWithAuth(password, email);
      setUserProfile(adminProfile);
      setActiveRole('admin');
      return adminProfile;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register Admin via Firebase Auth
   */
  const registerAdmin = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const adminProfile = await registerAdminWithAuth(email, password);
      setUserProfile(adminProfile);
      setActiveRole('admin');
      return adminProfile;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new student into Firebase Auth & Firestore
   */
  const registerStudent = async (data: RegisterStudentData): Promise<UserProfile> => {
    setLoading(true);
    try {
      const newProfile = await registerStudentInDb(data);
      setUserProfile(newProfile);
      setActiveRole('student');
      return newProfile;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Admin deletes a user account from database
   */
  const deleteUserAccount = async (userId: string, targetName?: string): Promise<void> => {
    await deleteUserFromDb(userId, targetName);
    if (userProfile?.uid === userId) {
      setUserProfile(null);
      setActiveRole('student');
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn("Firebase signout error:", err);
    }
    setCurrentUser(null);
    setUserProfile(null);
    setActiveRole('student');
  };

  // Prevent role spoofing: Only verified Admins can toggle between roles
  const switchRole = (role: UserRole) => {
    if (userProfile?.role === 'admin') {
      setActiveRole(role);
    } else {
      console.warn("Permission denied: Cannot switch role without admin privileges.");
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    try {
      const userDocRef = doc(db, 'users', userProfile.uid);
      await setDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      const merged = { ...userProfile, ...data };
      setUserProfile(merged);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userProfile.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      loading,
      activeRole,
      loginWithGoogle,
      loginWithKuEmail,
      loginAsAdvisor,
      registerAdvisor,
      loginAsAdmin,
      registerAdmin,
      registerStudent,
      deleteUserAccount,
      logout,
      switchRole,
      updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
