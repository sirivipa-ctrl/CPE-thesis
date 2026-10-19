import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Calendar, 
  MessageSquare, 
  FileUp, 
  Star, 
  ExternalLink,
  ShieldCheck,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Eye,
  BookOpen
} from 'lucide-react';
import { Thesis, ThesisFile, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  getThesisFiles, 
  uploadThesisFile, 
  getReviews, 
  submitReview,
  incrementThesisViews,
  deleteThesisFile
} from '../services/thesisService';
import { 
  getLocalPdfUrl, 
  resolveToBlobUrl,
  openPdfInNewTab,
  triggerActualFileDownload 
} from '../services/localFileStorage';
import { formatStudentNamesAnd } from '../utils/studentHelper';

interface ThesisDetailModalProps {
  thesis: Thesis | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const ThesisDetailModal: React.FC<ThesisDetailModalProps> = ({
  thesis,
  onClose,
  onRefresh
}) => {
  const { currentUser, userProfile, activeRole } = useAuth();
  const [files, setFiles] = useState<ThesisFile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  
  const [removingFileId, setRemovingFileId] = useState<string | null>(null);

  // In-App PDF Reader Modal and Embedded View states
  const [readingFile, setReadingFile] = useState<{ url: string; name: string } | null>(null);
  const [activeEmbeddedFileId, setActiveEmbeddedFileId] = useState<string | null>(null);

  // Review & Rating form state
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewerNameInput, setReviewerNameInput] = useState(userProfile?.displayName || '');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Advisor official decision form state
  const [decision, setDecision] = useState<Review['decision']>('approved');
  const [advisorComments, setAdvisorComments] = useState('');
  const [reviewingAdvisor, setReviewingAdvisor] = useState(false);
  const [advisorSuccess, setAdvisorSuccess] = useState(false);
  const [advisorError, setAdvisorError] = useState('');

  useEffect(() => {
    if (!thesis) return;

    const isApproved = thesis.status === 'approved' || thesis.status === 'archived';
    if (isApproved) {
      incrementThesisViews(thesis.id);
    }

    const loadData = async () => {
      setLoadingFiles(true);
      try {
        const [fetchedFiles, fetchedReviews] = await Promise.all([
          getThesisFiles(thesis.id),
          getReviews(thesis.id)
        ]);

        const resolvedFiles = await Promise.all(
          fetchedFiles.map(async (f) => {
            const freshUrl = await resolveToBlobUrl(f.fileUrl, f.id, thesis.id);
            return { ...f, fileUrl: freshUrl || f.fileUrl };
          })
        );

        // If thesis has pdfUrl but resolvedFiles is empty, synthesize a primary file entry
        const primarySafeUrl = await resolveToBlobUrl(thesis.pdfUrl, thesis.id, thesis.id);
        if (resolvedFiles.length === 0 && primarySafeUrl) {
          resolvedFiles.push({
            id: `primary_${thesis.id}`,
            thesisId: thesis.id,
            fileType: 'full_thesis',
            fileName: thesis.pdfFileName || `${thesis.code}_Full_Thesis.pdf`,
            fileUrl: primarySafeUrl,
            fileSize: 2.5 * 1024 * 1024,
            mimeType: 'application/pdf',
            version: 1,
            uploadedBy: thesis.createdBy || 'student',
            uploaderName: thesis.studentNames[0] || 'นิสิตเจ้าของโครงงาน',
            createdAt: thesis.createdAt || new Date() as any
          });
        }

        setFiles(resolvedFiles);
        if (resolvedFiles.length > 0) {
          setActiveEmbeddedFileId(resolvedFiles[0].id);
        }
        setReviews(fetchedReviews);
      } catch (err) {
        console.error("Error loading thesis details:", err);
      } finally {
        setLoadingFiles(false);
      }
    };

    loadData();
  }, [thesis]);

  if (!thesis) return null;

  const isApproved = thesis.status === 'approved' || thesis.status === 'archived';
  const authorsText = formatStudentNamesAnd(thesis);
  const canAdvisorReview = activeRole === 'advisor' || activeRole === 'admin';
  const isOwnerOrAdmin = currentUser?.uid === thesis.createdBy || 
                         (thesis.studentIds && thesis.studentIds.includes(currentUser?.uid || '')) ||
                         (userProfile?.displayName && thesis.studentNames.some(n => n.includes(userProfile.displayName))) ||
                         activeRole === 'admin';

  // Open PDF in dedicated In-App PDF Reader Modal
  const handleOpenPdf = async (fileUrl: string, fileName?: string, fileId?: string) => {
    const safeUrl = await resolveToBlobUrl(fileUrl, fileId, thesis?.id);
    if (!safeUrl) {
      alert('ไม่พบลิงก์สำหรับเปิดดูไฟล์ PDF');
      return;
    }
    setReadingFile({
      url: safeUrl,
      name: fileName || thesis?.pdfFileName || `${thesis?.code}_Thesis.pdf`
    });
  };

  // Handle removing file
  const handleRemoveFile = async (fileId: string) => {
    if (!confirm('คุณต้องการนำไฟล์เอกสารนี้ออกจากโครงงานใช่หรือไม่?')) return;

    setRemovingFileId(fileId);
    try {
      await deleteThesisFile(thesis.id, fileId);
      const updatedFiles = await getThesisFiles(thesis.id);
      setFiles(updatedFiles);
      onRefresh();
    } catch (err: any) {
      alert(`ไม่สามารถนำไฟล์ออกได้: ${err.message || 'เกิดข้อผิดพลาด'}`);
    } finally {
      setRemovingFileId(null);
    }
  };

  // Handle submitting review
  const handleUserReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    if (!reviewComments.trim()) {
      setReviewError('กรุณากรอกข้อคิดเห็นหรือรีวิวของคุณ');
      return;
    }

    const reviewerName = reviewerNameInput.trim() || userProfile?.displayName || 'ผู้ใช้งานทั่วไป';

    setSubmittingReview(true);
    try {
      await submitReview({
        thesisId: thesis.id,
        reviewerId: currentUser?.uid || 'community-user',
        reviewerName,
        reviewerRole: (activeRole as any) || 'student',
        decision: 'comment_only',
        comments: reviewComments.trim(),
        score: ratingInput * 20,
        formType: 'รีวิวความคิดเห็นและให้คะแนนผลงานจริง',
        rating: ratingInput
      } as any);

      setReviewSuccess(true);
      setReviewComments('');
      const updatedReviews = await getReviews(thesis.id);
      setReviews(updatedReviews);
      onRefresh();
      setTimeout(() => setReviewSuccess(false), 3500);
    } catch (err: any) {
      setReviewError(err.message || 'การส่งรีวิวผิดพลาด');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Advisor review submit
  const handleAdvisorReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdvisorError('');
    if (!advisorComments.trim()) {
      setAdvisorError('กรุณากรอกข้อเสนอแนะของอาจารย์');
      return;
    }

    setReviewingAdvisor(true);
    try {
      await submitReview({
        thesisId: thesis.id,
        reviewerId: currentUser?.uid || 'advisor-uid',
        reviewerName: userProfile?.displayName || thesis.advisorNames[0] || 'อาจารย์ที่ปรึกษา',
        reviewerRole: activeRole === 'admin' ? 'admin' : 'advisor',
        decision,
        comments: advisorComments.trim(),
        formType: 'การประเมินโครงงานวิศวกรรมคอมพิวเตอร์อย่างเป็นทางการ',
      });
      setAdvisorSuccess(true);
      setAdvisorComments('');
      const updatedReviews = await getReviews(thesis.id);
      setReviews(updatedReviews);
      onRefresh();
      setTimeout(() => setAdvisorSuccess(false), 3500);
    } catch (err: any) {
      setAdvisorError(err.message || 'การบันทึกการพิจารณาล้มเหลว');
    } finally {
      setReviewingAdvisor(false);
    }
  };

  const ratedReviews = reviews.filter(r => typeof (r as any).rating === 'number' || typeof r.score === 'number');
  const computedAverageRating = ratedReviews.length > 0
    ? Number((ratedReviews.reduce((sum, r) => sum + ((r as any).rating || (r.score ? r.score / 20 : 5)), 0) / ratedReviews.length).toFixed(0))
    : (typeof thesis.rating === 'number' && thesis.rating > 0 ? Math.round(thesis.rating) : 5);

  const keywordsList = thesis.keywords && thesis.keywords.length > 0
    ? thesis.keywords
    : ['AI', 'Machine Learning', 'Computer Engineering'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col my-auto font-sans antialiased text-gray-900">
        
        {/* Sticky Header with Code, Year, Category, Status & Close Button */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-30 shadow-2xs">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Project Code */}
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#006644] text-white shadow-2xs">
                {thesis.code}
              </span>

              {/* Year & Semester */}
              <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                ปีการศึกษา {thesis.academicYear} (ภาคเรียนที่ {thesis.semester || '1'})
              </span>

              {/* Research Category */}
              <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-emerald-50 text-[#006644] border border-emerald-200/80">
                {thesis.category}
              </span>

              {/* Status */}
              <span className={`text-xs font-semibold px-3 py-0.5 rounded-full flex items-center gap-1 ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-800'
                  : thesis.status === 'revision_required'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {isApproved && <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
                {isApproved ? 'อนุมัติแล้ว' : thesis.status === 'revision_required' ? 'ให้แก้ไข' : 'กำลังดำเนินการ'}
              </span>
            </div>

            {/* Title (Thai) */}
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug">
              {thesis.titleTh}
            </h2>

            {/* Title (English) */}
            {thesis.titleEn && (
              <p className="text-sm text-gray-500 font-medium italic">
                {thesis.titleEn}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer shrink-0"
            title="ปิดหน้าต่าง"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Unified Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-7 flex-1">
          
          {/* Key Metrics Strip (Screenshot 2: คะแนนเฉลี่ยจริง, รีวิวจริง, ยอดเข้าชมจริง, ไฟล์เอกสาร) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-xs text-center divide-x divide-gray-100">
            <div className="p-1">
              <span className="text-[11px] text-gray-400 font-medium block">คะแนนเฉลี่ยจริง</span>
              <div className="flex items-center justify-center gap-1 mt-1 font-bold">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-lg font-black text-gray-900">{computedAverageRating}</span>
                <span className="text-xs text-gray-400 font-normal">/ 5</span>
              </div>
            </div>

            <div className="p-1">
              <span className="text-[11px] text-gray-400 font-medium block">รีวิวจริง</span>
              <div className="mt-1">
                <span className="text-lg font-black text-gray-900">{reviews.length}</span>{' '}
                <span className="text-xs text-gray-500 font-normal">ความคิดเห็น</span>
              </div>
            </div>

            <div className="p-1">
              <span className="text-[11px] text-gray-400 font-medium block">ยอดเข้าชมจริง</span>
              <div className="mt-1">
                <span className="text-lg font-black text-gray-900">{thesis.viewCount || 0}</span>{' '}
                <span className="text-xs text-gray-500 font-normal">ครั้ง</span>
              </div>
            </div>

            <div className="p-1">
              <span className="text-[11px] text-gray-400 font-medium block">ไฟล์เอกสาร</span>
              <div className="mt-1">
                <span className="text-lg font-black text-emerald-700">{files.length}</span>{' '}
                <span className="text-xs text-gray-500 font-normal">ไฟล์</span>
              </div>
            </div>
          </div>

          {/* Two-Column Cards: ผู้จัดทำโครงงาน (AUTHORS) & อาจารย์ที่ปรึกษา (ADVISOR) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Card: ผู้จัดทำโครงงาน */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-1 shadow-2xs">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
                ผู้จัดทำโครงงาน (AUTHORS)
              </span>
              <h4 className="text-base font-bold text-gray-900">
                {authorsText}
              </h4>
              <p className="text-xs text-gray-500">
                สาขาวิชาวิศวกรรมคอมพิวเตอร์ มก.ฉกส.
              </p>
            </div>

            {/* Right Card: อาจารย์ที่ปรึกษา */}
            <div className="p-5 rounded-2xl bg-teal-50/20 border border-teal-200/90 space-y-1 shadow-2xs">
              <span className="text-xs text-teal-700 font-bold uppercase tracking-wider block">
                อาจารย์ที่ปรึกษา (ADVISOR)
              </span>
              <h4 className="text-base font-bold text-teal-800">
                {thesis.advisorNames.join(', ')}
              </h4>
              <p className="text-xs text-teal-600/80">
                อาจารย์ประจำสาขาวิชาวิศวกรรมคอมพิวเตอร์
              </p>
            </div>
          </div>

          {/* บทคัดย่อ (Abstract) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>บทคัดย่อ (Abstract)</span>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 bg-white text-xs sm:text-sm text-gray-700 leading-relaxed shadow-2xs whitespace-pre-line">
              {thesis.abstractTh || 'อยู่ระหว่างการเรียบเรียงบทคัดย่อฉบับสมบูรณ์'}
              {thesis.abstractEn && (
                <p className="text-xs text-gray-500 italic mt-3 pt-3 border-t border-gray-100">
                  {thesis.abstractEn}
                </p>
              )}
            </div>
          </div>

          {/* คำสำคัญ (KEYWORDS) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              คำสำคัญ (KEYWORDS)
            </span>
            <div className="flex flex-wrap gap-2">
              {keywordsList.map((kw, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* เอกสารและเล่มปริญญานิพนธ์ (PDF Attachments) - Matches Screenshot 1 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>เอกสารและเล่มปริญญานิพนธ์ (PDF Attachments)</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {files.length} ไฟล์
              </span>
            </div>

            {/* Files Container */}
            {files.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 text-center space-y-1">
                <p className="text-xs font-bold text-gray-700">
                  ยังไม่มีไฟล์เอกสารที่อัปโหลดสำหรับโครงงานนี้
                </p>
                <p className="text-[11px] text-gray-400">
                  นิสิตหรืออาจารย์สามารถอัปโหลดไฟล์เล่มฉบับสมบูรณ์หรือแบบฟอร์มได้ด้านล่าง
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  {files.map((file) => {
                    const isEmbedded = activeEmbeddedFileId === file.id;
                    return (
                      <div
                        key={file.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                          isEmbedded ? 'bg-emerald-50/40' : 'hover:bg-gray-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {file.fileName.endsWith('.docx') || file.fileName.endsWith('.doc') ? 'DOC' : 'PDF'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                                {file.fileName}
                              </p>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                ไฟล์จริงต้นฉบับ
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'เอกสารปริญญานิพนธ์'} • ผู้อัปโหลด: {file.uploaderName || authorsText}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                          {/* Toggle Embedded Viewer */}
                          <button
                            type="button"
                            onClick={() => setActiveEmbeddedFileId(isEmbedded ? null : file.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                              isEmbedded 
                                ? 'bg-[#006644] text-white' 
                                : 'bg-emerald-50 text-[#006644] hover:bg-emerald-100 border border-emerald-200'
                            }`}
                            title={isEmbedded ? 'ซ่อนการแสดงเอกสารในหน้านี้' : 'เปิดอ่านเอกสารในหน้านี้'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isEmbedded ? 'กำลังอ่านในหน้านี้' : 'เปิดอ่านในหน้านี้'}</span>
                          </button>

                          {/* Open Full Screen Modal Reader */}
                          <button
                            type="button"
                            onClick={() => handleOpenPdf(file.fileUrl, file.fileName, file.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                            title="เปิดอ่านเอกสารแบบเต็มจอ"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>เต็มจอ</span>
                          </button>

                          {/* Open in New Tab with safe blob link */}
                          <button
                            type="button"
                            onClick={() => openPdfInNewTab(file.fileUrl, file.id, thesis.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition cursor-pointer"
                            title="เปิดดูในแท็บใหม่"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-gray-600" />
                            <span>แท็บใหม่</span>
                          </button>

                          {/* Download button */}
                          <button
                            type="button"
                            onClick={() => triggerActualFileDownload(file.fileUrl, file.fileName, file.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition cursor-pointer"
                            title="ดาวน์โหลดไฟล์ PDF ต้นฉบับจริง"
                          >
                            <Download className="w-3.5 h-3.5 text-gray-600" />
                            <span>โหลด</span>
                          </button>

                          {/* Remove button for owner/admin */}
                          {isOwnerOrAdmin && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(file.id)}
                              disabled={removingFileId === file.id}
                              className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                              title="นำไฟล์ออกจากหน้าแสดงผล"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Embedded Viewer in Section 7 */}
                {activeEmbeddedFileId && (
                  <div className="rounded-2xl border border-gray-300 overflow-hidden bg-white shadow-xs">
                    {(() => {
                      const activeFile = files.find(f => f.id === activeEmbeddedFileId) || files[0];
                      if (!activeFile) return null;
                      return (
                        <>
                          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="text-xs font-bold truncate">{activeFile.fileName}</span>
                              <span className="text-[11px] text-gray-400 hidden sm:inline">
                                ({activeFile.fileSize ? `${(activeFile.fileSize / 1024).toFixed(1)} KB` : 'เอกสารปริญญานิพนธ์'})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenPdf(activeFile.fileUrl, activeFile.fileName, activeFile.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                                title="ขยายอ่านแบบเต็มจอ"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>เต็มจอ</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openPdfInNewTab(activeFile.fileUrl, activeFile.id, thesis.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                                title="เปิดในแท็บใหม่"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>แท็บใหม่</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => triggerActualFileDownload(activeFile.fileUrl, activeFile.fileName, activeFile.id)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                                title="ดาวน์โหลดไฟล์ PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>ดาวน์โหลด</span>
                              </button>
                            </div>
                          </div>
                          <div className="relative w-full h-[650px] bg-slate-100">
                            <iframe
                              src={`${activeFile.fileUrl}#toolbar=1`}
                              className="w-full h-full border-0"
                              title={activeFile.fileName}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* รีวิวและข้อคิดเห็นจริง - Matches Screenshot 3 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>รีวิวและข้อคิดเห็นจริง ({reviews.length} รายการ)</span>
              </div>
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>เฉลี่ย {computedAverageRating} / 5</span>
              </span>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 text-center">
                <p className="text-xs text-gray-400">
                  ยังไม่มีการบันทึกรีวิวสำหรับโครงงานนี้ คุณสามารถเป็นคนแรกที่ให้คะแนนและรีวิวผลงานได้ด้านล่าง
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{rev.reviewerName}</span>
                        <span className="text-[11px] text-gray-400">
                          ({rev.reviewerRole === 'advisor' ? 'อาจารย์' : rev.reviewerRole === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้อ่าน/นิสิต'})
                        </span>
                      </div>

                      {typeof (rev as any).rating === 'number' && (
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= ((rev as any).rating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{rev.comments}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Review & Rating Form Card - Matches Screenshot 3 */}
            <form onSubmit={handleUserReviewSubmit} className="border border-amber-300 rounded-2xl p-6 bg-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-900">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>เขียนรีวิวและให้คะแนนผลงานจริง (1-5 ดาว)</span>
                </div>
                <span className="text-[11px] text-gray-400">
                  ระบบจะคำนวณคะแนนเฉลี่ยจริงอัตโนมัติ
                </span>
              </div>

              {/* Star Rating Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-700 font-medium">คะแนนของคุณ:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 cursor-pointer transition hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (hoverRating || ratingInput)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {ratingInput} ดาว
                </span>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ชื่อผู้รีวิว
                </label>
                <input
                  type="text"
                  required
                  value={reviewerNameInput}
                  onChange={(e) => setReviewerNameInput(e.target.value)}
                  placeholder="เช่น นิสิตวิศวกรรมคอมพิวเตอร์"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white placeholder-gray-400 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              {/* Review Comments */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  ข้อคิดเห็น / รีวิวผลงาน
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="เขียนความคิดเห็น จุดเด่นของโครงงาน หรือข้อเสนอแนะ..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white placeholder-gray-400 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                {reviewError && (
                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {reviewError}
                  </span>
                )}
                {reviewSuccess && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> บันทึกรีวิวและอัปเดตคะแนนเรียบร้อยแล้ว
                  </span>
                )}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="ml-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submittingReview ? 'กำลังบันทึก...' : 'ส่งรีวิวและให้คะแนนจริง'}
                </button>
              </div>
            </form>

            {/* Official Advisor Decision Form (Only shown if Advisor or Admin is logged in) */}
            {canAdvisorReview && (
              <form onSubmit={handleAdvisorReviewSubmit} className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 mt-4">
                <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>สำหรับอาจารย์ที่ปรึกษา / คณะกรรมการ: บันทึกผลการพิจารณาอนุมัติ</span>
                </h4>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      value="approved"
                      checked={decision === 'approved'}
                      onChange={() => setDecision('approved')}
                    />
                    อนุมัติโครงงาน (Approved)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      value="revision_required"
                      checked={decision === 'revision_required'}
                      onChange={() => setDecision('revision_required')}
                    />
                    แจ้งแก้ไข (Revision Required)
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ข้อเสนอแนะและรายละเอียดที่ต้องปรับปรุง
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={advisorComments}
                    onChange={(e) => setAdvisorComments(e.target.value)}
                    placeholder="กรอกข้อเสนอแนะสำหรับการพัฒนาโครงงาน..."
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {advisorError && (
                    <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {advisorError}
                    </span>
                  )}
                  {advisorSuccess && (
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> บันทึกผลการพิจารณาเรียบร้อยแล้ว
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={reviewingAdvisor}
                    className="ml-auto px-5 py-2.5 rounded-xl bg-[#006644] hover:bg-[#005236] text-white font-bold text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {reviewingAdvisor ? 'กำลังบันทึก...' : 'บันทึกผลการพิจารณา'}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* In-App Full-Screen PDF Document Reader */}
      {readingFile && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex flex-col p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white rounded-t-2xl px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <BookOpen className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold truncate max-w-xs sm:max-w-xl text-white">{readingFile.name}</h3>
                <p className="text-[10px] text-gray-400">โปรแกรมเปิดอ่านเล่มปริญญานิพนธ์ฉบับจริง (CPE Thesis Reader)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openPdfInNewTab(readingFile.url, undefined, thesis.id)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">แท็บใหม่</span>
              </button>
              <button
                type="button"
                onClick={() => triggerActualFileDownload(readingFile.url, readingFile.name)}
                className="px-3 py-1.5 rounded-xl bg-[#006644] hover:bg-[#005236] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ดาวน์โหลด</span>
              </button>
              <button
                type="button"
                onClick={() => setReadingFile(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-gray-400 hover:text-white transition cursor-pointer ml-1"
                title="ปิดหน้าต่างอ่าน"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-slate-950 rounded-b-2xl overflow-hidden relative shadow-2xl">
            <iframe
              src={`${readingFile.url}#toolbar=1`}
              className="w-full h-full border-0 bg-slate-100"
              title={readingFile.name}
            />
          </div>
        </div>
      )}
    </div>
  );
};
