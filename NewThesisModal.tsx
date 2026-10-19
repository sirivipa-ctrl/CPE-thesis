import React, { useState } from 'react';
import { X, Plus, Trash2, FilePlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createThesis } from '../services/thesisService';
import { ADVISORS_DATA } from '../data/advisorsData';
import { OFFICIAL_RESEARCH_CATEGORIES } from '../data/researchCategories';
import { subscribeToCategories, ResearchCategoryDoc } from '../services/categoryService';
import { Thesis } from '../types';

interface NewThesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultAdvisor?: string;
}

export const NewThesisModal: React.FC<NewThesisModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultAdvisor
}) => {
  const { currentUser, userProfile } = useAuth();
  
  const [code, setCode] = useState(`CPE-2568-${Math.floor(100 + Math.random() * 900)}`);
  const [titleTh, setTitleTh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [abstractTh, setAbstractTh] = useState('');
  const [abstractEn, setAbstractEn] = useState('');
  const [academicYear, setAcademicYear] = useState('2568');
  const [semester, setSemester] = useState('1');
  const [category, setCategory] = useState(OFFICIAL_RESEARCH_CATEGORIES[0].name);
  const [liveCategories, setLiveCategories] = useState<ResearchCategoryDoc[]>([]);
  const [status, setStatus] = useState<Thesis['status']>('submitted');

  React.useEffect(() => {
    const unsub = subscribeToCategories((cats) => {
      setLiveCategories(cats);
    });
    return () => unsub();
  }, []);

  // Multi-students state
  const [students, setStudents] = useState<string[]>([
    userProfile?.displayName ? `${userProfile.displayName} (${userProfile.studentId || '653040123-4'})` : 'นิสิตผู้เสนอโครงงาน'
  ]);
  const [newStudentName, setNewStudentName] = useState('');

  // Multi-advisors state
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>(
    defaultAdvisor ? [defaultAdvisor] : [ADVISORS_DATA[0].name]
  );
  
  // Keywords
  const [keywordsInput, setKeywordsInput] = useState('AI, Machine Learning, Computer Engineering');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      setStudents([...students, newStudentName.trim()]);
      setNewStudentName('');
    }
  };

  const handleRemoveStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleToggleAdvisor = (name: string) => {
    if (selectedAdvisors.includes(name)) {
      if (selectedAdvisors.length > 1) {
        setSelectedAdvisors(selectedAdvisors.filter(a => a !== name));
      }
    } else {
      setSelectedAdvisors([...selectedAdvisors, name]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!titleTh.trim()) {
      setErrorMsg('กรุณากรอกชื่อโครงงานภาษาไทย');
      return;
    }

    if (students.length === 0) {
      setErrorMsg('กรุณาระบุรายชื่อนิสิตผู้จัดทำอย่างน้อย 1 คน');
      return;
    }

    if (selectedAdvisors.length === 0) {
      setErrorMsg('กรุณาเลือกอาจารย์ที่ปรึกษาอย่างน้อย 1 ท่าน');
      return;
    }

    setSubmitting(true);
    try {
      const keywords = keywordsInput
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      await createThesis({
        code,
        titleTh,
        titleEn,
        abstractTh: abstractTh || 'อยู่ระหว่างการเรียบเรียงบทคัดย่อฉบับสมบูรณ์',
        abstractEn,
        academicYear,
        semester,
        category,
        status,
        studentIds: [currentUser?.uid || 'stu-curr'],
        studentNames: students,
        advisorIds: selectedAdvisors.map(name => {
          const adv = ADVISORS_DATA.find(a => a.name === name);
          return adv ? adv.id : 'adv-general';
        }),
        advisorNames: selectedAdvisors,
        keywords,
        progressPercent: status === 'submitted' ? 20 : 10,
        currentMilestone: status === 'submitted' ? 'ยื่นข้อเสนอหัวข้อ รออาจารย์พิจารณาอนุมัติ' : 'ร่างแบบร่างโครงงาน',
        nextDeadline: 'สัปดาห์ที่ 3 (อนุมัติหัวข้อ)',
        createdBy: currentUser?.uid || 'anonymous',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">ยื่นข้อเสนอหัวข้อโครงงานวิศวกรรมคอมพิวเตอร์ (CPE-01)</h2>
              <p className="text-xs text-gray-500">บันทึกข้อมูลเข้าสู่ฐานข้อมูล Cloud Firestore</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Code, Year, Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">รหัสโครงงาน</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ปีการศึกษา</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
              >
                <option value="2568">2568</option>
                <option value="2567">2567</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ภาคการศึกษา</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
              >
                <option value="1">ภาคการศึกษาที่ 1</option>
                <option value="2">ภาคการศึกษาที่ 2</option>
              </select>
            </div>
          </div>

          {/* Thai Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ชื่อโครงงาน (ภาษาไทย) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ระบบตรวจจับความผิดปกติของใบยางพาราด้วยเครือข่ายประสาทเทียม"
              value={titleTh}
              onChange={(e) => setTitleTh(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* English Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ชื่อโครงงาน (ภาษาอังกฤษ)
            </label>
            <input
              type="text"
              placeholder="e.g. UAV-Based Rubber Leaf Disease Detection System"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              หมวดหมู่งานวิจัย (อ้างอิงความเชี่ยวชาญอาจารย์ 8 ท่าน) <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
            >
              {(liveCategories.length > 0 ? liveCategories : OFFICIAL_RESEARCH_CATEGORIES).map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} {cat.nameEn ? `(${cat.nameEn})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-student Authors (Requirement 7) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              รายชื่อนิสิตผู้จัดทำ (รองรับหลายคน) <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ชื่อ-นามสกุล และรหัสนิสิต (เช่น นายสมชาย ใจดี 653040999-9)"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
              />
              <button
                type="button"
                onClick={handleAddStudent}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                + เพิ่มสมาชิก
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {students.map((student, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {student}
                  {students.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(i)}
                      className="text-emerald-900 hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Multi-advisors (Requirement 7) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              อาจารย์ที่ปรึกษา (สามารถเลือกที่ปรึกษาหลักและที่ปรึกษาร่วมได้) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50/50">
              {ADVISORS_DATA.map((adv) => {
                const isSelected = selectedAdvisors.includes(adv.name);
                return (
                  <button
                    type="button"
                    key={adv.id}
                    onClick={() => handleToggleAdvisor(adv.name)}
                    className={`p-2.5 rounded-lg text-left text-xs transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{adv.name}</span>
                    <span className="text-[10px] text-gray-500 font-normal">ว่าง {adv.quotaMax - adv.quotaUsed}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-500">
              อาจารย์ที่เลือก: {selectedAdvisors.join(', ')}
            </p>
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              บทคัดย่อ / วัตถุประสงค์และขอบเขตโครงงานเบื้องต้น
            </label>
            <textarea
              rows={4}
              value={abstractTh}
              onChange={(e) => setAbstractTh(e.target.value)}
              placeholder="ระบุหลักการและเหตุผล วัตถุประสงค์ ขอบเขต และเทคโนโลยีที่จะนำมาใช้..."
              className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              คำสำคัญ (คั่นด้วยเครื่องหมายจุลภาค ,)
            </label>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-bold text-gray-700">สถานะเริ่มต้น:</span>
            <label className="flex items-center gap-1.5 text-xs text-gray-800 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="submitted"
                checked={status === 'submitted'}
                onChange={() => setStatus('submitted')}
              />
              ยื่นเสนออนุมัติทันที (submitted)
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-800 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === 'draft'}
                onChange={() => setStatus('draft')}
              />
              บันทึกเป็นแบบร่าง (draft)
            </label>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#006644] hover:bg-[#005236] text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'กำลังบันทึก...' : 'ยื่นข้อเสนอโครงงาน (CPE-01)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
