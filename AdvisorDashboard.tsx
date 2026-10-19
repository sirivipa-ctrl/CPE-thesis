import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Search, 
  MessageSquare, 
  BookOpen, 
  BarChart3, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Check, 
  X, 
  ChevronRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Thesis, AdvisorFaculty } from '../types';
import { ADVISORS_DATA } from '../data/advisorsData';
import { updateThesis, submitReview } from '../services/thesisService';

interface AdvisorDashboardProps {
  theses: Thesis[];
  onOpenThesis: (thesis: Thesis) => void;
  onSelectTab: (tab: string) => void;
  onReviewSuccess: () => void;
}

export const AdvisorDashboard: React.FC<AdvisorDashboardProps> = ({
  theses,
  onOpenThesis,
  onSelectTab,
  onReviewSuccess
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<'overview' | 'students' | 'approvals' | 'duplicate_check' | 'feedback' | 'reports'>('overview');
  const [duplicateQuery, setDuplicateQuery] = useState('');

  // Requirement: "คลิกที่ชื่อของอาจารย์แล้วใส่รหัสผ่านเข้ามาแล้วไม่สามารถสลับเป็นของอาจารย์ท่านอื่นได้"
  // Locked to the authenticated advisor profile
  const currentAdvisorName = useMemo(() => {
    if (userProfile?.displayName) {
      const match = ADVISORS_DATA.find(a => 
        userProfile.displayName.includes(a.name) || 
        a.name.includes(userProfile.displayName) ||
        (userProfile.email && a.email.toLowerCase() === userProfile.email.toLowerCase())
      );
      if (match) return match.name;
      return userProfile.displayName;
    }
    return ADVISORS_DATA[0].name;
  }, [userProfile]);

  const facultyInfo = ADVISORS_DATA.find(a => a.name === currentAdvisorName) || ADVISORS_DATA[0];

  // CRITICAL REQUIREMENT: "ยื่นไปหาอาจารย์ท่านไหนจะขึ้นแค่อาจารย์ท่านนั้นคนเดียว"
  // Filter only projects that belong to THIS specific advisor!
  const myAdviseeTheses = theses.filter(t => 
    t.advisorNames.some(name => name.includes(currentAdvisorName) || currentAdvisorName.includes(name))
  );

  // Pending proposals submitted to THIS advisor
  const pendingTheses = myAdviseeTheses.filter(t => 
    t.status === 'submitted' || 
    t.status === 'under_review' || 
    t.status === 'revision_required'
  );

  const approvedTheses = myAdviseeTheses.filter(t => t.status === 'approved');

  // Fast approve handler: "อาจารย์ตรวจสอบแล้วจะอนุมัติกลับมาให้ทำต่อ"
  const handleApproveProposal = async (thesis: Thesis, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateThesis(thesis.id, {
        status: 'approved',
        progressPercent: Math.max(thesis.progressPercent || 0, 50),
        currentMilestone: 'อนุมัติหัวข้อเรียบร้อยแล้ว อนุญาตให้นิสิตดำเนินโครงงานต่อได้',
        nextDeadline: 'สัปดาห์ที่ 8 (สอบก้าวหน้า 50%)'
      });
      await submitReview({
        thesisId: thesis.id,
        reviewerId: currentUser?.uid || facultyInfo.id,
        reviewerName: facultyInfo.name,
        reviewerRole: 'advisor',
        decision: 'approved',
        comments: `อาจารย์ ${facultyInfo.name} ได้ตรวจสอบและอนุมัติหัวข้อโครงงานเรียบร้อยแล้ว อนุญาตให้กลุ่มนิสิตดำเนินงานโครงงานในขั้นตอนต่อไปได้`,
        formType: 'อนุมัติข้อเสนอโครงงาน (CPE-01)'
      });
      onReviewSuccess();
    } catch (err: any) {
      alert(`ไม่สามารถอนุมัติได้: ${err.message || 'เกิดข้อผิดพลาด'}`);
    }
  };

  // Request revision handler
  const handleRequestRevision = async (thesis: Thesis, e: React.MouseEvent) => {
    e.stopPropagation();
    const comment = prompt('กรุณาระบุสิ่งที่ต้องการให้นิสิตแก้ไขเพิ่มเติม:');
    if (!comment) return;

    try {
      await updateThesis(thesis.id, {
        status: 'revision_required',
        currentMilestone: `แจ้งให้นิสิตแก้ไข: ${comment.substring(0, 40)}...`,
        nextDeadline: '7 วัน (ส่งเล่มแก้ไข)'
      });
      await submitReview({
        thesisId: thesis.id,
        reviewerId: currentUser?.uid || facultyInfo.id,
        reviewerName: facultyInfo.name,
        reviewerRole: 'advisor',
        decision: 'revision_required',
        comments: comment,
        formType: 'แจ้งแก้ไขข้อเสนอโครงงาน'
      });
      onReviewSuccess();
    } catch (err: any) {
      alert(`ไม่สามารถบันทึกได้: ${err.message || 'เกิดข้อผิดพลาด'}`);
    }
  };

  // Duplicate checker matches
  const duplicateMatches = duplicateQuery.trim() === '' ? [] : theses.filter(t =>
    t.titleTh.toLowerCase().includes(duplicateQuery.toLowerCase()) ||
    t.titleEn.toLowerCase().includes(duplicateQuery.toLowerCase()) ||
    t.keywords.some(k => k.toLowerCase().includes(duplicateQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc]">
      {/* Dark Navy Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a2540] text-white flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight leading-tight">
                SmartThesis CPE
              </h2>
              <p className="text-[11px] text-blue-200 font-medium">
                ระบบสำหรับอาจารย์ที่ปรึกษา
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

            <button
              onClick={() => setActiveMenu('students')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'students'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>นิสิตในที่ปรึกษา ({myAdviseeTheses.length})</span>
            </button>

            <button
              onClick={() => setActiveMenu('approvals')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'approvals'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>คำขออนุมัติ</span>
              {pendingTheses.length > 0 && (
                <span className="ml-auto text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {pendingTheses.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu('duplicate_check')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'duplicate_check'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>ตรวจสอบหัวข้อซ้ำ</span>
            </button>

            <button
              onClick={() => setActiveMenu('feedback')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'feedback'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>ข้อเสนอแนะ</span>
            </button>

            <button
              onClick={() => onSelectTab('archive')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left text-blue-100 hover:bg-white/10"
            >
              <BookOpen className="w-4 h-4" />
              <span>คลังปริญญานิพนธ์</span>
            </button>

            <button
              onClick={() => setActiveMenu('reports')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'reports'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>รายงานและสถิติ</span>
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
        {/* Top Header Row with Locked Advisor Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <span className="text-xs font-semibold text-blue-600 block">
              ระบบสำหรับอาจารย์
            </span>
            <h1 className="text-2xl font-black text-[#111827]">
              {activeMenu === 'duplicate_check' 
                ? 'ระบบตรวจสอบหัวข้อซ้ำ' 
                : activeMenu === 'approvals' 
                ? 'คำขออนุมัติโครงงาน' 
                : activeMenu === 'students'
                ? 'นิสิตในที่ปรึกษา'
                : activeMenu === 'reports'
                ? 'รายงานและสถิติอาจารย์'
                : 'ภาพรวม'}
            </h1>
          </div>

          {/* Locked Authenticated Advisor Badge (No switching allowed) */}
          <div className="flex items-center gap-3 bg-white p-2.5 px-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                  ยืนยันตัวตนอาจารย์ที่ปรึกษา
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ล็อคบัญชี
                </span>
              </div>
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {facultyInfo.name} ({facultyInfo.room})
              </p>
              <p className="text-[10px] text-gray-500 font-mono">
                {facultyInfo.email}
              </p>
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
              {currentAdvisorName}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed pt-1">
              ระบบเฉพาะอาจารย์ที่ปรึกษา: แสดงเฉพาะคำขอและโครงงานที่นิสิตยื่นเสนอถึงท่านโดยตรง ({facultyInfo.room})
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
                {myAdviseeTheses.length} เรื่อง
              </div>
              <span className="text-xs text-gray-500 font-medium">นิสิตในที่ปรึกษา</span>
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
              <span className="text-xs text-gray-500 font-medium">รอการอนุมัติ</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {facultyInfo.quotaUsed}/{facultyInfo.quotaMax} กลุ่ม
              </div>
              <span className="text-xs text-gray-500 font-medium">โควตารับนิสิต</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {approvedTheses.length} เรื่อง
              </div>
              <span className="text-xs text-gray-500 font-medium">อนุมัติให้ดำเนินต่อแล้ว</span>
            </div>
          </div>
        </div>

        {/* SECTION: คำขออนุมัติที่ยื่นถึงอาจารย์ท่านนี้โดยตรง */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#111827]">
                คำขออนุมัติหัวข้อโครงงานที่ยื่นถึง {currentAdvisorName}
              </h3>
              <p className="text-xs text-gray-500">
                นิสิตยื่นเสนอหัวข้อ (CPE-01) หรือส่งเล่มแก้ไข เมื่ออนุมัติแล้วนิสิตจะสามารถดำเนินโครงงานต่อได้ทันที
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              รอพิจารณา {pendingTheses.length} รายการ
            </span>
          </div>

          {pendingTheses.length === 0 ? (
            <div className="p-8 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">ไม่มีคำขอที่รอการอนุมัติในขณะนี้</p>
              <p className="text-xs text-gray-500 mt-0.5">เมื่อมีนิสิตยื่นข้อเสนอโครงงานถึงท่าน จะแสดงในส่วนนี้โดยอัตโนมัติ</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingTheses.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onOpenThesis(item)}
                  className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/80 px-3 rounded-2xl transition cursor-pointer"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">
                        {item.code}
                      </span>
                      <span className="text-xs text-gray-500">ปี {item.academicYear}</span>
                      <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                        {item.status === 'revision_required' ? 'นิสิตส่งเล่มแก้ไข' : 'ยื่นเสนอหัวข้อใหม่'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-gray-900 hover:text-blue-700 transition">
                      {item.titleTh}
                    </h4>

                    <p className="text-xs text-gray-500">
                      ผู้จัดทำ: <span className="font-semibold text-gray-800">{item.studentNames.join(', ')}</span>
                    </p>

                    <p className="text-xs text-gray-600 line-clamp-2">
                      {item.abstractTh}
                    </p>
                  </div>

                  {/* Advisor Direct Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={(e) => handleApproveProposal(item, e)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#006644] hover:bg-[#005236] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>อนุมัติให้ทำต่อ</span>
                    </button>

                    <button
                      onClick={(e) => handleRequestRevision(item, e)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>แจ้งแก้ไข</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION: โครงงานทั้งหมดในที่ปรึกษา */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-black text-[#111827]">
                โครงงานทั้งหมดในความดูแลของ {currentAdvisorName} ({myAdviseeTheses.length} เรื่อง)
              </h3>
              <p className="text-xs text-gray-500">
                ติดตามความก้าวหน้าและการดำเนินงานของนิสิตทุกกลุ่ม
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {myAdviseeTheses.map(item => (
              <div
                key={item.id}
                onClick={() => onOpenThesis(item)}
                className="py-4 flex items-center justify-between gap-4 hover:bg-gray-50/80 px-2 rounded-xl transition cursor-pointer"
              >
                <div>
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.titleTh}</h4>
                  <p className="text-xs text-gray-500">{item.code} • นิสิต: {item.studentNames.join(', ')} • ความคืบหน้า: {item.progressPercent}%</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    item.status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {item.status === 'approved' ? 'อนุมัติแล้ว' : 'รอพิจารณา'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Duplicate Topic Checker Tool */}
        {activeMenu === 'duplicate_check' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div>
              <h3 className="text-lg font-bold text-gray-900">ระบบตรวจสอบหัวข้อซ้ำ (Duplicate Thesis Checker)</h3>
              <p className="text-xs text-gray-500 mt-1">
                พิมพ์ชื่อหัวข้อ คำสำคัญ หรือแนวคิดงานวิจัยเพื่อเปรียบเทียบความซ้ำซ้อนกับคลังปริญญานิพนธ์ย้อนหลัง เพื่อไม่ให้มีโปรเจกต์ซ้ำกัน
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={duplicateQuery}
                onChange={(e) => setDuplicateQuery(e.target.value)}
                placeholder="พิมพ์ชื่อหัวข้อภาษาไทย หรือภาษาอังกฤษเพื่อตรวจสอบ..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {duplicateQuery && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-gray-500">
                  พบผลการเปรียบเทียบ {duplicateMatches.length} รายการ
                </span>
                {duplicateMatches.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    ✓ ไม่พบหัวข้อที่ซ้ำซ้อนในฐานข้อมูล สามารถดำเนินการยื่นข้อเสนอหรืออนุมัติได้
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {duplicateMatches.map(m => (
                      <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{m.titleTh}</p>
                          <p className="text-xs text-gray-500">{m.code} • ปี {m.academicYear} • ที่ปรึกษา: {m.advisorNames.join(', ')}</p>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                          หัวข้อใกล้เคียง
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
