import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  FolderKanban, 
  BarChart3, 
  UploadCloud, 
  Edit3, 
  LogOut, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  User, 
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Send,
  Save,
  Check,
  Sparkles,
  Trash2,
  Download,
  FileUp,
  MessageSquare,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Thesis, ThesisFile, Review } from '../types';
import { 
  updateThesis, 
  recordActivityLog,
  uploadThesisFile,
  getThesisFiles,
  deleteThesisFile,
  getReviews
} from '../services/thesisService';
import { triggerActualFileDownload, openPdfInNewTab } from '../services/localFileStorage';

interface StudentDashboardProps {
  theses: Thesis[];
  onOpenNewThesis: () => void;
  onOpenThesis: (thesis: Thesis) => void;
  onSelectTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  theses,
  onOpenNewThesis,
  onOpenThesis,
  onSelectTab
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState<'overview' | 'propose' | 'my_projects' | 'progress' | 'submit_thesis' | 'edit_thesis' | 'feedback'>('overview');

  const myTheses = theses.filter(t => 
    (currentUser && t.studentIds.includes(currentUser.uid)) ||
    t.studentNames.some(name => userProfile?.displayName && name.includes(userProfile.displayName)) ||
    t.status === 'under_review' ||
    t.status === 'revision_required' ||
    t.status === 'submitted' ||
    t.status === 'approved'
  );

  const activeProject = myTheses[0] || theses[0];

  const [editTitleTh, setEditTitleTh] = useState(activeProject?.titleTh || '');
  const [editTitleEn, setEditTitleEn] = useState(activeProject?.titleEn || '');
  const [editAbstractTh, setEditAbstractTh] = useState(activeProject?.abstractTh || '');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [progressPercent, setProgressPercent] = useState(activeProject?.progressPercent || 68);
  const [progressNotes, setProgressNotes] = useState('');
  const [meetingNumber, setMeetingNumber] = useState('1');
  const [progressSuccess, setProgressSuccess] = useState(false);

  // File submission state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<ThesisFile['fileType']>('full_thesis');
  const [fileNotes, setFileNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [projectFiles, setProjectFiles] = useState<ThesisFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [removingFileId, setRemovingFileId] = useState<string | null>(null);

  // Advisor decisions and feedback state (sent back to student dashboard)
  const [advisorReviews, setAdvisorReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (activeProject?.id) {
      setLoadingFiles(true);
      getThesisFiles(activeProject.id)
        .then(files => setProjectFiles(files))
        .finally(() => setLoadingFiles(false));

      setLoadingReviews(true);
      getReviews(activeProject.id)
        .then(revs => {
          const sorted = [...revs].sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt as any).getTime() : 0);
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt as any).getTime() : 0);
            return timeB - timeA;
          });
          setAdvisorReviews(sorted);
        })
        .catch(err => console.warn("Failed to load reviews:", err))
        .finally(() => setLoadingReviews(false));
    }
  }, [activeProject?.id, activeProject?.status]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !activeProject) return;

    setUploadError('');
    setUploading(true);
    try {
      await uploadThesisFile(selectedFile, activeProject.id, fileType, fileNotes);
      setUploadSuccess(true);
      setSelectedFile(null);
      setFileNotes('');
      const updated = await getThesisFiles(activeProject.id);
      setProjectFiles(updated);
      setTimeout(() => setUploadSuccess(false), 3500);
    } catch (err: any) {
      setUploadError(err.message || 'การอัปโหลดไฟล์ล้มเหลว');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    if (!activeProject) return;
    if (!confirm('คุณต้องการนำไฟล์เอกสารนี้ออกจากหน้าแสดงผลใช่หรือไม่?')) return;

    setRemovingFileId(fileId);
    try {
      await deleteThesisFile(activeProject.id, fileId);
      const updated = await getThesisFiles(activeProject.id);
      setProjectFiles(updated);
    } catch (err: any) {
      alert(`ไม่สามารถนำไฟล์ออกได้: ${err.message || 'เกิดข้อผิดพลาด'}`);
    } finally {
      setRemovingFileId(null);
    }
  };

  const handleSaveThesisEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    setIsSavingEdit(true);
    try {
      await updateThesis(activeProject.id, {
        titleTh: editTitleTh,
        titleEn: editTitleEn,
        abstractTh: editAbstractTh,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`ไม่สามารถบันทึกได้: ${err.message || 'เกิดข้อผิดพลาด'}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSendProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    try {
      await updateThesis(activeProject.id, {
        progressPercent: Number(progressPercent),
        currentMilestone: `รายงานความคืบหน้าครั้งที่ ${meetingNumber}: ${progressNotes.substring(0, 40)}...`,
      });
      await recordActivityLog({
        thesisId: activeProject.id,
        action: 'SUBMITTED_PROGRESS',
        details: `นิสิตส่งรายงานความก้าวหน้าครั้งที่ ${meetingNumber} ถึงอาจารย์ที่ปรึกษา (${activeProject.advisorNames.join(', ')})`,
      });
      setProgressSuccess(true);
      setTimeout(() => setProgressSuccess(false), 3000);
    } catch (err: any) {
      alert(`ไม่สามารถส่งรายงานได้: ${err.message || 'เกิดข้อผิดพลาด'}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8fafc]">
      {/* Dark Navy Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a2540] text-white flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight leading-tight">
                SmartThesis CPE
              </h2>
              <p className="text-[11px] text-blue-200 font-medium">
                ระบบสำหรับนิสิต
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
              onClick={() => onOpenNewThesis()}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/30"
            >
              <FilePlus className="w-4 h-4 text-emerald-400" />
              <span>ยื่นขอที่ปรึกษา & หัวข้อ (CPE-01)</span>
            </button>

            <button
              onClick={() => setActiveMenu('my_projects')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'my_projects'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>โครงงานของฉัน ({myTheses.length})</span>
            </button>

            <button
              onClick={() => setActiveMenu('progress')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'progress'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>รายงานความคืบหน้า</span>
            </button>

            <button
              onClick={() => setActiveMenu('submit_thesis')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'submit_thesis'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>ส่งเล่มปริญญานิพนธ์</span>
            </button>

            <button
              onClick={() => setActiveMenu('edit_thesis')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-left ${
                activeMenu === 'edit_thesis'
                  ? 'bg-white text-[#0a2540] shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>แก้ไขข้อมูลปริญญานิพนธ์</span>
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
              <span>ผลอนุมัติ & ข้อคิดเห็นอาจารย์</span>
              {advisorReviews.length > 0 && (
                <span className="ml-auto text-[11px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                  {advisorReviews.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => onSelectTab('home')}
            className="w-full text-xs text-blue-200 hover:text-white py-1 text-left px-2 cursor-pointer"
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

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div>
            <span className="text-xs font-semibold text-blue-600 block">
              ระบบสำหรับนิสิต
            </span>
            <h1 className="text-2xl font-black text-[#111827]">
              {activeMenu === 'my_projects' ? 'โครงงานของฉัน' : activeMenu === 'progress' ? 'รายงานความคืบหน้าแก่อาจารย์' : activeMenu === 'submit_thesis' ? 'ส่งเล่มปริญญานิพนธ์ฉบับสมบูรณ์' : activeMenu === 'edit_thesis' ? 'แก้ไขข้อมูลปริญญานิพนธ์' : activeMenu === 'feedback' ? 'ผลการพิจารณาอนุมัติและข้อเสนอแนะจากอาจารย์' : 'ภาพรวม'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-gray-900">
                {userProfile?.displayName || 'นิสิต วิศวกรรมคอมพิวเตอร์'}
              </div>
              <div className="text-[11px] text-gray-500">
                {userProfile?.email || currentUser?.email || 'บัญชีนิสิต @ku.th'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-[#0f4c81] text-white rounded-3xl p-8 relative overflow-hidden shadow-sm">
          <div className="max-w-2xl space-y-2 relative z-10">
            <span className="text-xs font-semibold text-blue-200 tracking-wide uppercase">
              ยินดีต้อนรับกลับมา
            </span>
            <h2 className="text-3xl font-black tracking-tight">
              {userProfile?.displayName || 'นิสิต วิศวกรรมคอมพิวเตอร์'}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed pt-1">
              ติดตามข้อมูลและดำเนินงานที่เกี่ยวข้องกับโครงงานวิศวกรรมคอมพิวเตอร์ได้จากหน้าหลักนี้
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {activeProject ? (activeProject.status === 'approved' ? 'อนุมัติแล้ว' : activeProject.status === 'revision_required' ? 'รอแก้ไข' : 'รอพิจารณา') : 'ยังไม่ยื่น'}
              </div>
              <span className="text-xs text-gray-500 font-medium">สถานะโครงงาน</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {activeProject?.progressPercent || 68}%
              </div>
              <span className="text-xs text-gray-500 font-medium">ความคืบหน้า</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {activeProject?.nextDeadline || '18 วัน'}
              </div>
              <span className="text-xs text-gray-500 font-medium">กำหนดส่งถัดไป</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                8/12
              </div>
              <span className="text-xs text-gray-500 font-medium">งานที่เสร็จแล้ว</span>
            </div>
          </div>
        </div>

        {activeMenu === 'overview' && (
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 border border-emerald-700/60">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/20 text-emerald-200 text-xs font-bold border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>แบบฟอร์ม CPE-01 • ยื่นขออาจารย์ที่ปรึกษา</span>
              </div>
              <h3 className="text-xl font-black tracking-tight">
                ยื่นขออาจารย์ที่ปรึกษาและเสนอหัวข้อโครงงาน
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                นิสิตสามารถเลือกอาจารย์ที่ปรึกษาจากคณาจารย์ทั้ง 8 ท่าน และกรอกรายละเอียดโครงงานเพื่อส่งข้อมูลตรงไปยังอาจารย์ที่เลือกเพื่อพิจารณาอนุมัติ
              </p>
            </div>

            <button
              onClick={() => onOpenNewThesis()}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer shrink-0 flex items-center gap-2"
            >
              <FilePlus className="w-4 h-4 text-emerald-800" />
              <span>ยื่นขอที่ปรึกษาและเสนอหัวข้อใหม่</span>
            </button>
          </div>
        )}

        {(activeMenu === 'overview' || activeMenu === 'my_projects') && activeProject && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {activeProject.code}
                  </span>
                  <span className="text-xs text-gray-500">ปีการศึกษา {activeProject.academicYear}</span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-2">
                  {activeProject.titleTh}
                </h3>
                <p className="text-xs text-gray-500 italic mt-0.5">
                  {activeProject.titleEn}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenThesis(activeProject)}
                  className="px-4 py-2 rounded-xl bg-[#006644] hover:bg-[#005236] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>ดูรายละเอียดโครงงาน</span>
                </button>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
              activeProject.status === 'approved'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : activeProject.status === 'revision_required'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-blue-50 border-blue-300 text-blue-950'
            }`}>
              {activeProject.status === 'approved' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : activeProject.status === 'revision_required' ? (
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {activeProject.status === 'approved' 
                    ? `✓ อาจารย์ที่ปรึกษา (${activeProject.advisorNames.join(', ')}) อนุมัติโครงงานแล้ว` 
                    : activeProject.status === 'revision_required' 
                    ? `! อาจารย์ที่ปรึกษา (${activeProject.advisorNames.join(', ')}) แจ้งให้แก้ไขโครงงาน` 
                    : `⏳ รออาจารย์ที่ปรึกษา (${activeProject.advisorNames.join(', ')}) ตรวจสอบและอนุมัติ`}
                </h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {activeProject.currentMilestone || 'เมื่ออาจารย์ตรวจสอบและอนุมัติแล้ว จะสามารถดำเนินโครงงานต่อและส่งผลงานขั้นถัดไปได้'}
                </p>
              </div>
            </div>

            {/* Advisor Feedback & Decision directly sent to Student Dashboard */}
            <div className="bg-slate-50/80 rounded-2xl border border-gray-200 p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#006644]" />
                  <span className="text-xs font-bold text-gray-900">
                    ข้อเสนอแนะและผลการพิจารณาจากอาจารย์ที่ปรึกษา ({advisorReviews.length} รายการ)
                  </span>
                </div>
                {advisorReviews.length > 0 && (
                  <button
                    onClick={() => setActiveMenu('feedback')}
                    className="text-[11px] text-[#006644] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>ดูข้อเสนอแนะทั้งหมด</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {loadingReviews ? (
                <p className="text-xs text-gray-400 py-2 text-center">กำลังโหลดข้อมูลการพิจารณา...</p>
              ) : advisorReviews.length === 0 ? (
                <div className="text-xs text-gray-500 py-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>ยังไม่มีข้อเสนอแนะใหม่ เมื่ออาจารย์ที่ปรึกษาตรวจจะส่งข้อคิดเห็นมาแสดงที่นี่ทันที</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {advisorReviews.slice(0, 2).map((rev) => {
                    const isApproved = rev.decision === 'approved' || rev.decision === 'proposal_approved';
                    const isRevision = rev.decision === 'revision_required';
                    return (
                      <div
                        key={rev.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          isApproved
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : isRevision
                            ? 'bg-amber-50 border-amber-200 text-amber-950'
                            : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-500' : isRevision ? 'bg-amber-500' : 'bg-blue-500'}`} />
                            {rev.reviewerName} ({rev.reviewerRole === 'advisor' ? 'อาจารย์ที่ปรึกษา' : 'ผู้ตรวจ'})
                          </span>
                          <span className={`text-[11px] font-bold ${isApproved ? 'text-emerald-700' : isRevision ? 'text-amber-700' : 'text-gray-600'}`}>
                            {isApproved ? '✓ อนุมัติ' : isRevision ? '⚠️ ขอให้แก้ไข' : '💬 ข้อคิดเห็น'}
                          </span>
                        </div>
                        <p className="text-gray-800 leading-relaxed font-normal whitespace-pre-line pl-3.5 border-l-2 border-emerald-400">
                          {rev.comments}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 space-y-1">
                <span className="text-gray-400 font-medium">อาจารย์ที่ปรึกษา</span>
                <p className="font-bold text-emerald-800 text-sm">{activeProject.advisorNames.join(', ')}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 space-y-1">
                <span className="text-gray-400 font-medium">หมวดหมู่งานวิจัย</span>
                <p className="font-bold text-gray-800 text-sm">{activeProject.category}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 space-y-1">
                <span className="text-gray-400 font-medium">กำหนดส่งงานถัดไป</span>
                <p className="font-bold text-blue-800 text-sm">{activeProject.nextDeadline || '18 วัน'}</p>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'progress' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                รายงานความคืบหน้าโครงงาน (CPE-02 Logbook)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                บันทึกการเข้าพบอาจารย์ที่ปรึกษา {activeProject?.advisorNames.join(', ')} และปรับปรุงเปอร์เซ็นต์ความคืบหน้า
              </p>
            </div>

            <form onSubmit={handleSendProgress} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  การเข้าพบครั้งที่
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={meetingNumber}
                  onChange={(e) => setMeetingNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ความคืบหน้าของโครงงาน (%) : {progressPercent}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  สรุปงานที่นำเสนอ ปัญหาและอุปสรรคที่พบ
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="เขียนสรุปความก้าวหน้างานที่ได้ทำในสัปดาห์นี้..."
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                {progressSuccess && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> บันทึกและส่งรายงานให้อาจารย์ที่ปรึกษาเรียบร้อยแล้ว
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2.5 rounded-xl bg-[#006644] hover:bg-[#005236] text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่งรายงานความก้าวหน้า</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {activeMenu === 'submit_thesis' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                ส่งเล่มปริญญานิพนธ์ฉบับสมบูรณ์ (CPE-05)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                อัปโหลดไฟล์จริงต้นฉบับ ไม่ผ่านการดัดแปลง เพื่อส่งให้อาจารย์ที่ปรึกษาและกรรมการตรวจสอบ
              </p>
            </div>

            {activeProject ? (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {activeProject.code}
                    </span>
                    <p className="text-sm font-bold text-gray-900 mt-1">{activeProject.titleTh}</p>
                    <p className="text-xs text-gray-500">อาจารย์ที่ปรึกษา: {activeProject.advisorNames.join(', ')}</p>
                  </div>
                  <button
                    onClick={() => onOpenThesis(activeProject)}
                    className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>ดูหน้าต่างแสดงผลโครงงาน</span>
                  </button>
                </div>

                {/* File Upload Form */}
                <form onSubmit={handleFileUpload} className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <FileUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                          อัปโหลดไฟล์เอกสารจริง (PDF / Word)
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          ไฟล์จะถูกจัดเก็บเป็นไฟล์จริงต้นฉบับ ไม่มีการดัดแปลงใด ๆ
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">ขนาดสูงสุด 50 MB</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        เลือกไฟล์เอกสารฉบับจริง
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        required
                        onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#006644] file:text-white hover:file:bg-[#005236] cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-[11px] text-emerald-700 font-semibold mt-1.5">
                          ✓ ไฟล์ที่เลือก: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        ประเภทเอกสาร
                      </label>
                      <select
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white cursor-pointer"
                      >
                        <option value="full_thesis">เล่มปริญญานิพนธ์ฉบับสมบูรณ์ (Full Thesis)</option>
                        <option value="proposal">แบบขอเสนออนุมัติหัวข้อ (CPE-01)</option>
                        <option value="cpe02">สมุดบันทึกเข้าพบที่ปรึกษา (CPE-02)</option>
                        <option value="progress_report">รายงานก้าวหน้า 50% (CPE-03)</option>
                        <option value="presentation">สไลด์นำเสนอ (Presentation Slides)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      บันทึกเพิ่มเติม (ไม่บังคับ)
                    </label>
                    <input
                      type="text"
                      value={fileNotes}
                      onChange={(e) => setFileNotes(e.target.value)}
                      placeholder="เช่น เล่มฉบับแก้ไขตามข้อเสนอแนะอาจารย์ที่ปรึกษา ครั้งที่ 2"
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    {uploadError && (
                      <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {uploadError}
                      </span>
                    )}
                    {uploadSuccess && (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> อัปโหลดไฟล์จริงเรียบร้อยแล้ว
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={uploading || !selectedFile}
                      className="ml-auto px-5 py-2.5 rounded-xl bg-[#006644] hover:bg-[#005236] text-white font-bold text-xs transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      {uploading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>กำลังอัปโหลดไฟล์จริง...</span>
                        </>
                      ) : (
                        <>
                          <FileUp className="w-3.5 h-3.5" />
                          <span>อัปโหลดเอกสารจริงเข้าสู่ระบบ</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Uploaded Files Management */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                    <span>เอกสารที่อัปโหลดแล้ว ({projectFiles.length} ไฟล์)</span>
                    <span className="text-[11px] text-gray-400 font-normal">กดปุ่มถังขยะเพื่อเอาออกจากหน้าแสดงผล</span>
                  </h4>

                  {loadingFiles ? (
                    <div className="p-4 text-center text-xs text-gray-400">กำลังโหลดรายการไฟล์...</div>
                  ) : projectFiles.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400">
                      ยังไม่มีการอัปโหลดเอกสารในโครงงานนี้
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                      {projectFiles.map((file) => (
                        <div key={file.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs border border-rose-100 shrink-0">
                              {file.fileName.endsWith('.docx') || file.fileName.endsWith('.doc') ? 'DOC' : 'PDF'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{file.fileName}</p>
                              <p className="text-[11px] text-gray-400">
                                {(file.fileSize / 1024).toFixed(1)} KB • {file.fileType} {file.notes ? `• ${file.notes}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              onClick={() => triggerActualFileDownload(file.fileUrl, file.fileName, file.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#006644] hover:bg-[#005236] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                              title="ดาวน์โหลดไฟล์จริง"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>ดาวน์โหลด</span>
                            </button>
                            <button
                              onClick={() => openPdfInNewTab(file.fileUrl, file.id, activeProject.id)}
                              className="px-2.5 py-1.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                              title="เปิดดูในแท็บใหม่"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
                              <span className="text-[11px]">เปิดดู PDF</span>
                            </button>
                            <button
                              onClick={() => handleRemoveFile(file.id)}
                              disabled={removingFileId === file.id}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer"
                              title="เอาออกจากหน้าแสดงผล"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="text-[11px]">{removingFileId === file.id ? 'กำลังเอาออก...' : 'เอาออกจากหน้าแสดงผล'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">ยังไม่มีข้อมูลโครงงาน</p>
            )}
          </div>
        )}

        {activeMenu === 'edit_thesis' && activeProject && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                แก้ไขข้อมูลปริญญานิพนธ์ของตนเอง
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                ปรับปรุงชื่อเรื่องภาษาไทย ภาษาอังกฤษ และบทคัดย่อ
              </p>
            </div>

            <form onSubmit={handleSaveThesisEdit} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ชื่อโครงงาน (ภาษาไทย)
                </label>
                <input
                  type="text"
                  required
                  value={editTitleTh}
                  onChange={(e) => setEditTitleTh(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ชื่อโครงงาน (ภาษาอังกฤษ)
                </label>
                <input
                  type="text"
                  value={editTitleEn}
                  onChange={(e) => setEditTitleEn(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  บทคัดย่อภาษาไทย
                </label>
                <textarea
                  rows={4}
                  value={editAbstractTh}
                  onChange={(e) => setEditAbstractTh(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-4 h-4" /> บันทึกข้อมูลเรียบร้อยแล้ว
                  </span>
                )}
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="ml-auto px-5 py-2.5 rounded-xl bg-[#006644] hover:bg-[#005236] text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {activeMenu === 'feedback' && activeProject && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {activeProject.code}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-2">
                  ผลการพิจารณาอนุมัติและข้อเสนอแนะจากอาจารย์ที่ปรึกษา
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {activeProject.titleTh} • อาจารย์ที่ปรึกษา: {activeProject.advisorNames.join(', ')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  activeProject.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : activeProject.status === 'revision_required'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                  {activeProject.status === 'approved'
                    ? '✓ ผ่านการอนุมัติแล้ว'
                    : activeProject.status === 'revision_required'
                    ? '⚠️ แจ้งให้แก้ไขโครงงาน'
                    : '⏳ อยู่ระหว่างรอพิจารณา'}
                </span>
              </div>
            </div>

            {loadingReviews ? (
              <div className="p-8 text-center text-xs text-gray-400">กำลังโหลดข้อเสนอแนะจากอาจารย์...</div>
            ) : advisorReviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <Clock className="w-8 h-8 text-gray-400 mx-auto" />
                <h4 className="text-sm font-bold text-gray-700">ยังไม่มีประวัติการพิจารณาจากอาจารย์</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  เมื่ออาจารย์ที่ปรึกษา ({activeProject.advisorNames.join(', ')}) บันทึกผลการพิจารณาหรือมีข้อเสนอแนะ ข้อมูลจะส่งกลับมาแสดงที่แดชบอร์ดนี้ทันที
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {advisorReviews.map((rev, index) => {
                  const isApproved = rev.decision === 'approved' || rev.decision === 'proposal_approved';
                  const isRevision = rev.decision === 'revision_required';
                  return (
                    <div
                      key={rev.id || index}
                      className={`p-5 rounded-2xl border transition space-y-3 ${
                        isApproved
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : isRevision
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-slate-50 border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-200">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isApproved ? 'bg-emerald-200 text-emerald-900' : isRevision ? 'bg-amber-200 text-amber-900' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {isApproved ? '✓' : isRevision ? '!' : '💬'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">
                              {rev.reviewerName}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {rev.reviewerRole === 'advisor' ? 'อาจารย์ที่ปรึกษา' : 'คณะกรรมการ/ผู้ตรวจ'} • {rev.formType || 'การประเมินโครงงาน'}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isApproved ? 'bg-emerald-100 text-emerald-800' : isRevision ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {isApproved ? 'อนุมัติโครงงาน (Approved)' : isRevision ? 'แจ้งให้แก้ไข (Revision Required)' : 'ข้อคิดเห็น (Feedback)'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-800 leading-relaxed font-normal whitespace-pre-line bg-white/80 p-4 rounded-xl border border-gray-200/60 shadow-2xs">
                        <span className="font-bold text-gray-900 block mb-1">รายละเอียดข้อเสนอแนะจากอาจารย์:</span>
                        {rev.comments}
                      </div>

                      {isRevision && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                          <span className="text-[11px] text-amber-800 font-semibold">
                            อาจารย์แจ้งให้นิสิตแก้ไขโครงงานตามรายละเอียดข้างต้น
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveMenu('edit_thesis')}
                              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold transition cursor-pointer"
                            >
                              แก้ไขข้อมูล
                            </button>
                            <button
                              onClick={() => setActiveMenu('submit_thesis')}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <FileUp className="w-3.5 h-3.5" />
                              <span>ส่งเล่มแก้ไข</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
