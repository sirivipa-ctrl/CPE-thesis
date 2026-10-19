import React, { useState } from 'react';
import { 
  Search, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  Shield, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Users, 
  Sparkles,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLogin: (role?: UserRole) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenLogin,
  onOpenSearch
}) => {
  const { currentUser, userProfile, activeRole, switchRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  const navItems = [
    { id: 'home', label: 'หน้าหลัก' },
    { id: 'archive', label: 'คลังปริญญานิพนธ์' },
    { id: 'guidelines', label: 'ข้อปฏิบัติ & แนวทาง' },
    { id: 'advisors', label: 'ข้อมูลอาจารย์ที่ปรึกษา' },
    { id: 'forms', label: 'แบบฟอร์ม & Templates' },
    { id: 'manuals', label: 'คู่มือจัดทำรูปเล่ม' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Maroon KU.SE Logo Badge */}
          <div className="w-11 h-11 rounded-lg bg-[#60121a] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
            KU.SE
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#111827] tracking-tight group-hover:text-emerald-700 transition">
              CPE Thesis Website
            </div>
            <div className="text-xs text-gray-500 font-medium">
              SmartThesis CPE · ระบบจัดการฐานข้อมูลปริญญานิพนธ์อัจฉริยะ
            </div>
          </div>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3">
          {/* Search Icon Button */}
          <button 
            onClick={onOpenSearch}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
            title="ค้นหาในคลังปริญญานิพนธ์"
          >
            <Search className="w-5 h-5" />
          </button>

          {(currentUser || userProfile) ? (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition text-sm"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-xs">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-gray-800 leading-tight">
                    {userProfile?.displayName || userProfile?.email || currentUser?.email || 'ผู้ใช้งาน'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    {activeRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : activeRole === 'advisor' ? 'อาจารย์ที่ปรึกษา' : 'นิสิต (Student)'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {/* User / Role Dropdown Menu */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">เข้าสู่ระบบในชื่อ</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {userProfile?.displayName || userProfile?.email || currentUser?.email}
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5">{userProfile?.email || currentUser?.email}</p>
                  </div>

                  {/* Dashboard Shortcut */}
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        if (activeRole === 'admin') onSelectTab('admin_dashboard');
                        else if (activeRole === 'advisor') onSelectTab('advisor_dashboard');
                        else onSelectTab('student_dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg font-medium transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      เปิดหน้าแดชบอร์ด ({activeRole})
                    </button>
                  </div>

                  {/* Verified Authenticated Session Info */}
                  <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                      สถานะบัญชีที่เข้าสู่ระบบ
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>
                        {activeRole === 'admin' 
                          ? 'ผู้ดูแลระบบส่วนกลาง (Admin)' 
                          : activeRole === 'advisor' 
                          ? 'อาจารย์ที่ปรึกษา (ยืนยันตัวตนแล้ว)' 
                          : 'นิสิต CPE (ผ่านการตรวจสอบ)'}
                      </span>
                    </div>
                  </div>

                  {/* Logout: Returns to Home Page as requested */}
                  <div className="pt-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        logout();
                        onSelectTab('home');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative flex items-center">
              <button
                onClick={() => onOpenLogin('student')}
                className="flex items-center gap-2 bg-[#006644] hover:bg-[#005236] text-white px-3.5 py-2 rounded-l-lg text-sm font-semibold shadow-xs transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </button>
              <button
                onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                className="bg-[#005236] hover:bg-[#00422b] text-white px-2 py-2 rounded-r-lg border-l border-emerald-600/40 text-sm font-semibold transition cursor-pointer"
                title="เลือกประเภทผู้เข้าใช้งาน"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {showLoginDropdown && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    เลือกบทบาทเพื่อเข้าสู่ระบบ
                  </div>
                  <button
                    onClick={() => {
                      setShowLoginDropdown(false);
                      onOpenLogin('student');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-[#006644] transition cursor-pointer text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#006644] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="leading-tight font-bold">นิสิต (Student)</div>
                      <div className="text-[10px] text-gray-400 font-normal">อีเมล @ku.th / Google KU</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginDropdown(false);
                      onOpenLogin('advisor');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="leading-tight font-bold">อาจารย์ที่ปรึกษา (Advisor)</div>
                      <div className="text-[10px] text-gray-400 font-normal">อาจารย์ประจำหลักสูตร 8 ท่าน</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginDropdown(false);
                      onOpenLogin('admin');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="leading-tight font-bold">ผู้ดูแลระบบ (Admin)</div>
                      <div className="text-[10px] text-gray-400 font-normal">ส่วนกลางภาควิชา CPE</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Pills (Matching Figma Design) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#1a56db] text-white shadow-xs font-semibold'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Quick link to Current Role Dashboard if logged in */}
          {currentUser && (
            <button
              onClick={() => {
                if (activeRole === 'admin') onSelectTab('admin_dashboard');
                else if (activeRole === 'advisor') onSelectTab('advisor_dashboard');
                else onSelectTab('student_dashboard');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition cursor-pointer ml-auto ${
                currentTab.includes('dashboard')
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              แดชบอร์ด{activeRole === 'admin' ? 'ผู้ดูแล' : activeRole === 'advisor' ? 'อาจารย์' : 'นิสิต'}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
