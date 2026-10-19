import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Users,
  Phone,
  Shield,
  BookOpen,
  Building2,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { isValidKuEmail } from '../services/userService';
import { ADVISORS_DATA } from '../data/advisorsData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
  initialRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'student'
}) => {
  const { 
    loginWithGoogle, 
    loginWithKuEmail, 
    registerStudent, 
    loginAsAdvisor,
    registerAdvisor,
    loginAsAdmin,
    activeRole 
  } = useAuth();

  // Role Tab: 'student' | 'advisor' | 'admin'
  const [activeTab, setActiveTab] = useState<UserRole>(initialRole);

  useEffect(() => {
    if (isOpen && initialRole) {
      setActiveTab(initialRole);
    }
  }, [isOpen, initialRole]);

  // Sub-modes
  const [studentAuthMode, setStudentAuthMode] = useState<'login' | 'register'>('login');
  const [advisorAuthMode, setAdvisorAuthMode] = useState<'login' | 'register'>('login');

  // Form states - Student Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states - Student Register
  const [regFullName, setRegFullName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Form states - Advisor Login & Register
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>(ADVISORS_DATA[0]?.id || 'adv-01');
  const [useCustomAdvisorEmail, setUseCustomAdvisorEmail] = useState(false);
  const [advisorCustomEmail, setAdvisorCustomEmail] = useState('');
  const [advisorPassword, setAdvisorPassword] = useState('');
  const [showAdvisorPassword, setShowAdvisorPassword] = useState(false);
  const [advisorRememberMe, setAdvisorRememberMe] = useState(true);

  // Form states - Advisor Register (First-time password setup)
  const [regAdvisorId, setRegAdvisorId] = useState<string>(ADVISORS_DATA[0]?.id || 'adv-01');
  const [regAdvisorPassword, setRegAdvisorPassword] = useState('');
  const [regAdvisorConfirmPassword, setRegAdvisorConfirmPassword] = useState('');
  const [showRegAdvisorPassword, setShowRegAdvisorPassword] = useState(false);

  // Form states - Admin Login (Password only - as required)
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleTabChange = (tab: UserRole) => {
    setActiveTab(tab);
    resetMessages();
  };

  // 1. Student Login Handler
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!isValidKuEmail(loginEmail)) {
      setErrorMsg('กรุณาใช้อีเมลมหาวิทยาลัยเกษตรศาสตร์ (@ku.th) เท่านั้น');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithKuEmail(loginEmail, loginPassword);
      setSuccessMsg(`ยินดีต้อนรับ ${user.displayName} เข้าสู่ระบบสำเร็จ`);
      setTimeout(() => {
        onSuccess(user.role || 'student');
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบอีเมลและรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  // 2. Student Registration Handler
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!regFullName.trim()) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    if (!regStudentId.trim()) {
      setErrorMsg('กรุณากรอกรหัสนิสิต (10 หลัก)');
      return;
    }

    if (!isValidKuEmail(regEmail)) {
      setErrorMsg('ต้องใช้อีเมลที่ลงท้ายด้วย @ku.th หรือ @live.ku.th เท่านั้น');
      return;
    }

    if (!regPhone.trim()) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ติดต่อ');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('กรุณายอมรับเงื่อนไขและข้อตกลงการใช้งาน');
      return;
    }

    setLoading(true);
    try {
      const newUser = await registerStudent({
        displayName: regFullName,
        studentId: regStudentId,
        email: regEmail,
        phoneNumber: regPhone,
        password: regPassword
      });

      setSuccessMsg(`สมัครสมาชิกสำเร็จ! บันทึกข้อมูล ${newUser.displayName} เข้าสู่ฐานข้อมูลเรียบร้อยแล้ว`);
      
      setTimeout(() => {
        onSuccess('student');
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  // 3. Student Google KU Login
  const handleGoogleLogin = async () => {
    resetMessages();
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('เข้าสู่ระบบด้วยบัญชี Google สำเร็จ');
      setTimeout(() => {
        onSuccess(activeRole || 'student');
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  // 4. Advisor Login Handler
  const handleAdvisorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const targetEmail = useCustomAdvisorEmail ? advisorCustomEmail.trim() : '';
    if (useCustomAdvisorEmail && !isValidKuEmail(targetEmail)) {
      setErrorMsg('กรุณาใช้อีเมลมหาวิทยาลัยเกษตรศาสตร์ (@ku.th)');
      return;
    }

    if (!advisorPassword) {
      setErrorMsg('กรุณากรอกรหัสผ่านอาจารย์');
      return;
    }

    setLoading(true);
    try {
      const user = await loginAsAdvisor(selectedAdvisorId, advisorPassword, targetEmail);
      setSuccessMsg(`ยินดีต้อนรับ ${user.displayName} เข้าสู่ระบบอาจารย์สำเร็จ`);
      setTimeout(() => {
        onSuccess('advisor');
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'เข้าสู่ระบบอาจารย์ไม่สำเร็จ โปรดตรวจสอบรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  // 5. Advisor First-time Registration Handler
  const handleAdvisorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const advisor = ADVISORS_DATA.find(a => a.id === regAdvisorId) || ADVISORS_DATA[0];

    if (regAdvisorPassword.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (regAdvisorPassword !== regAdvisorConfirmPassword) {
      setErrorMsg('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const profile = await registerAdvisor({
        advisorId: advisor.id,
        email: advisor.email,
        fullName: advisor.name,
        password: regAdvisorPassword
      });

      setSuccessMsg(`กำหนดรหัสผ่านสำหรับ ${profile.displayName} สำเร็จ! เข้าสู่ระบบเรียบร้อย`);
      setTimeout(() => {
        onSuccess('advisor');
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'ไม่สามารถกำหนดรหัสผ่านได้');
    } finally {
      setLoading(false);
    }
  };

  // 6. Admin Login Handler (Password only - as required)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!adminPassword.trim()) {
      setErrorMsg('กรุณากรอกรหัสผ่านผู้ดูแลระบบ');
      return;
    }

    setLoading(true);
    try {
      const admin = await loginAsAdmin(adminPassword.trim());
      setSuccessMsg(`เข้าสู่ระบบผู้ดูแลระบบสำเร็จ ยินดีต้อนรับ ${admin.displayName}`);
      setTimeout(() => {
        onSuccess('admin');
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const currentAdvisor = ADVISORS_DATA.find(a => a.id === selectedAdvisorId) || ADVISORS_DATA[0];
  const currentRegAdvisor = ADVISORS_DATA.find(a => a.id === regAdvisorId) || ADVISORS_DATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Top Header Card based on Active Role Tab */}
        {activeTab === 'student' && (
          <div className="bg-[#006644] p-5 text-white flex items-center justify-between shrink-0 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight leading-tight">
                    SmartThesis CPE · นิสิต
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-100 border border-emerald-600/40">
                    มก.ฉกส.
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-medium">
                  ระบบสารสนเทศคลังปริญญานิพนธ์ วิศวกรรมคอมพิวเตอร์
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'advisor' && (
          <div className="bg-[#1e40af] p-5 text-white flex items-center justify-between shrink-0 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight leading-tight">
                    SmartThesis CPE · อาจารย์ที่ปรึกษา
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900 text-blue-100 border border-blue-400/40">
                    Faculty Portal
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  ระบบประเมินและติดตามโครงงานสำหรับคณาจารย์ CPE
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="bg-[#3730a3] p-5 text-white flex items-center justify-between shrink-0 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight leading-tight">
                    SmartThesis CPE · ผู้ดูแลระบบ
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-100 border border-indigo-400/40">
                    Admin Console
                  </span>
                </div>
                <p className="text-xs text-indigo-100 font-medium">
                  ระบบบริหารจัดการส่วนกลาง ภาควิชาวิศวกรรมคอมพิวเตอร์
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Role Navigation Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => handleTabChange('student')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-[#006644] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>นิสิต (Student)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('advisor')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'advisor'
                  ? 'bg-[#1e40af] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>อาจารย์ (Advisor)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#3730a3] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>แอดมิน (Admin)</span>
            </button>
          </div>

          {/* Notification Banners */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="font-medium leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#006644] text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="font-medium leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: STUDENT LOGIN & REGISTRATION */}
          {/* ============================================================== */}
          {activeTab === 'student' && (
            <div>
              {studentAuthMode === 'login' ? (
                /* 1A. Student Login Form */
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h4 className="font-black text-gray-900 text-sm">เข้าสู่ระบบสำหรับนิสิต</h4>
                      <p className="text-xs text-gray-500">ใช้อีเมลมหาวิทยาลัยเกษตรศาสตร์ (@ku.th)</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#006644] border border-emerald-200">
                      CPE Student Portal
                    </span>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      อีเมลมหาวิทยาลัยเกษตรศาสตร์ (@ku.th) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="b653040XXXX@ku.th"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700">
                        รหัสผ่าน <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('หากลืมรหัสผ่าน กรุณาติดต่อเจ้าหน้าที่ดูแลระบบสาขาวิศวกรรมคอมพิวเตอร์')}
                        className="text-[11px] text-[#006644] hover:underline cursor-pointer"
                      >
                        ลืมรหัสผ่าน?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#006644] focus:ring-[#006644] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-gray-600 cursor-pointer">
                      จดจำการเข้าสู่ระบบ
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[#006644] hover:bg-[#005236] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วยอีเมล KU'}</span>
                  </button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-white px-3 text-gray-400 font-semibold">หรือ</span>
                    </div>
                  </div>

                  {/* Google KU Login */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>เข้าสู่ระบบด้วย Google KU Account</span>
                  </button>

                  {/* Switch to Register */}
                  <div className="pt-2 text-center text-xs text-gray-500">
                    ยังไม่มีบัญชีนิสิต?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setStudentAuthMode('register');
                        resetMessages();
                      }}
                      className="font-bold text-[#006644] hover:underline cursor-pointer"
                    >
                      ลงทะเบียนนิสิตใหม่
                    </button>
                  </div>
                </form>
              ) : (
                /* 1B. Student Registration Form */
                <form onSubmit={handleStudentRegister} className="space-y-3.5">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h4 className="font-black text-gray-900 text-sm">ลงทะเบียนบัญชีนิสิตใหม่</h4>
                      <p className="text-xs text-gray-500">สำหรับนิสิตสาขาวิชาวิศวกรรมคอมพิวเตอร์</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#006644] border border-emerald-200">
                      CPE Register
                    </span>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="เช่น นายสมชาย เกษตรศาสตร์"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Student ID */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      รหัสนิสิต (10 หลัก) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={10}
                        placeholder="เช่น 6530401234"
                        value={regStudentId}
                        onChange={(e) => setRegStudentId(e.target.value)}
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      อีเมล KU (@ku.th) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="เช่น b6530401234@ku.th"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="08X-XXX-XXXX"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        กำหนดรหัสผ่าน <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#006644] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 rounded text-[#006644] focus:ring-[#006644] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="acceptTerms" className="text-xs text-gray-600 cursor-pointer">
                      ฉันยอมรับเงื่อนไขและข้อตกลงการใช้งานระบบ SmartThesis CPE
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[#006644] hover:bg-[#005236] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{loading ? 'กำลังบันทึกลงฐานข้อมูล...' : 'ยืนยันการสมัครสมาชิก'}</span>
                  </button>

                  {/* Switch back to Login */}
                  <div className="pt-2 text-center text-xs text-gray-500">
                    มีบัญชีอยู่แล้ว?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setStudentAuthMode('login');
                        resetMessages();
                      }}
                      className="font-bold text-[#006644] hover:underline cursor-pointer"
                    >
                      เข้าสู่ระบบ
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: ADVISOR LOGIN & PASSWORD SETUP */}
          {/* ============================================================== */}
          {activeTab === 'advisor' && (
            <div className="space-y-4">
              {/* Sub-mode switcher */}
              <div className="flex bg-blue-50/70 p-1 rounded-xl border border-blue-100">
                <button
                  type="button"
                  onClick={() => { setAdvisorAuthMode('login'); resetMessages(); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    advisorAuthMode === 'login'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-blue-900 hover:bg-blue-100/60'
                  }`}
                >
                  เข้าสู่ระบบอาจารย์
                </button>
                <button
                  type="button"
                  onClick={() => { setAdvisorAuthMode('register'); resetMessages(); }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    advisorAuthMode === 'register'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-blue-900 hover:bg-blue-100/60'
                  }`}
                >
                  ตั้งรหัสผ่านครั้งแรก / กำหนดรหัสผ่าน
                </button>
              </div>

              {advisorAuthMode === 'login' ? (
                /* 2A. Advisor Login Form */
                <form onSubmit={handleAdvisorLogin} className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h4 className="font-black text-gray-900 text-sm">เข้าสู่ระบบอาจารย์ที่ปรึกษา</h4>
                      <p className="text-xs text-gray-500">เลือกอาจารย์หรือใช้อีเมลประจำตำแหน่ง</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Advisor Portal
                    </span>
                  </div>

                  {/* Toggle between Dropdown & Custom Email */}
                  <div className="flex items-center justify-between text-xs text-gray-600 px-0.5">
                    <span className="font-bold text-gray-700">รายชื่ออาจารย์ประจำหลักสูตร</span>
                    <button
                      type="button"
                      onClick={() => setUseCustomAdvisorEmail(!useCustomAdvisorEmail)}
                      className="text-blue-700 hover:underline font-medium cursor-pointer"
                    >
                      {useCustomAdvisorEmail ? 'เลือกจากรายชื่อ 8 ท่าน' : 'ระบุอีเมลอื่น (@ku.th)'}
                    </button>
                  </div>

                  {!useCustomAdvisorEmail ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        เลือกอาจารย์ที่ปรึกษา (8 ท่าน) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedAdvisorId}
                        onChange={(e) => setSelectedAdvisorId(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white transition"
                      >
                        {ADVISORS_DATA.map((adv) => (
                          <option key={adv.id} value={adv.id}>
                            {adv.name} ({adv.email})
                          </option>
                        ))}
                      </select>

                      {/* Info Card of selected advisor */}
                      {currentAdvisor && (
                        <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-950 text-xs flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="font-bold">{currentAdvisor.name}</p>
                            <p className="text-[11px] text-blue-800 flex items-center gap-1.5">
                              <Mail className="w-3 h-3" />
                              <span>{currentAdvisor.email}</span>
                            </p>
                            <p className="text-[10px] text-blue-600 flex items-center gap-1.5">
                              <Building2 className="w-3 h-3" />
                              <span>{currentAdvisor.room}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-900">
                              รับแล้ว {currentAdvisor.quotaUsed}/{currentAdvisor.quotaMax} กลุ่ม
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        อีเมลอาจารย์ (@ku.th) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="เช่น thanawat.pha@ku.th"
                          value={advisorCustomEmail}
                          onChange={(e) => setAdvisorCustomEmail(e.target.value)}
                          className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      รหัสผ่านอาจารย์ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showAdvisorPassword ? 'text' : 'password'}
                        required
                        placeholder="กรอกรหัสผ่านอาจารย์"
                        value={advisorPassword}
                        onChange={(e) => setAdvisorPassword(e.target.value)}
                        className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdvisorPassword(!showAdvisorPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showAdvisorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="advisorRememberMe"
                      checked={advisorRememberMe}
                      onChange={(e) => setAdvisorRememberMe(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-600 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="advisorRememberMe" className="text-xs text-gray-600 cursor-pointer">
                      จดจำการเข้าสู่ระบบ
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'กำลังเข้าสู่ระบบอาจารย์...' : 'เข้าสู่ระบบอาจารย์ที่ปรึกษา'}</span>
                  </button>

                  <div className="pt-2 text-center text-xs text-gray-500">
                    ยังไม่เคยตั้งรหัสผ่านอาจารย์?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAdvisorAuthMode('register');
                        resetMessages();
                      }}
                      className="font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      กำหนดรหัสผ่านครั้งแรก
                    </button>
                  </div>
                </form>
              ) : (
                /* 2B. Advisor First-time Register / Set Password */
                <form onSubmit={handleAdvisorRegister} className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h4 className="font-black text-gray-900 text-sm">กำหนดรหัสผ่านอาจารย์ครั้งแรก</h4>
                      <p className="text-xs text-gray-500">สร้างรหัสผ่านเพื่อเข้าใช้งานระบบ SmartThesis CPE</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Advisor Register
                    </span>
                  </div>

                  {/* Choose Advisor */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      เลือกอาจารย์ประจำหลักสูตร <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={regAdvisorId}
                      onChange={(e) => setRegAdvisorId(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                    >
                      {ADVISORS_DATA.map((adv) => (
                        <option key={adv.id} value={adv.id}>
                          {adv.name} ({adv.email})
                        </option>
                      ))}
                    </select>

                    {currentRegAdvisor && (
                      <div className="mt-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>จะผูกบัญชีกับอีเมล <strong>{currentRegAdvisor.email}</strong> ใน Firebase Auth</span>
                      </div>
                    )}
                  </div>

                  {/* Set Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      กำหนดรหัสผ่าน (อย่างน้อย 6 ตัวอักษร) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegAdvisorPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={regAdvisorPassword}
                        onChange={(e) => setRegAdvisorPassword(e.target.value)}
                        className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegAdvisorPassword(!showRegAdvisorPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showRegAdvisorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ยืนยันรหัสผ่านอีกครั้ง <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regAdvisorConfirmPassword}
                      onChange={(e) => setRegAdvisorConfirmPassword(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{loading ? 'กำลังบันทึกรหัสผ่าน...' : 'บันทึกรหัสผ่านและสร้างบัญชีอาจารย์'}</span>
                  </button>

                  <div className="pt-2 text-center text-xs text-gray-500">
                    ตั้งรหัสผ่านเรียบร้อยแล้ว?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAdvisorAuthMode('login');
                        resetMessages();
                      }}
                      className="font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      กลับไปหน้าเข้าสู่ระบบ
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: ADMIN LOGIN (Password Only - As requested) */}
          {/* ============================================================== */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <form onSubmit={handleAdminLogin} className="space-y-4 pt-1">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h4 className="font-black text-gray-900 text-sm">เข้าสู่ระบบสำหรับผู้ดูแลระบบ</h4>
                    <p className="text-xs text-gray-500">กรอกรหัสผ่านเพื่อเข้าใช้งานระบบ</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Admin Security
                  </span>
                </div>

                {/* Password field only - no email field as explicitly instructed */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    รหัสผ่านผู้ดูแลระบบ (Admin Password) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      placeholder="กรอกรหัสผ่านผู้ดูแลระบบ"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>{loading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบ Admin'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
