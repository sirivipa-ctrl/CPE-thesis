import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { ADVISORS_DATA } from '../data/advisorsData';

const USERS_COLLECTION = 'users';
const ADMINS_COLLECTION = 'admins';
const ACTIVITY_LOGS_COLLECTION = 'activityLogs';
export const ADMIN_EMAIL = 'sirivipa2001@gmail.com';

export interface RegisterStudentData {
  displayName: string;
  studentId: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface RegisterAdvisorData {
  advisorId?: string;
  email: string;
  password: string;
  fullName?: string;
}

/**
 * Validate that an email is an official KU email
 */
export function isValidKuEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean.endsWith('@ku.th') || 
         clean.endsWith('@live.ku.th') || 
         clean.endsWith('.ku.th') || 
         clean.endsWith('@ku.ac.th') || 
         clean.endsWith('.ku.ac.th');
}

/**
 * Convert Firebase Auth error codes into human-readable Thai messages
 */
export function formatAuthError(error: any): string {
  if (!error) return 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบ';
  const code = error.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว กรุณาเข้าสู่ระบบ หรือใช้ตัวเลือกกู้คืนรหัสผ่าน';
    case 'auth/invalid-email':
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง';
    case 'auth/weak-password':
      return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    case 'auth/too-many-requests':
      return 'คุณป้อนรหัสผ่านผิดหลายครั้งเกินไป ระบบระงับชั่วคราวเพื่อความปลอดภัย กรุณารอสักครู่แล้วลองใหม่';
    case 'auth/network-request-failed':
      return 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบอินเทอร์เน็ต';
    default:
      return error.message || 'การตรวจสอบสิทธิ์ล้มเหลว';
  }
}

export function getTimestampMillis(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = new Date(val).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof val.toMillis === 'function') {
    return val.toMillis();
  }
  if (typeof val.toDate === 'function') {
    return val.toDate().getTime();
  }
  if (val.seconds) {
    return val.seconds * 1000;
  }
  return 0;
}

/**
 * Real-time subscription to all users in Firestore
 */
export function subscribeToUsers(
  callback: (users: UserProfile[]) => void, 
  onError?: (err: any) => void
): () => void {
  const colRef = collection(db, USERS_COLLECTION);
  return onSnapshot(colRef, (snap) => {
    const users = snap.docs.map(d => ({ ...(d.data() as UserProfile), uid: d.id }));
    users.sort((a, b) => {
      const timeA = getTimestampMillis(a.createdAt);
      const timeB = getTimestampMillis(b.createdAt);
      return timeB - timeA;
    });
    callback(users);
  }, (error) => {
    console.error('Error in subscribeToUsers:', error);
    if (onError) onError(error);
  });
}

/**
 * Fetch all users from Firestore (one-time fetch)
 */
export async function getAllUsersFromDb(): Promise<UserProfile[]> {
  try {
    const colRef = collection(db, USERS_COLLECTION);
    const snap = await getDocs(colRef);
    const users = snap.docs.map(d => ({ ...(d.data() as UserProfile), uid: d.id }));
    return users.sort((a, b) => {
      const timeA = getTimestampMillis(a.createdAt);
      const timeB = getTimestampMillis(b.createdAt);
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

/**
 * Register a new student using Firebase Authentication & Firestore
 * Absolutely NO plaintext password is saved into Firestore!
 */
export async function registerStudentInDb(data: RegisterStudentData): Promise<UserProfile> {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanStudentId = data.studentId.trim();
  const cleanName = data.displayName.trim();
  const cleanPhone = data.phoneNumber.trim();
  const password = data.password.trim();

  if (!isValidKuEmail(cleanEmail)) {
    throw new Error('กรุณาใช้อีเมลมหาวิทยาลัยเกษตรศาสตร์ (@ku.th) เท่านั้นในการสมัครสมาชิก');
  }

  if (!cleanStudentId) {
    throw new Error('กรุณากรอกรหัสนิสิต (10 หลัก)');
  }

  if (!cleanName) {
    throw new Error('กรุณากรอกชื่อ-นามสกุล');
  }

  if (password.length < 6) {
    throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }

  try {
    let user: FirebaseUser;
    try {
      // 1. Create real account in Firebase Authentication
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      user = userCred.user;
    } catch (createErr: any) {
      if (createErr.code === 'auth/email-already-in-use') {
        // Self-healing: if user already exists in Firebase Auth (e.g. from previous failed attempt before rules deployed),
        // authenticate with their password to write the missing Firestore profile!
        try {
          const signCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          user = signCred.user;
        } catch {
          throw new Error('อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว หากคุณเคยสมัครแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านเดิม');
        }
      } else {
        throw createErr;
      }
    }

    // 2. Set display name in Firebase Auth
    try {
      await updateProfile(user, { displayName: cleanName });
    } catch {
      // Non-blocking
    }

    const thaiDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 3. Save profile in Firestore (users/{uid}) WITHOUT password
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: cleanName,
      studentId: cleanStudentId,
      email: cleanEmail,
      phoneNumber: cleanPhone,
      role: 'student',
      department: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์',
      campus: 'วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร (มก.ฉกส.)',
      status: 'active',
      registeredAt: thaiDate,
    };

    await setDoc(userDocRef, {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Record Activity Log
    try {
      await addDoc(collection(db, ACTIVITY_LOGS_COLLECTION), {
        actorId: user.uid,
        actorName: cleanName,
        actorRole: 'student',
        action: 'ลงทะเบียนสมาชิกนิสิต',
        details: `นิสิต รหัส ${cleanStudentId} (${cleanEmail}) สมัครสมาชิก Firebase Auth สำเร็จ`,
        createdAt: serverTimestamp()
      });
    } catch {
      // Non-blocking
    }

    return newProfile;
  } catch (error: any) {
    if (error.code) {
      throw new Error(formatAuthError(error));
    }
    throw error;
  }
}

/**
 * Authenticate student with KU Email & Password using Firebase Auth
 */
export async function authenticateKuUser(email: string, password?: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();

  if (!isValidKuEmail(cleanEmail)) {
    throw new Error('กรุณาระบุอีเมลมหาวิทยาลัยเกษตรศาสตร์ (@ku.th) เท่านั้น');
  }

  if (!password) {
    throw new Error('กรุณากรอกรหัสผ่าน');
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = cred.user;

    // Fetch user profile from Firestore
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      return { ...(snap.data() as UserProfile), uid: user.uid };
    }

    // If profile document missing (e.g. from previously interrupted registration), create and repair profile
    const studentIdMatch = cleanEmail.match(/b?([0-9]{9,10})/i);
    const fallbackProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || cleanEmail.split('@')[0],
      email: cleanEmail,
      studentId: studentIdMatch ? studentIdMatch[1] : undefined,
      role: 'student',
      department: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์',
      campus: 'วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร (มก.ฉกส.)',
      status: 'active',
      registeredAt: new Date().toLocaleDateString('th-TH'),
    };
    await setDoc(userDocRef, {
      ...fallbackProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return fallbackProfile;
  } catch (error: any) {
    if (error.code) {
      throw new Error(formatAuthError(error));
    }
    throw error;
  }
}

/**
 * Register or set password for an Advisor in Firebase Auth & Firestore
 * Requirement: ถ้าอีเมลตรงกับระบบจะเป็นอาจารย์คนนั้นเลย (8 ท่าน)
 */
export async function registerAdvisorInDb(data: RegisterAdvisorData): Promise<UserProfile> {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPassword = data.password.trim();

  if (!isValidKuEmail(cleanEmail)) {
    throw new Error('กรุณาระบุอีเมลมหาวิทยาลัยเกษตรศาสตร์ (@ku.th) เท่านั้น');
  }

  if (cleanPassword.length < 6) {
    throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }

  // Match with 8 CPE faculty advisors
  const matchedAdvisor = ADVISORS_DATA.find(a => 
    a.email.toLowerCase() === cleanEmail ||
    (data.advisorId && a.id.toLowerCase() === data.advisorId.toLowerCase())
  );

  const displayName = matchedAdvisor ? matchedAdvisor.name : (data.fullName || `อาจารย์ที่ปรึกษา (${cleanEmail})`);
  const room = matchedAdvisor ? matchedAdvisor.room : 'ภาควิชาวิศวกรรมคอมพิวเตอร์ (EN3)';
  const academicRank = matchedAdvisor ? matchedAdvisor.academicRank : 'อาจารย์ประจำหลักสูตร';
  const thaiDate = new Date().toLocaleDateString('th-TH');

  try {
    let authUser: FirebaseUser;
    try {
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      authUser = userCred.user;
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        // Already created in Firebase Auth, sign in to update credentials/profile
        const signInCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        authUser = signInCred.user;
      } else {
        throw err;
      }
    }

    try {
      await updateProfile(authUser, { displayName });
    } catch {
      // Non-blocking
    }

    // Save profile to Firestore under users/{uid} WITHOUT password
    const userDocRef = doc(db, USERS_COLLECTION, authUser.uid);
    const profile: UserProfile = {
      uid: authUser.uid,
      displayName,
      email: cleanEmail,
      role: 'advisor',
      academicRank,
      room,
      department: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์',
      campus: 'วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร (มก.ฉกส.)',
      status: 'active',
      expertise: matchedAdvisor?.expertise || ['Computer Engineering'],
      quotaTotal: matchedAdvisor?.quotaMax || 6,
      quotaUsed: matchedAdvisor?.quotaUsed || 0,
      registeredAt: thaiDate,
    };

    await setDoc(userDocRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Activity log in Firestore
    try {
      await addDoc(collection(db, ACTIVITY_LOGS_COLLECTION), {
        actorId: authUser.uid,
        actorName: displayName,
        actorRole: 'advisor',
        action: 'ลงทะเบียนรหัสผ่านอาจารย์',
        details: `อาจารย์ ${displayName} (${cleanEmail}) ลงทะเบียน Firebase Auth สำเร็จ`,
        createdAt: serverTimestamp()
      });
    } catch {
      // Non-blocking
    }

    return profile;
  } catch (error: any) {
    if (error.code) {
      throw new Error(formatAuthError(error));
    }
    throw error;
  }
}

/**
 * Check if an advisor account already exists in Firebase Auth/Firestore
 */
export async function getAdvisorPasswordStatus(identifier: string): Promise<boolean> {
  const cleanId = identifier.trim();
  const matchedAdvisor = ADVISORS_DATA.find(a => 
    a.id.toLowerCase() === cleanId.toLowerCase() ||
    a.email.toLowerCase() === cleanId.toLowerCase() ||
    a.name.toLowerCase().includes(cleanId.toLowerCase())
  );

  const targetEmail = matchedAdvisor ? matchedAdvisor.email.toLowerCase() : cleanId.toLowerCase();
  try {
    const colRef = collection(db, USERS_COLLECTION);
    const snap = await getDocs(colRef);
    const exists = snap.docs.some(d => {
      const u = d.data() as UserProfile;
      return u.email?.toLowerCase() === targetEmail && u.role === 'advisor';
    });
    return exists;
  } catch {
    return false;
  }
}

/**
 * Authenticate Advisor by ID or KU Email & specific personal password using Firebase Auth
 */
export async function authenticateAdvisor(identifier: string, password?: string, customEmail?: string): Promise<UserProfile> {
  const cleanId = identifier.trim();
  const cleanEmail = (customEmail || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  // Find matching advisor among the 8 faculty members
  const matchedAdvisor = ADVISORS_DATA.find(a => 
    a.id.toLowerCase() === cleanId.toLowerCase() ||
    a.email.toLowerCase() === cleanId.toLowerCase() ||
    (cleanEmail && a.email.toLowerCase() === cleanEmail) ||
    a.name.toLowerCase().includes(cleanId.toLowerCase())
  );

  const targetEmail = matchedAdvisor ? matchedAdvisor.email.toLowerCase() : cleanEmail;
  const advisorName = matchedAdvisor ? matchedAdvisor.name : (cleanId || targetEmail);

  if (!targetEmail) {
    throw new Error('ไม่พบข้อมูลอีเมลของอาจารย์ที่เลือก');
  }

  if (!cleanPassword) {
    throw new Error('กรุณากรอกรหัสผ่านของอาจารย์เพื่อเข้าสู่ระบบ');
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, targetEmail, cleanPassword);
    const user = cred.user;

    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      return { ...(snap.data() as UserProfile), uid: user.uid, role: 'advisor' };
    }

    // Auto-create advisor profile document if missing
    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: matchedAdvisor?.name || user.displayName || advisorName,
      email: targetEmail,
      role: 'advisor',
      academicRank: matchedAdvisor?.academicRank || 'อาจารย์ประจำหลักสูตร',
      room: matchedAdvisor?.room || 'ภาควิชาวิศวกรรมคอมพิวเตอร์ (EN3)',
      department: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์',
      campus: 'วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร (มก.ฉกส.)',
      status: 'active',
      expertise: matchedAdvisor?.expertise || ['Computer Engineering'],
      quotaTotal: matchedAdvisor?.quotaMax || 6,
      quotaUsed: matchedAdvisor?.quotaUsed || 0,
      registeredAt: new Date().toLocaleDateString('th-TH'),
    };

    await setDoc(userDocRef, {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newProfile;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      throw new Error(`อาจารย์ "${advisorName}" ยังไม่ได้ลงทะเบียนหรือรหัสผ่านไม่ถูกต้อง กรุณาเลือก "สมัครสมาชิก / กำหนดรหัสผ่านอาจารย์" เพื่อตั้งรหัสผ่านก่อนเข้าสู่ระบบ`);
    }
    if (error.code) {
      throw new Error(formatAuthError(error));
    }
    throw error;
  }
}

/**
 * Authenticate Admin with Firebase Authentication (Password only)
 * Replaces hardcoded client ADMIN_MASTER_CODE
 */
export async function authenticateAdminWithAuth(password: string, email?: string): Promise<UserProfile> {
  const cleanPassword = (password || '').trim();
  if (!cleanPassword) {
    throw new Error('กรุณากรอกรหัสผ่านผู้ดูแลระบบ');
  }

  const cleanEmail = (email || ADMIN_EMAIL).trim().toLowerCase();

  try {
    let authUser: FirebaseUser;
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      authUser = cred.user;
    } catch (err: any) {
      // If user is not yet created in Firebase Auth, auto-provision admin account
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          authUser = createCred.user;
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            throw new Error('รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง');
          }
          throw err;
        }
      } else {
        throw err;
      }
    }

    // Verify admin role in Firestore or verified admin email
    const isAdminEmail = cleanEmail === ADMIN_EMAIL;
    const adminDocRef = doc(db, ADMINS_COLLECTION, authUser.uid);
    const adminSnap = await getDoc(adminDocRef);

    if (!isAdminEmail && !adminSnap.exists()) {
      throw new Error('บัญชีนี้ไม่ได้รับสิทธิ์เป็นผู้ดูแลระบบ (Admin CPE)');
    }

    // Ensure Admin document in /admins/{uid} exists
    if (!adminSnap.exists()) {
      await setDoc(adminDocRef, {
        uid: authUser.uid,
        email: cleanEmail,
        role: 'admin',
        createdAt: serverTimestamp(),
      });
    }

    // Ensure User profile in /users/{uid} exists with role: 'admin'
    const userDocRef = doc(db, USERS_COLLECTION, authUser.uid);
    const userProfile: UserProfile = {
      uid: authUser.uid,
      displayName: authUser.displayName || 'ผู้ดูแลระบบกลาง (Admin CPE)',
      email: cleanEmail,
      role: 'admin',
      department: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์',
      campus: 'วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร (มก.ฉกส.)',
      status: 'active',
      registeredAt: 'ผู้ดูแลระบบ',
    };

    await setDoc(userDocRef, {
      ...userProfile,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return userProfile;
  } catch (error: any) {
    if (error.code) {
      throw new Error(formatAuthError(error));
    }
    throw error;
  }
}

/**
 * Register Admin account using Firebase Auth (for initial admin setup)
 */
export async function registerAdminWithAuth(email: string, password: string): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== ADMIN_EMAIL) {
    throw new Error(`การสร้างบัญชีผู้ดูแลระบบอนุญาตเฉพาะอีเมลผู้ดูแลที่กำหนดไว้ (${ADMIN_EMAIL}) เท่านั้น`);
  }

  if (password.length < 6) {
    throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }

  try {
    let authUser: FirebaseUser;
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      authUser = cred.user;
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        const signCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        authUser = signCred.user;
      } else {
        throw err;
      }
    }

    // Set Admin designation in Firestore
    await setDoc(doc(db, ADMINS_COLLECTION, authUser.uid), {
      uid: authUser.uid,
      email: cleanEmail,
      role: 'admin',
      createdAt: serverTimestamp(),
    });

    const profile: UserProfile = {
      uid: authUser.uid,
      displayName: 'ผู้ดูแลระบบกลาง (Admin CPE)',
      email: cleanEmail,
      role: 'admin',
      department: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์',
      campus: 'วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร (มก.ฉกส.)',
      status: 'active',
      registeredAt: 'ผู้ดูแลระบบ',
    };

    await setDoc(doc(db, USERS_COLLECTION, authUser.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return profile;
  } catch (error: any) {
    if (error.code) {
      throw new Error(formatAuthError(error));
    }
    throw error;
  }
}

/**
 * Admin deletes a user account from Firestore so they can re-register
 */
export async function deleteUserFromDb(userId: string, targetName?: string): Promise<void> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(userDocRef);

    // Audit log
    try {
      await addDoc(collection(db, ACTIVITY_LOGS_COLLECTION), {
        actorId: auth.currentUser?.uid || 'admin',
        actorName: auth.currentUser?.displayName || 'ผู้ดูแลระบบกลาง (Admin CPE)',
        actorRole: 'admin',
        action: 'ลบบัญชีผู้ใช้งาน',
        details: `ผู้ดูแลระบบลบบัญชี ${targetName || userId} ออกจากฐานข้อมูล`,
        createdAt: serverTimestamp()
      });
    } catch {
      // Non-blocking
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
}

/**
 * Update user role (only admin)
 */
export async function updateUserRoleInDb(userId: string, newRole: UserRole): Promise<void> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userDocRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}
