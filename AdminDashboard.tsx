import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Clock, 
  FolderTree, 
  ShieldAlert, 
  BarChart3, 
  LogOut, 
  Shield, 
  CheckCircle2, 
  Search, 
  Trash2, 
  Edit2, 
  ChevronRight,
  Database,
  History,
  UserPlus,
  Plus,
  Check,
  X,
  Lock,
  FileCheck,
  AlertCircle,
  Phone,
  RefreshCw,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Thesis, ActivityLog, UserRole, UserProfile } from '../types';
import { getActivityLogs, updateThesis, deleteThesis } from '../services/thesisService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  getAllUsersFromDb, 
  subscribeToUsers,
  deleteUserFromDb, 
  updateUserRoleInDb, 
  registerStudentInDb,
  isValidKuEmail 
} from '../services/userService';
import {
  subscribeToCategories,
  addCategoryInDb,
  deleteCategoryFromDb,
  ResearchCategoryDoc
} from '../services/categoryService';

interface AdminDashboardProps {
  theses: Thesis[];
  onOpenThesis: (thesis: Thesis) => void;
  onSelectTab: (tab: string) => void;
  onDeleteThesis: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  theses,
  onOpenThesis,
  onSelectTab,
  onDeleteThesis
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<'overview' | 'users' | 'theses' | 'approvals' | 'categories' | 'security' | 'reports'>('overview');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // 4.1 Real Firestore Users State
  const [dbUsers, setDbUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'advisor' | 'admin'>('all');
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // 4.4 Categories State (Connected to Firestore)
  const [categories, setCategories] = useState<ResearchCategoryDoc[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);

  // 4.1 Add User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserStudentId, setNewUserStudentId] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('student');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserError, setAddUserError] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Theses filter in admin
  const [thesesFilterQuery, setThesesFilterQuery] = useState('');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsersFromDb();
      setDbUsers(data);
    } catch (err) {
      console.error('Failed to load users from database:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    setLoadingUsers(true);
    const unsubscribe = subscribeToUsers(
      (users) => {
        setDbUsers(users);
        setLoadingUsers(false);
      },
      (err) => {
        console.error('Real-time users error:', err);
        setLoadingUsers(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLoadingCategories(true);
    const unsub = subscribeToCategories(
      (cats) => {
        setCategories(cats);
        setLoadingCategories(false);
      },
      (err) => {
        console.error('Real-time categories error:', err);
        setLoadingCategories(false);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const result = await getActivityLogs(15);
        setLogs(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, []);

  // 4.3 Approvals list
  const pendingTheses = theses.filter(t => t.status === 'submitted' || t.status === 'under_review' || t.status === 'revision_required');

  // Handle Admin Approve
  const handleAdminApprove = async (id: string) => {
    try {
      await updateThesis(id, {
        status: 'approved',
        progressPercent: 100,
        currentMilestone: 'ผู้ดูแลระบบอนุมัติข้อมูลปริญญานิพนธ์และบรรจุเข้าคลังถาวรเรียบร้อยแล้ว'
      });
      alert('อนุมัติโครงงานสำเร็จ');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  // Handle Admin Reject
  const handleAdminReject = async (id: string) => {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
    if (!reason) return;
    try {
      await updateThesis(id, {
        status: 'revision_required',
        currentMilestone: `ผู้ดูแลระบบปฏิเสธ: ${reason}`
      });
      alert('บันทึกการปฏิเสธเรียบร้อยแล้ว');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  // Handle Add Category to Firestore
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCatName.trim();
    if (!clean) return;
    if (categories.some(c => c.name.toLowerCase() === clean.toLowerCase())) {
      alert('มีหมวดหมู่งานวิจัยนี้อยู่ในระบบแล้ว');
      return;
    }
    setIsAddingCat(true);
    try {
      await addCategoryInDb(clean);
      setNewCatName('');
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถเพิ่มหมวดหมู่ได้');
    } finally {
      setIsAddingCat(false);
    }
  };

  // Handle Remove Category from Firestore
  const handleRemoveCategory = async (cat: ResearchCategoryDoc) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${cat.name}" ออกจากฐานข้อมูล Firestore?`)) {
      try {
        await deleteCategoryFromDb(cat.id);
      } catch (err: any) {
        alert(err.message || 'ไม่สามารถลบหมวดหมู่ได้');
      }
    }
  };

  // Handle Add User into Firestore
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');

    if (!newUserName.trim() || !newUserEmail.trim()) {
      setAddUserError('กรุณากรอกชื่อ-นามสกุล และอีเมล');
      return;
    }

    if (!isValidKuEmail(newUserEmail)) {
      setAddUserError('ต้องใช้อีเมลที่ลงท้ายด้วย @ku.th หรือ @live.ku.th เท่านั้น');
      return;
    }

    setIsAddingUser(true);
    try {
      if (newUserRole === 'student') {
        const student = await registerStudentInDb({
          displayName: newUserName,
          studentId: newUserStudentId || '653040000-0',
          email: newUserEmail,
          phoneNumber: newUserPhone || '080-000-0000',
          password: 'Password123'
        });
        setDbUsers(prev => [student, ...prev]);
      } else {
        const newUid = `user_${Date.now()}`;
        const newProf: UserProfile = {
          uid: newUid,
          displayName: newUserName.trim(),
          email: newUserEmail.trim().toLowerCase(),
          role: newUserRole,
          department: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์',
          campus: 'วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร (มก.ฉกส.)',
          phoneNumber: newUserPhone || '',
          status: 'active',
          registeredAt: new Date().toLocaleDateString('th-TH'),
          createdAt: new Date().toISOString()
        };
        const userRef = doc(db, 'users', newUid);
        await setDoc(userRef, newProf);
        setDbUsers(prev => [newProf, ...prev]);
      }

      setNewUserName('');
      setNewUserEmail('');
      setNewUserStudentId('');
      setNewUserPhone('');
      setShowAddUserModal(false);
      alert('บันทึกข้อมูลผู้ใช้งานเข้าสู่ฐานข้อมูล Firestore สำเร็จ');
    } catch (err: any) {
      setAddUserError(err.message || 'เกิดข้อผิดพลาดในการบันทึกผู้ใช้');
    } finally {
      setIsAddingUser(false);
    }
  };

  // Handle Confirm Delete User from Firestore so student can re-register
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      await deleteUserFromDb(userToDelete.uid, userToDelete.displayName);
      setDbUsers(prev => prev.filter(u => u.uid !== userToDelete.uid));
      const deletedName = userToDelete.displayName;
      setUserToDelete(null);
      alert(`ลบบัญชีของ "${deletedName}" ออกจากฐานข้อมูลเรียบร้อยแล้ว นิสิตสามารถนำอีเมลนี้ไปลงทะเบียนสมัครสมาชิกใหม่ได้ทันที`);
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถลบข้อมูลผู้ใช้ได้');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Handle Role Change in Firestore
  const handleChangeRole = async (id: string, newRole: UserRole) => {
    try {
      await updateUserRoleInDb(id, newRole);
      setDbUsers(prev => prev.map(u => u.uid === id ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถเปลี่ยนบทบาทได้');
    }
  };

  // Filtered Users List
  const filteredUsers = dbUsers.filter(u => {
    const q = userSearchQuery.trim().toLowerCase();
    const matchesSearch = 
      q === '' ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.studentId && u.studentId.includes(q)) ||
      (u.phoneNumber && u.phoneNumber.includes(q));

    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const studentsCount = dbUsers.filter(u => u.role === 'student').length;
  const advisorsCount = dbUsers.filter(u => u.role === 'advisor').length;
  const adminsCount = dbUsers.filter(u => u.role === 'admin').length;

  const filteredTheses = theses.filter(t => 
    thesesFilterQuery === '' ||
    t.titleTh.toLowerCase().includes(thesesFilterQuery.toLowerCase()) ||
    t.code.toLowerCase().includes(thesesFilterQuery.toLowerCase()) ||
    t.studentNames.some(s => s.toLowerCase().includes(thesesFilterQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc]">
      {/* Dark Navy Sidebar (Matching Screenshot 161507) */}
      <aside className="w-full md:w-64 bg-[#0a2540] text-white flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight leading-tight">
                SmartThesis CPE
              </h2>
              <p className="text-[11px] text-blue-200 font-medium">
                ระบบผู้ดูแลระบบ (Admin)
              </p>
            </div>
          </div>

          <nav className="p-4 space-y-1.5 text-sm">
            <button
              onClick={() => setActiveMenu('overview')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'overview'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ภาพรวม</span>
            </button>

            {/*จัดการข้อมูลผู้ใช้งาน */}
            <button
              onClick={() => setActiveMenu('users')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'users'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>จัดการผู้ใช้งาน</span>
            </button>

            {/*ตรวจสอบและจัดการปริญญานิพนธ์ */}
            <button
              onClick={() => setActiveMenu('theses')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'theses'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>จัดการปริญญานิพนธ์</span>
            </button>

            {/*อนุมัติหรือปฏิเสธข้อมูล */}
            <button
              onClick={() => setActiveMenu('approvals')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'approvals'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>รายการรออนุมัติ</span>
              {pendingTheses.length > 0 && (
                <span className="ml-auto text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {pendingTheses.length}
                </span>
              )}
            </button>

            {/*จัดการหมวดหมู่ */}
            <button
              onClick={() => setActiveMenu('categories')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'categories'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>จัดการหมวดหมู่วิจัย</span>
            </button>

            {/*ความปลอดภัย */}
            <button
              onClick={() => setActiveMenu('security')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'security'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>ความปลอดภัย & Rules</span>
            </button>

            {/*รายงานระบบ */}
            <button
              onClick={() => setActiveMenu('reports')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'reports'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>รายงานสถิติการใช้งาน</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => onSelectTab('home')}
            className="w-full text-xs text-blue-200 hover:text-white py-1 text-left px-2"
          >
            ← กลับสู่หน้าหลักเว็บไซต์
          </button>
          <button
            onClick={() => {
              logout();
              onSelectTab('home');
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div>
            <span className="text-xs font-semibold text-blue-600 block">
              ระบบผู้ดูแลระบบ
            </span>
            <h1 className="text-2xl font-black text-[#111827]">
              {activeMenu === 'users' ? 'จัดการข้อมูลผู้ใช้งานภายในระบบ' 
                : activeMenu === 'theses' ? 'ตรวจสอบและจัดการข้อมูลปริญญานิพนธ์' 
                : activeMenu === 'approvals' ? 'อนุมัติหรือปฏิเสธข้อมูลปริญญานิพนธ์' 
                : activeMenu === 'categories' ? 'จัดการหมวดหมู่ของหัวข้อวิจัย' 
                : activeMenu === 'security' ? 'ดูแลความถูกต้องและความปลอดภัยของข้อมูล' 
                : activeMenu === 'reports' ? 'ตรวจสอบและดูรายงานสถิติการใช้งาน' 
                : 'ภาพรวม'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-gray-900">
                System Administrator
              </div>
              <div className="text-[11px] text-gray-500">
                {currentUser?.email || 'admin@ku.th'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              <Shield className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Welcome Deep Blue Banner */}
        <div className="bg-[#0f4c81] text-white rounded-3xl p-8 relative overflow-hidden shadow-sm">
          <div className="max-w-2xl space-y-2 relative z-10">
            <span className="text-xs font-semibold text-blue-200 tracking-wide uppercase">
              ยินดีต้อนรับกลับมา
            </span>
            <h2 className="text-3xl font-black tracking-tight">
              System Administrator
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed pt-1">
              เข้าถึงการจัดการระดับระบบหลังบ้าน: สิทธิ์ผู้ใช้, ฐานข้อมูลปริญญานิพนธ์, การอนุมัติ, และความปลอดภัย Firestore
            </p>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {dbUsers.length} คน
              </div>
              <span className="text-xs text-gray-500 font-medium">ผู้ใช้งานในระบบ</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {theses.length} เรื่อง
              </div>
              <span className="text-xs text-gray-500 font-medium">ปริญญานิพนธ์</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {pendingTheses.length} รายการ
              </div>
              <span className="text-xs text-gray-500 font-medium">รายการรออนุมัติ</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                ปกติ
              </div>
              <span className="text-xs text-gray-500 font-medium">สถานะระบบ & Rules</span>
            </div>
          </div>
        </div>

        {/*จัดการข้อมูลผู้ใช้งาน (User Management) */}
        {(activeMenu === 'overview' || activeMenu === 'users') && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-[#006644]">
                    <Users className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-black text-gray-900">
                    จัดการข้อมูลผู้ใช้งานในระบบ (Cloud Firestore)
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ตรวจสอบรายชื่อผู้ใช้งานทั้งหมดที่สมัครสมาชิกเข้ามา หากข้อมูลผิดพลาด แอดมินสามารถลบบัญชีเพื่อให้นิสิตสมัครใหม่ได้
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-xs cursor-pointer"
                  title="รีเฟรชข้อมูลจากฐานข้อมูล"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin text-[#006644]' : ''}`} />
                  <span>รีเฟรช</span>
                </button>

                <button
                  onClick={() => {
                    setAddUserError('');
                    setShowAddUserModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006644] hover:bg-[#005236] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ เพิ่มผู้ใช้งาน</span>
                </button>
              </div>
            </div>

            {/* User Statistics Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[11px] font-medium text-gray-500">ผู้ใช้งานทั้งหมด</span>
                <p className="text-xl font-black text-gray-900 mt-0.5">{dbUsers.length} คน</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                <span className="text-[11px] font-medium text-blue-700">นิสิต (Students)</span>
                <p className="text-xl font-black text-blue-900 mt-0.5">{studentsCount} คน</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] font-medium text-emerald-700">อาจารย์ที่ปรึกษา</span>
                <p className="text-xl font-black text-emerald-900 mt-0.5">{advisorsCount} ท่าน</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-[11px] font-medium text-indigo-700">ผู้ดูแลระบบ (Admin)</span>
                <p className="text-xl font-black text-indigo-900 mt-0.5">{adminsCount} คน</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              {/* Role filter buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: `ทั้งหมด (${dbUsers.length})` },
                  { id: 'student', label: `นิสิต (${studentsCount})` },
                  { id: 'advisor', label: `อาจารย์ (${advisorsCount})` },
                  { id: 'admin', label: `แอดมิน (${adminsCount})` },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setUserRoleFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      userRoleFilter === f.id
                        ? 'bg-[#006644] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, รหัสนิสิต, อีเมล..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                />
              </div>
            </div>

            {/* Users Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">ผู้ใช้งาน</th>
                    <th className="p-3.5">รหัสนิสิต</th>
                    <th className="p-3.5">อีเมลบัญชี KU</th>
                    <th className="p-3.5">เบอร์โทรศัพท์</th>
                    <th className="p-3.5">บทบาท (Role)</th>
                    <th className="p-3.5">วันที่สมัคร</th>
                    <th className="p-3.5">สถานะ</th>
                    <th className="p-3.5 text-center">จัดการบัญชี</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#006644]" />
                        <span>กำลังโหลดข้อมูลผู้ใช้งานจากฐานข้อมูล Firestore...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        ไม่พบข้อมูลผู้ใช้งานที่ตรงกับเงื่อนไข
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.uid} className="hover:bg-gray-50/80 transition">
                        {/* Name & Avatar */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              user.role === 'admin' 
                                ? 'bg-indigo-100 text-indigo-800' 
                                : user.role === 'advisor'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.displayName ? user.displayName.slice(0, 2) : 'KU'}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{user.displayName}</div>
                              <div className="text-[10px] text-gray-400">{user.department || 'วิศวกรรมคอมพิวเตอร์'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="p-3.5 font-mono text-gray-700">
                          {user.studentId ? (
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-bold text-[11px]">
                              {user.studentId}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* KU Email */}
                        <td className="p-3.5">
                          <span className="font-mono text-gray-700">{user.email}</span>
                        </td>

                        {/* Phone */}
                        <td className="p-3.5 text-gray-600">
                          {user.phoneNumber || '-'}
                        </td>

                        {/* Role */}
                        <td className="p-3.5">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.uid, e.target.value as UserRole)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                              user.role === 'admin'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                                : user.role === 'advisor'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-blue-50 border-blue-200 text-blue-900'
                            }`}
                          >
                            <option value="student">นิสิต (student)</option>
                            <option value="advisor">อาจารย์ (advisor)</option>
                            <option value="admin">ผู้ดูแลระบบ (admin)</option>
                          </select>
                        </td>

                        {/* Registered Date */}
                        <td className="p-3.5 text-gray-500 text-[11px]">
                          {user.registeredAt || (user.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : '-')}
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>ปกติ</span>
                          </span>
                        </td>

                        {/* Action - Delete Account Button */}
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition cursor-pointer border border-rose-200"
                            title="ลบบัญชีเพื่อให้นิสิตสมัครใหม่"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">ลบบัญชี (ให้สมัครใหม่)</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4.2 จัดการข้อมูลปริญญานิพนธ์ (Theses Management) */}
        {(activeMenu === 'theses') && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">ตรวจสอบและจัดการข้อมูลปริญญานิพนธ์</h3>
                <p className="text-xs text-gray-500">จัดการข้อมูลโครงงานทั้งหมดในฐานข้อมูล Firestore</p>
              </div>

              <div className="w-72">
                <input
                  type="text"
                  placeholder="ค้นหาโครงงาน..."
                  value={thesesFilterQuery}
                  onChange={(e) => setThesesFilterQuery(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-gray-300"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredTheses.map(t => (
                <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{t.titleTh}</h4>
                    <p className="text-[11px] text-gray-500">{t.code} • นิสิต: {t.studentNames.join(', ')} • อาจารย์: {t.advisorNames.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenThesis(t)}
                      className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
                    >
                      เปิดดู
                    </button>
                    <button
                      onClick={() => onDeleteThesis(t.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4.3 อนุมัติหรือปฏิเสธข้อมูล (Approval Queue) */}
        {(activeMenu === 'approvals') && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">อนุมัติหรือปฏิเสธข้อมูลปริญญานิพนธ์</h3>
                <p className="text-xs text-gray-500">ตรวจสอบความถูกต้องก่อนบรรจุเข้าคลังจัดเก็บถาวร</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
                รออนุมัติ {pendingTheses.length} รายการ
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {pendingTheses.map(item => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">{item.code}</span>
                    <h4 className="text-sm font-bold text-gray-900">{item.titleTh}</h4>
                    <p className="text-xs text-gray-500">ผู้จัดทำ: {item.studentNames.join(', ')} • ที่ปรึกษา: {item.advisorNames.join(', ')}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdminApprove(item.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                    >
                      อนุมัติ (Approve)
                    </button>
                    <button
                      onClick={() => handleAdminReject(item.id)}
                      className="px-4 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100"
                    >
                      ปฏิเสธ (Reject)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4.4 จัดการหมวดหมู่หัวข้อวิจัย (Research Categories) */}
        {(activeMenu === 'categories') && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-[#006644]">
                    <FolderTree className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-black text-gray-900">จัดการหมวดหมู่ของหัวข้อวิจัย (Cloud Firestore)</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">กำหนดหมวดหมู่งานวิจัยหลักของสาขาวิศวกรรมคอมพิวเตอร์ บันทึกลงฐานข้อมูลจริงแบบ Real-time</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#006644] text-xs font-bold border border-emerald-200/60 self-start sm:self-auto">
                ทั้งหมด {categories.length} หมวดหมู่
              </span>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
              <input
                type="text"
                required
                disabled={isAddingCat}
                placeholder="ชื่อหมวดหมู่งานวิจัยใหม่..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isAddingCat}
                className="px-4 py-2 bg-[#006644] hover:bg-[#005236] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingCat ? 'กำลังบันทึก...' : 'เพิ่มหมวดหมู่'}</span>
              </button>
            </form>

            <div className="space-y-2">
              {loadingCategories ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#006644]" />
                  <span>กำลังโหลดหมวดหมู่จาก Firestore...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  ยังไม่มีหมวดหมู่งานวิจัยในระบบ
                </div>
              ) : (
                categories.map((cat, idx) => (
                  <div key={cat.id || idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-800 hover:bg-gray-100/70 transition">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#006644] flex items-center justify-center font-bold text-[11px]">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-gray-900 font-bold">{cat.name}</span>
                        {cat.nameEn && <span className="text-gray-400 font-normal ml-2 text-[11px]">({cat.nameEn})</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="ลบหมวดหมู่ออกจาก Firestore"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4.5 ดูแลความถูกต้องและความปลอดภัย (Security & Audit) */}
        {(activeMenu === 'security' || activeMenu === 'overview') && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-black text-gray-900">ความปลอดภัย & บันทึกกิจกรรม (Firestore Audit Trail)</h3>
            </div>
            <p className="text-xs text-gray-500">
              นโยบาย Security Rules บังคับใช้: ป้องกันการปรับเปลี่ยน Role ตนเอง, จำกัดการเข้าถึงตามบทบาท (RBAC), และบันทึกประวัติแบบ Append-only
            </p>

            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-800">{log.action}: </span>
                    <span className="text-gray-600">{log.details}</span>
                  </div>
                  <span className="text-gray-400 shrink-0 ml-4 font-mono">
                    {log.actorName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4.6 รายงานและสถิติการใช้งาน */}
        {(activeMenu === 'reports' || activeMenu === 'overview') && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-black text-gray-900">รายงานสถิติการใช้งานของระบบ</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-gray-500">โครงงานที่สำเร็จ 100%</span>
                <p className="text-xl font-black text-gray-900 mt-1">{theses.filter(t => t.status === 'approved').length} เรื่อง</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-gray-500">โครงงานอยู่ระหว่างดำเนินงาน</span>
                <p className="text-xl font-black text-gray-900 mt-1">{theses.filter(t => t.status !== 'approved').length} เรื่อง</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-gray-500">อัตราการผ่านการอนุมัติ</span>
                <p className="text-xl font-black text-emerald-700 mt-1">94.2%</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h4 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#006644]" />
                <span>เพิ่มผู้ใช้งานในระบบ (บันทึกลง Firestore)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addUserError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addUserError}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายสมชาย ใจดี"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  บทบาท (Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                >
                  <option value="student">นิสิต (student)</option>
                  <option value="advisor">อาจารย์ที่ปรึกษา (advisor)</option>
                  <option value="admin">ผู้ดูแลระบบ (admin)</option>
                </select>
              </div>

              {newUserRole === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    รหัสนิสิต (10 หลัก)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 653040123-4"
                    value={newUserStudentId}
                    onChange={(e) => setNewUserStudentId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  อีเมล (@ku.th เท่านั้น) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="เช่น b653040123@ku.th"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="flex-1 py-2.5 text-xs font-bold bg-[#006644] hover:bg-[#005236] text-white rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isAddingUser ? 'กำลังบันทึก...' : 'บันทึกลงฐานข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal (ให้นิสิตสมัครใหม่ได้) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-rose-100">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-rose-100">
              <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-gray-900">
                  ยืนยันการลบบัญชีผู้ใช้งาน?
                </h4>
                <p className="text-xs text-rose-600 font-medium">
                  เพื่อให้นิสิตสามารถลงทะเบียนสมัครสมาชิกใหม่ได้
                </p>
              </div>
            </div>

            {/* Target User Info Card */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">ชื่อ-นามสกุล:</span>
                <span className="font-bold text-gray-900">{userToDelete.displayName}</span>
              </div>
              {userToDelete.studentId && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">รหัสนิสิต:</span>
                  <span className="font-mono font-bold text-gray-800">{userToDelete.studentId}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">อีเมล KU:</span>
                <span className="font-mono text-gray-800">{userToDelete.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">บทบาทปัจจุบัน:</span>
                <span className="font-bold text-indigo-700">{userToDelete.role}</span>
              </div>
            </div>

            {/* Warning Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              💡 <strong>คำแนะนำระบบ:</strong> หากข้อมูลของนิสิตไม่ถูกต้อง หรือนิสิตต้องการเริ่มลงทะเบียนใหม่ การลบบัญชีนี้จะนำข้อมูลออกจากฐานข้อมูล Cloud Firestore ทันที ทำให้นิสิตสามารถใช้อีเมล <strong>{userToDelete.email}</strong> สมัครสมาชิกใหม่ได้อีกครั้ง
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="flex-1 py-2.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="flex-1 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingUser ? 'กำลังลบบัญชี...' : 'ยืนยันลบเพื่อให้สมัครใหม่'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
