import React, { useState, useRef } from 'react';
import { X, Download, Printer, FileText, Check, ChevronLeft, ChevronRight, Edit3, Loader2 } from 'lucide-react';
import { OfficialProjectForm } from '../data/templatesAndManuals';
import { downloadElementAsPdf } from '../utils/pdfGenerator';

interface OfficialFormViewerProps {
  form: OfficialProjectForm | null;
  initialFormat: 'PDF' | 'Word';
  onClose: () => void;
}

export const OfficialFormViewer: React.FC<OfficialFormViewerProps> = ({
  form,
  initialFormat,
  onClose
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [logbookMeeting, setLogbookMeeting] = useState(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!form) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsGeneratingPdf(true);
    try {
      await downloadElementAsPdf(printAreaRef.current, form.title);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadWord = () => {
    const printContent = printAreaRef.current ? printAreaRef.current.innerHTML : '';
    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${form.title}</title>
        <style>
          body { font-family: 'TH Sarabun New', 'Angsana New', sans-serif; font-size: 16pt; line-height: 1.4; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
          th, td { border: 1px solid #000; padding: 6px; font-size: 14pt; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .dotted { border-bottom: 1px dotted #888; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${form.title}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // KU Emblem Component
  const KuSeal = () => (
    <div className="flex flex-col items-center justify-center text-center mx-auto mb-3">
      <div className="w-20 h-20 rounded-full border-2 border-emerald-900 bg-white flex flex-col items-center justify-center p-1 shadow-xs">
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-emerald-900 fill-current">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
          <path d="M50 15 L52 28 L64 22 L58 34 L72 35 L62 43 L74 50 L62 57 L72 65 L58 66 L64 78 L52 72 L50 85 L48 72 L36 78 L42 66 L28 65 L38 57 L26 50 L38 43 L28 35 L42 34 L36 22 L48 28 Z" opacity="0.85" />
          <circle cx="50" cy="50" r="14" fill="#60121a" />
          <text x="50" y="54" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="bold">มก.</text>
        </svg>
      </div>
      <span className="text-[10px] font-bold text-gray-700 tracking-wider mt-1">มหาวิทยาลัยเกษตรศาสตร์ • พ.ศ. ๒๔๘๖</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        {/* Navigation / Action Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 sticky top-0 bg-white z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs">
              {form.code}
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
                {form.title}
              </h3>
              <p className="text-[11px] text-gray-500">
                เอกสารทางการฉบับจริง สาขาวิชาวิศวกรรมคอมพิวเตอร์ มก.ฉกส.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Download Word Button */}
            <button
              onClick={handleDownloadWord}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition shadow-2xs cursor-pointer"
              title="ดาวน์โหลดเป็นไฟล์ Microsoft Word"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Word (.doc)</span>
            </button>

            {/* Print / Save as PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-xs font-bold transition shadow-2xs cursor-pointer"
              title="สั่งพิมพ์ผ่านเบราว์เซอร์ หรือบันทึกเป็น PDF"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span>พิมพ์เอกสาร</span>
            </button>

            {/* Real PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition shadow-xs cursor-pointer ${
                pdfSuccess 
                  ? 'bg-emerald-600' 
                  : 'bg-[#60121a] hover:bg-[#4a0d13]'
              }`}
              title="สร้างและดาวน์โหลดไฟล์ PDF จริงลงในเครื่อง"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด PDF จริง (.pdf)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body - Authentic A4 Page View (Printable) */}
        <div className="p-4 sm:p-8 bg-slate-100/80 overflow-y-auto">
          <div 
            ref={printAreaRef}
            className="bg-white max-w-[210mm] mx-auto p-8 sm:p-14 rounded-2xl shadow-md border border-gray-300 text-black font-sans leading-normal text-xs sm:text-sm print:m-0 print:p-0 print:shadow-none print:border-none"
            style={{ minHeight: '297mm' }}
          >

            {/* FORM 1: แบบขอเสนออนุมัติโครงงานวิศวกรรมคอมพิวเตอร์ (CPE-01) */}
            {form.id === 'form-01' && (
              <div className="space-y-4">
                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-base sm:text-lg font-bold">แบบขอเสนออนุมัติโครงงานวิศวกรรมคอมพิวเตอร์</h2>
                  <p className="font-semibold text-xs sm:text-sm">หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์</p>
                  <p className="text-xs">ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</p>
                  <p className="text-xs">มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร</p>
                  <p className="text-xs pt-1">ประจำภาค ...................... ปีการศึกษา ............</p>
                  <div className="border-b-2 border-black w-full pt-3"></div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-bold">ชื่อโครงงาน</span>
                    <div className="flex items-end gap-2 pt-1">
                      <span className="text-xs">(ภาษาไทย)</span>
                      <div className="border-b border-dotted border-gray-600 flex-1 h-5"></div>
                    </div>
                    <div className="flex items-end gap-2 pt-1">
                      <span className="text-xs">(ภาษาอังกฤษ)</span>
                      <div className="border-b border-dotted border-gray-600 flex-1 h-5"></div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="font-bold">นิสิตที่ทำโครงงาน</span>
                    <div className="grid grid-cols-1 gap-2 pt-1 pl-4">
                      <div className="flex justify-between items-center text-xs">
                        <span>1. ชื่อ-นามสกุล ............................................................................</span>
                        <span>รหัสประจำตัว .......................................</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span>2. ชื่อ-นามสกุล ............................................................................</span>
                        <span>รหัสประจำตัว .......................................</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span>3. ชื่อ-นามสกุล ............................................................................</span>
                        <span>รหัสประจำตัว .......................................</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="font-bold block mb-2">ประเภทโครงงาน</span>
                    <div className="grid grid-cols-2 gap-y-2 text-xs pl-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span>Web Application</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span>Game Development</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span>Mobile Application</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span>Theory Experiment (ML / AI)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span>Network & Data Communication</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span>Embedded System / IoTs</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span>Application Programming Interface (API)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5" />
                        <span>อื่นๆ ระบุ ...................................................</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">อาจารย์ที่ปรึกษา</span>
                      <div className="border-b border-dotted border-gray-600 flex-1 h-5"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">อาจารย์ที่ปรึกษาร่วม (ถ้ามี)</span>
                      <div className="border-b border-dotted border-gray-600 flex-1 h-5"></div>
                    </div>
                  </div>

                  <div className="pt-6 space-y-4">
                    <div className="flex flex-col items-end text-xs space-y-2 pr-6">
                      <p>ลงชื่อ .............................................................. นิสิตผู้เสนอโครงงาน</p>
                      <p>ลงชื่อ .............................................................. นิสิตผู้เสนอโครงงาน</p>
                      <p>ลงชื่อ .............................................................. นิสิตผู้เสนอโครงงาน</p>
                      <p>วันที่ ........../........../..........</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs">
                      <div>
                        <p>ลงชื่อ ..............................................................</p>
                        <p className="font-bold mt-1">อาจารย์ที่ปรึกษา</p>
                        <p className="text-[11px] text-gray-600 mt-1">วันที่ ........../........../..........</p>
                      </div>
                      <div>
                        <p>ลงชื่อ ..............................................................</p>
                        <p className="font-bold mt-1">อาจารย์ที่ปรึกษาร่วม</p>
                        <p className="text-[11px] text-gray-600 mt-1">วันที่ ........../........../..........</p>
                      </div>
                    </div>

                    <div className="text-center pt-6 text-xs">
                      <p>ลงชื่อ ..............................................................</p>
                      <p className="font-bold mt-1">อาจารย์ประจำวิชา</p>
                      <p className="text-[11px] text-gray-600 mt-1">วันที่ ........../........../..........</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORM 2: แบบประเมินการนำเสนอข้อเสนอโครงงานบทที่ 1 - 3 */}
            {form.id === 'form-02' && (
              <div className="space-y-4">
                <KuSeal />
                <div className="text-center space-y-1">
                  <h2 className="text-base sm:text-lg font-bold">แบบประเมินหัวข้อโครงงานวิศวกรรมคอมพิวเตอร์ ภาค ต้น / ปลาย ปีการศึกษา ............</h2>
                  <p className="font-semibold text-xs">หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์</p>
                  <p className="text-xs">ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</p>
                  <p className="text-xs">มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร</p>
                  <div className="border-b-2 border-black w-full pt-2"></div>
                </div>

                <div className="space-y-2 text-xs">
                  <p><span className="font-bold">ชื่อโครงงาน (ภาษาไทย):</span> .....................................................................................................................................................</p>
                  <p><span className="font-bold">(ภาษาอังกฤษ):</span> .....................................................................................................................................................</p>
                  <p><span className="font-bold">ชื่ออาจารย์ที่ปรึกษา:</span> .........................................................................................................................................</p>
                  <p><span className="font-bold">ชื่ออาจารย์ที่ปรึกษาร่วม:</span> .....................................................................................................................................</p>
                </div>

                <div className="pt-2 text-xs">
                  <span className="font-bold block mb-1">ผลการประเมินข้อเสนอโครงงาน</span>
                  <div className="grid grid-cols-2 gap-y-2 border border-gray-300 p-3 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span>1. วัตถุประสงค์:</span>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> เหมาะสม</label>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> ไม่เหมาะสม</label>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>2. ขอบเขตของโครงงาน:</span>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> เหมาะสม</label>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> ไม่เหมาะสม</label>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>3. วิธีการดำเนินงาน:</span>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> เหมาะสม</label>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> ไม่เหมาะสม</label>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>4. เอกสารและงานวิจัยที่เกี่ยวข้อง:</span>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> เหมาะสม</label>
                      <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" /> ไม่เหมาะสม</label>
                    </div>
                  </div>
                </div>

                {/* Score breakdown table */}
                <div className="pt-2 text-xs">
                  <table className="w-full border-collapse border border-black">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-left">การนำเสนอ (40 คะแนน)</th>
                        <th className="border border-black p-2 text-left">ทฤษฎีและงานวิจัยที่เกี่ยวข้อง (30 คะแนน)</th>
                        <th className="border border-black p-2 text-left">ความครบถ้วนของเนื้อหาในเอกสาร (30 คะแนน)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-2 align-top space-y-1">
                          <p>1. ความครบถ้วนของ Presentation</p>
                          <p>2. การนำเสนอของนิสิต</p>
                          <p>3. การตรงต่อเวลา</p>
                          <p>4. การแต่งกาย</p>
                          <p>5. การตอบคำถาม</p>
                        </td>
                        <td className="border border-black p-2 align-top space-y-1">
                          <p>1. ความสมบูรณ์ ครบถ้วน ของทฤษฎี</p>
                          <p>2. ความเข้าใจของทฤษฎีและงานวิจัยที่เกี่ยวข้อง</p>
                        </td>
                        <td className="border border-black p-2 align-top space-y-1">
                          <p>1. ความถูกต้องตามรูปแบบที่กำหนด</p>
                          <p>2. ความครบถ้วนเนื้อหาของเอกสาร (บทที่ 3)</p>
                        </td>
                      </tr>
                      <tr className="font-bold bg-gray-50">
                        <td colSpan={2} className="border border-black p-2 text-right">เกรดที่ได้ (A - F):</td>
                        <td className="border border-black p-2 text-center text-sm font-black">........................</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border border-gray-300 p-3 rounded-lg text-xs space-y-2">
                  <span className="font-bold block">สรุปผลการประเมิน:</span>
                  <div className="space-y-1.5 pl-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span><strong>ผ่าน</strong> คือ เห็นสมควรให้ปฏิบัติโครงงานในหัวข้อนี้ ตามที่นิสิตนำเสนอ</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span><strong>สมควรแก้ไข</strong> คือ เห็นสมควรให้ปฏิบัติโครงงานในหัวข้อนี้ แต่ควรจะมีการแก้ไขก่อน</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span><strong>ไม่ผ่าน</strong> คือ ไม่สมควรให้ปฏิบัติโครงงานในหัวข้อนี้</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 text-center text-xs space-y-1">
                  <p>ลงชื่อ ..................................................................................... กรรมการผู้ประเมิน</p>
                  <p>(.....................................................................................)</p>
                  <p>วันที่ .......... เดือน .............................. พ.ศ. ....................</p>
                </div>
              </div>
            )}

            {/* FORM 4: แบบประเมินการนำเสนอโครงงาน 100% */}
            {form.id === 'form-04-eval' && (
              <div className="space-y-4">
                <KuSeal />
                <div className="text-center space-y-1">
                  <h2 className="text-base sm:text-lg font-bold">แบบประเมินการสอบโครงงาน (โปรแกรมและรูปเล่มปริญญานิพนธ์)</h2>
                  <p className="text-xs">ภาค ............. ปีการศึกษา ..................</p>
                  <p className="text-xs">ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</p>
                  <p className="text-xs">มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร</p>
                  <div className="border-b-2 border-black w-full pt-2"></div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p><span className="font-bold">ชื่อโครงงาน (ภาษาไทย):</span> .....................................................................................................................................</p>
                  <p><span className="font-bold">(ภาษาอังกฤษ):</span> .....................................................................................................................................</p>
                  <p><span className="font-bold">นิสิตที่ทำโครงงาน:</span> 1. ....................................................... 2. ....................................................... 3. .......................................................</p>
                  <p><span className="font-bold">อาจารย์ที่ปรึกษา:</span> .................................................................... <span className="font-bold ml-4">อาจารย์ที่ปรึกษาร่วม:</span> ....................................................................</p>
                </div>

                <div className="pt-2 text-xs">
                  <span className="font-bold block mb-1">คะแนนการประเมินผลโครงงาน (โปรแกรมและรูปเล่มปริญญานิพนธ์) รวม 100 คะแนน</span>
                  <table className="w-full border-collapse border border-black">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-2">ส่วนที่ 1 การนำเสนอ (30 คะแนน)</th>
                        <th className="border border-black p-2">ส่วนที่ 2 ผลการดำเนินงานและการวิเคราะห์ (50 คะแนน)</th>
                        <th className="border border-black p-2">ส่วนที่ 3 ความสมบูรณ์เอกสาร (20 คะแนน)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-2 align-top text-[11px] space-y-1">
                          <p>1. ความครบถ้วนของ Presentation (8)</p>
                          <p>2. การนำเสนอของนิสิต (10)</p>
                          <p>3. การตรงต่อเวลา (4)</p>
                          <p>4. การแต่งกาย (3)</p>
                          <p>5. การตอบคำถาม (5)</p>
                        </td>
                        <td className="border border-black p-2 align-top text-[11px] space-y-1">
                          <p>1. ความสมบูรณ์ครบถ้วนของโครงงานตามขอบเขต (35)</p>
                          <p>2. การวิเคราะห์ผลและข้อเสนอแนะ (15)</p>
                        </td>
                        <td className="border border-black p-2 align-top text-[11px] space-y-1">
                          <p>1. ความถูกต้องตามรูปแบบที่กำหนด (8)</p>
                          <p>2. ความครบถ้วนเนื้อหาของเอกสาร (รูปเล่มปริญญานิพนธ์) (12)</p>
                        </td>
                      </tr>
                      <tr className="font-bold bg-gray-50 text-xs">
                        <td className="border border-black p-2 text-center">คะแนนได้: .......... / 30</td>
                        <td className="border border-black p-2 text-center">คะแนนได้: .......... / 50</td>
                        <td className="border border-black p-2 text-center">คะแนนได้: .......... / 20</td>
                      </tr>
                      <tr className="font-bold bg-emerald-50 text-xs">
                        <td colSpan={2} className="border border-black p-2 text-right">คะแนนรวมทั้งสิ้น (100 คะแนน) / เกรดที่คาดว่าจะได้รับ (A - F):</td>
                        <td className="border border-black p-2 text-center font-black text-sm">.......... คะแนน (เกรด ........)</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-[10px] text-gray-500 mt-1">* หมายเหตุ เกรดตั้งแต่ A-F โดย A=4, B+=3.5, B=3, C+=2.5, C=2, D+=1.5, D=1, F=0</p>
                </div>

                <div className="pt-2 text-xs space-y-1">
                  <span className="font-bold">ข้อเสนอแนะเพิ่มเติม:</span>
                  <div className="border border-dotted border-gray-400 p-4 h-20 rounded-lg"></div>
                </div>

                <div className="pt-4 text-center text-xs space-y-1">
                  <p>ลงชื่อ ..................................................................................... ผู้ประเมิน</p>
                  <p>(.....................................................................................)</p>
                  <p>วันที่ ........../........../..........</p>
                </div>
              </div>
            )}

            {/* FORM 5: แบบฟอร์มยืนยันการขอนำเสนอโครงงานวิศวกรรมคอมพิวเตอร์ */}
            {form.id === 'form-05-confirm' && (
              <div className="space-y-4">
                <KuSeal />
                <div className="text-center space-y-1">
                  <h2 className="text-base sm:text-lg font-bold">แบบฟอร์มยืนยันการขอนำเสนอโครงงานวิศวกรรมคอมพิวเตอร์</h2>
                  <p className="text-xs">ภาค ............. ปีการศึกษา ............</p>
                  <p className="text-xs">ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</p>
                  <p className="text-xs">มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร</p>
                  <div className="border-b-2 border-black w-full pt-2"></div>
                </div>

                <div className="space-y-2 text-xs">
                  <p><span className="font-bold">ชื่อโครงงาน (ภาษาไทย):</span> .....................................................................................................................................</p>
                  <p><span className="font-bold">(ภาษาอังกฤษ):</span> .....................................................................................................................................</p>
                  <div className="pt-1">
                    <span className="font-bold">นิสิตที่ทำโครงงาน:</span>
                    <div className="pl-4 space-y-1 pt-1">
                      <p>1. ชื่อ-นามสกุล ............................................................................ รหัสประจำตัว .......................................</p>
                      <p>2. ชื่อ-นามสกุล ............................................................................ รหัสประจำตัว .......................................</p>
                      <p>3. ชื่อ-นามสกุล ............................................................................ รหัสประจำตัว .......................................</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-300 p-4 rounded-xl text-xs space-y-3">
                  <span className="font-bold block">ประเภทการนำเสนอ:</span>
                  <div className="pl-4 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span>นำเสนอบทที่ 1 - 3 (สำหรับวิชาเตรียมความพร้อมโครงงาน)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      <span>นำเสนอโครงงาน 100% (สำหรับวิชาโครงงานวิศวกรรมคอมพิวเตอร์)</span>
                    </label>
                  </div>

                  <span className="font-bold block pt-2 border-t border-gray-200">การอนุญาตให้นำเสนอโครงงาน:</span>
                  <div className="flex items-center gap-6 pl-4">
                    <label className="flex items-center gap-2 font-bold text-emerald-800 cursor-pointer">
                      <input type="checkbox" />
                      <span>[ ] อนุญาต</span>
                    </label>
                    <label className="flex items-center gap-2 font-bold text-rose-800 cursor-pointer">
                      <input type="checkbox" />
                      <span>[ ] ไม่อนุญาต</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-600 pl-4">ระบุเหตุผล (หากไม่อนุญาต): ....................................................................................................................................</p>
                </div>

                <div className="pt-4 text-xs space-y-6">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p>ลงชื่อ ..............................................</p>
                      <p>นิสิตที่ทำโครงงาน</p>
                      <p className="text-[10px] text-gray-500">วันที่ ...../...../.....</p>
                    </div>
                    <div>
                      <p>ลงชื่อ ..............................................</p>
                      <p>นิสิตที่ทำโครงงาน</p>
                      <p className="text-[10px] text-gray-500">วันที่ ...../...../.....</p>
                    </div>
                    <div>
                      <p>ลงชื่อ ..............................................</p>
                      <p>นิสิตที่ทำโครงงาน</p>
                      <p className="text-[10px] text-gray-500">วันที่ ...../...../.....</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-200">
                    <div>
                      <p>ลงชื่อ ..............................................</p>
                      <p className="font-bold">อาจารย์ที่ปรึกษา</p>
                      <p className="text-[10px] text-gray-500">วันที่ ...../...../.....</p>
                    </div>
                    <div>
                      <p>ลงชื่อ ..............................................</p>
                      <p className="font-bold">อาจารย์ที่ปรึกษาร่วม</p>
                      <p className="text-[10px] text-gray-500">วันที่ ...../...../.....</p>
                    </div>
                    <div>
                      <p>ลงชื่อ ..............................................</p>
                      <p className="font-bold">อาจารย์ผู้ประสานงานรายวิชา</p>
                      <p className="text-[10px] text-gray-500">วันที่ ...../...../.....</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORM 6 & 7: สมุดบันทึกรายงานการเข้าพบอาจารย์ที่ปรึกษา (Logbook) */}
            {(form.id === 'form-other-logbook' || form.id === 'form-other-scoresheet') && (
              <div className="space-y-4">
                <KuSeal />
                <div className="text-center space-y-1">
                  <h2 className="text-base sm:text-lg font-bold">สมุดบันทึกการเข้าพบอาจารย์ที่ปรึกษาโครงงาน</h2>
                  <p className="font-semibold text-xs">ปีการศึกษา 2567</p>
                  <p className="text-xs">หลักสูตรวิศวกรรมคอมพิวเตอร์ ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</p>
                  <div className="border-b-2 border-black w-full pt-2"></div>
                </div>

                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-950">เลือกครั้งที่เข้าพบเพื่อพิมพ์ / กรอก:</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        onClick={() => setLogbookMeeting(num)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                          logbookMeeting === num
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center font-bold text-sm py-1 bg-gray-100 rounded-lg">
                  สรุปบันทึกการเข้าพบอาจารย์ที่ปรึกษา ครั้งที่ {logbookMeeting}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold">ตอนที่ 1 ส่วนของนิสิต (สรุปผลการทำโครงงาน)</span>
                    <div className="border border-dotted border-gray-400 p-3 h-24 rounded-lg mt-1">
                      ..................................................................................................................................................................................................
                    </div>
                  </div>

                  <div>
                    <span className="font-bold">ตอนที่ 2 ส่วนของอาจารย์ที่ปรึกษา (ข้อเสนอแนะที่ควรปรับปรุง)</span>
                    <div className="border border-dotted border-gray-400 p-3 h-20 rounded-lg mt-1">
                      ..................................................................................................................................................................................................
                    </div>
                  </div>

                  <div>
                    <span className="font-bold block mb-1">คะแนนการรายงานความก้าวหน้า (เฉพาะอาจารย์ที่ปรึกษา):</span>
                    <table className="w-full border-collapse border border-gray-400 text-[11px]">
                      <tbody>
                        <tr>
                          <td className="border border-gray-400 p-1.5 w-24 text-center font-bold"><input type="checkbox" /> 10 คะแนน</td>
                          <td className="border border-gray-400 p-1.5">ทำงานได้ &lt; 50% (งานออกมาไม่ดี ไม่ตรงกับขอบเขต) เข้าพบอาจารย์ที่ปรึกษาน้อย</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 p-1.5 w-24 text-center font-bold"><input type="checkbox" /> 15 คะแนน</td>
                          <td className="border border-gray-400 p-1.5">ทำงานได้ &lt; 60% (งานออกมาตรงกับขอบเขต แต่ไม่ใช่ฟังก์ชันหลัก) เข้าพบอาจารย์ที่ปรึกษาบ้าง</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 p-1.5 w-24 text-center font-bold"><input type="checkbox" /> 20 คะแนน</td>
                          <td className="border border-gray-400 p-1.5">ทำงานได้ &lt; 70% (งานออกมาตรงกับขอบเขต ฟังก์ชันหลักทำงานได้ในระดับที่น่าพอใจ) เข้าพบสม่ำเสมอ</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 p-1.5 w-24 text-center font-bold"><input type="checkbox" /> 25 คะแนน</td>
                          <td className="border border-gray-400 p-1.5">ทำงานได้ &lt; 80% (งานออกมาตรงกับขอบเขต ฟังก์ชันหลักทำงานได้อยู่ในขั้นดี) เข้าพบสม่ำเสมอ</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 p-1.5 w-24 text-center font-bold"><input type="checkbox" /> 30 คะแนน</td>
                          <td className="border border-gray-400 p-1.5">ทำงานได้ &gt; 80% (งานออกมาตรงกับขอบเขต ฟังก์ชันหลักทำงานได้อยู่ในขั้นดีมาก) เข้าพบสม่ำเสมอ</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-4 text-xs">
                    <div>
                      <p>ลายมือชื่อ ..............................................</p>
                      <p>(ชื่ออาจารย์ที่ปรึกษา)</p>
                      <p className="text-[10px] text-gray-500">วันที่ ...../...../.....</p>
                    </div>
                    <div>
                      <p>ลายมือชื่อ ..............................................</p>
                      <p>(ชื่ออาจารย์ที่ปรึกษาร่วม)</p>
                      <p className="text-[10px] text-gray-500">วันที่ ...../...../.....</p>
                    </div>
                    <div>
                      <p>ลายมือชื่อ ..............................................</p>
                      <p>(ชื่ออาจารย์ประจำวิชา)</p>
                      <p className="text-[10px] text-gray-500">วันที่ ...../...../.....</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORM 8: แบบอนุมัติขอบเขตโครงงานวิศวกรรมคอมพิวเตอร์ */}
            {form.id === 'form-other-scope' && (
              <div className="space-y-4">
                <div className="text-center space-y-1 mb-4">
                  <h2 className="text-base sm:text-lg font-bold">แบบอนุมัติขอบเขตโครงงานวิศวกรรมคอมพิวเตอร์</h2>
                  <p className="text-xs">ภาค ............. ปีการศึกษา ............</p>
                  <p className="text-xs">ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</p>
                  <div className="border-b-2 border-black w-full pt-2"></div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p><span className="font-bold">ชื่อโครงงาน:</span> .....................................................................................................................................</p>
                  <p><span className="font-bold">นิสิตที่ทำโครงงาน:</span> 1. ....................................................... 2. ....................................................... 3. .......................................................</p>
                </div>

                <div className="pt-2 text-xs">
                  <p className="font-bold text-center mb-1">ตารางแสดงขอบเขตโครงงานพร้อมค่าน้ำหนักของแต่ละหัวข้อ</p>
                  <table className="w-full border-collapse border border-black text-[11px]">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-1.5 w-10 text-center">ที่</th>
                        <th className="border border-black p-1.5 text-left">รายละเอียดขอบเขตโครงงาน</th>
                        <th className="border border-black p-1.5 w-24 text-center">ค่าน้ำหนัก (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 18 }).map((_, idx) => (
                        <tr key={idx}>
                          <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                          <td className="border border-black p-1 text-gray-400">.....................................................................................................................</td>
                          <td className="border border-black p-1 text-center text-gray-400">.......... %</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td colSpan={2} className="border border-black p-1.5 text-right font-black">รวมทั้งหมด</td>
                        <td className="border border-black p-1.5 text-center font-black">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 text-center text-xs">
                  <div>
                    <p>ลงชื่อ ..............................................................</p>
                    <p className="font-bold mt-1">อาจารย์ที่ปรึกษา</p>
                  </div>
                  <div>
                    <p>ลงชื่อ ..............................................................</p>
                    <p className="font-bold mt-1">อาจารย์ที่ปรึกษาร่วม (ถ้ามี)</p>
                  </div>
                  <div className="pt-2">
                    <p>ลงชื่อ ..............................................................</p>
                    <p className="font-bold mt-1">กรรมการคนที่ 1</p>
                  </div>
                  <div className="pt-2">
                    <p>ลงชื่อ ..............................................................</p>
                    <p className="font-bold mt-1">กรรมการคนที่ 2</p>
                  </div>
                </div>
              </div>
            )}

            {/* FORM 4-RUBRIC: เกณฑ์การประเมินโครงงาน 100% (rubric) */}
            {form.id === 'form-04-rubric' && (
              <div className="space-y-4 text-xs">
                <div className="text-center space-y-1 mb-2">
                  <h2 className="text-base sm:text-lg font-bold">เกณฑ์การประเมินสอบโครงงานสมบูรณ์ (rubric) (นิสิตไม่ต้องปริ้น)</h2>
                  <div className="border-b-2 border-black w-full pt-1"></div>
                </div>

                <table className="w-full border-collapse border border-black text-[11px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-2 w-28">ส่วนที่</th>
                      <th className="border border-black p-2 w-48 text-left">หัวข้อการประเมิน</th>
                      <th className="border border-black p-2 w-14 text-center">คะแนนเต็ม</th>
                      <th className="border border-black p-2 text-left">เกณฑ์การให้คะแนน (Rubric)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td rowSpan={5} className="border border-black p-2 align-top font-bold bg-gray-50">ส่วนที่ 1 การนำเสนอ</td>
                      <td className="border border-black p-2">1.1 ความครบถ้วนของ Presentation</td>
                      <td className="border border-black p-2 text-center font-bold">8</td>
                      <td className="border border-black p-2">
                        <strong>8:</strong> สไลด์ครบถ้วน ชัดเจน (ที่มา, ทฤษฎี, วิธีการ, ผล, สรุป, ข้อเสนอแนะ)<br/>
                        <strong>4-7:</strong> เนื้อหาเกือบครบถ้วน มีส่วนขาดเล็กน้อย<br/>
                        <strong>1-3:</strong> ขาดหายไปมาก ไม่เป็นระบบ
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">1.2 การนำเสนอของนิสิต</td>
                      <td className="border border-black p-2 text-center font-bold">10</td>
                      <td className="border border-black p-2">
                        <strong>10:</strong> นำเสนออย่างมั่นใจ ชัดเจน ใช้สื่อเหมาะสม ภาษาถูกต้อง ดึงดูดความสนใจ<br/>
                        <strong>5-9:</strong> ดีแต่ยังขาดความมั่นใจ มีติดขัดเล็กน้อย<br/>
                        <strong>1-4:</strong> ไม่อ่านจากสไลด์เป็นส่วนใหญ่ ไม่ราบรื่น
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">1.3 การตรงต่อเวลา</td>
                      <td className="border border-black p-2 text-center font-bold">4</td>
                      <td className="border border-black p-2">
                        <strong>4:</strong> เริ่ม/จบตามเวลาเคร่งครัด<br/>
                        <strong>2-3:</strong> ช้า/เร็วกว่ากำหนดไม่เกิน 5 นาที<br/>
                        <strong>1:</strong> ไม่ตรงต่อเวลาอย่างชัดเจน
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">1.4 การแต่งกาย</td>
                      <td className="border border-black p-2 text-center font-bold">3</td>
                      <td className="border border-black p-2">
                        <strong>3:</strong> แต่งกายสุภาพเรียบร้อย ถูกระเบียบตามมาตรฐานวิชาการ<br/>
                        <strong>1-2:</strong> สุภาพแต่ไม่เป็นไปตามระเบียบ | <strong>0:</strong> ไม่สุภาพ
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">1.5 การตอบคำถาม</td>
                      <td className="border border-black p-2 text-center font-bold">5</td>
                      <td className="border border-black p-2">
                        <strong>5:</strong> ตอบถูกต้อง ครบถ้วน ตรงประเด็น เข้าใจลึกซึ้ง<br/>
                        <strong>3-4:</strong> ตอบได้เกือบหมด | <strong>1-2:</strong> ตอบได้น้อย
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/50">
                      <td rowSpan={2} className="border border-black p-2 align-top font-bold">ส่วนที่ 2 ผลการดำเนินงาน</td>
                      <td className="border border-black p-2">2.1 ความสมบูรณ์ครบถ้วนตามขอบเขต</td>
                      <td className="border border-black p-2 text-center font-bold">35</td>
                      <td className="border border-black p-2">
                        <strong>35:</strong> ทำงานได้สมบูรณ์ 100% ตามขอบเขต เสถียร น่าเชื่อถือ<br/>
                        <strong>20-34:</strong> ทำงานได้เกือบสมบูรณ์ ฟังก์ชันหลักได้<br/>
                        <strong>1-19:</strong> ได้เพียงบางส่วน ไม่ตรงวัตถุประสงค์
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/50">
                      <td className="border border-black p-2">2.2 การวิเคราะห์ผลและข้อเสนอแนะ</td>
                      <td className="border border-black p-2 text-center font-bold">15</td>
                      <td className="border border-black p-2">
                        <strong>15:</strong> วิเคราะห์ละเอียด ลุ่มลึก เทียบทฤษฎี เสนอแนวทางพัฒนาต่อชัดเจน<br/>
                        <strong>8-14:</strong> วิเคราะห์ได้แต่ยังไม่ลุ่มลึก | <strong>1-7:</strong> ไม่มีข้อเสนอแนะที่สอดคล้อง
                      </td>
                    </tr>
                    <tr className="bg-blue-50/50">
                      <td rowSpan={2} className="border border-black p-2 align-top font-bold">ส่วนที่ 3 ความสมบูรณ์เอกสาร</td>
                      <td className="border border-black p-2">3.1 ความถูกต้องตามรูปแบบ</td>
                      <td className="border border-black p-2 text-center font-bold">8</td>
                      <td className="border border-black p-2">
                        <strong>8:</strong> รูปเล่มถูกต้องตามเกณฑ์ 100% (อ้างอิง, จัดหน้า, สารบัญ, การสะกดคำ)<br/>
                        <strong>4-7:</strong> ผิดพลาดไม่เกิน 5 จุด | <strong>1-3:</strong> ผิดพลาดเป็นจำนวนมาก
                      </td>
                    </tr>
                    <tr className="bg-blue-50/50">
                      <td className="border border-black p-2">3.2 ความครบถ้วนเนื้อหาของเอกสาร</td>
                      <td className="border border-black p-2 text-center font-bold">12</td>
                      <td className="border border-black p-2">
                        <strong>12:</strong> ครบถ้วนตามโครงสร้าง บทที่ 1-5 สอดคล้อง มีรายละเอียดสนับสนุน<br/>
                        <strong>6-11:</strong> ครบแต่ขาดรายละเอียดสำคัญ | <strong>1-5:</strong> ขาดหลายส่วน
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* FORM GUIDELINES: ข้อปฏิบัติและแนวทางการนำเสนอโครงงานวิศวกรรมคอมพิวเตอร์ */}
            {form.id === 'form-guidelines' && (
              <div className="space-y-6 text-xs text-gray-900">
                <KuSeal />
                <div className="text-center space-y-1 mb-4">
                  <h2 className="text-base sm:text-lg font-bold">ข้อปฏิบัติและแนวทางการนำเสนอโครงงานวิศวกรรมคอมพิวเตอร์</h2>
                  <p className="font-semibold text-xs">หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์</p>
                  <p className="text-xs">ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</p>
                  <p className="text-xs">มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร</p>
                  <div className="border-b-2 border-black w-full pt-2"></div>
                </div>

                {/* Section 1 */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 border-b border-gray-300 pb-1">
                    1. การกำหนดตารางกำหนดการนำเสนอ
                  </h3>
                  <div className="pl-4 space-y-2">
                    <p className="leading-relaxed">
                      <strong>1.1</strong> อาจารย์ผู้ประสานงานรายวิชากำหนดตารางกำหนดการนำเสนอภายในสัปดาห์ที่ 2-3 ภายหลังจากเปิดภาคการศึกษา สำหรับ:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-800">
                      <li>การนำเสนอหัวข้อโครงงาน (CPE-01)</li>
                      <li>การนำเสนอผลการดำเนินงานบทที่ 1-3 (สำหรับรายวิชาเตรียมความพร้อมโครงงาน)</li>
                      <li>การนำเสนอโครงงานสมบูรณ์ 100% (สำหรับรายวิชาโครงงานวิศวกรรมคอมพิวเตอร์)</li>
                    </ul>
                    <p className="leading-relaxed">
                      <strong>1.2</strong> นิสิตจะทราบกำหนดการนำเสนอพร้อมกำหนดกรรมการสอบล่วงหน้า <strong>1-2 สัปดาห์</strong> ก่อนตารางกำหนดการนำเสนอ
                    </p>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 border-b border-gray-300 pb-1">
                    2. แนวทางการยืนยันการขอนำเสนอ
                  </h3>
                  <div className="pl-4 space-y-1.5 leading-relaxed">
                    <p>• ข้อเสนอโครงงานผ่านการพิจารณาโดยอาจารย์ที่ปรึกษา</p>
                    <p>• นิสิตที่ทำโครงงานส่งแบบฟอร์มบันทึกการเข้าพบอาจารย์ที่ปรึกษา (CPE-02) ต่ออาจารย์ผู้ประสานงานรายวิชา</p>
                    <p>• นิสิตที่ทำโครงงานส่งแบบฟอร์มยืนยันการขอนำเสนอที่ลงนามโดยอาจารย์ที่ปรึกษา ต่ออาจารย์ผู้ประสานงานรายวิชา</p>
                    <p className="font-bold text-emerald-900">
                      • นิสิตจะต้องยื่นแบบฟอร์มที่ลงนามยืนยันอนุมัติให้ขึ้นสอบโดยอาจารย์ที่ปรึกษา ต่ออาจารย์ผู้ประสานงานรายวิชา ทั้งนี้ ภายในวันสิ้นสุดการถอนรายวิชาแบบติด W
                    </p>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 border-b border-gray-300 pb-1">
                    3. การขอเลื่อนกำหนดการนำเสนอ
                  </h3>
                  <div className="pl-4 space-y-2 leading-relaxed">
                    <p>นิสิตสามารถทำการขอเลื่อนกำหนดการนำเสนอได้ ทั้งนี้ภายใต้เงื่อนไขดังต่อไปนี้:</p>
                    <div className="p-3 border border-gray-300 rounded-lg space-y-1 bg-gray-50/50">
                      <p className="font-bold">3.1 กรณีที่คณะกรรมการสอบติดภารกิจเร่งด่วน:</p>
                      <p>นิสิตติดต่อแจ้งต่ออาจารย์ผู้ประสานงานรายวิชา <strong>ก่อนวันกำหนดสอบ 1 สัปดาห์</strong> ทั้งนี้จะยินยอมให้เลื่อนสอบได้ไม่เกิน 1 สัปดาห์นับจากกำหนดสอบตามตาราง</p>
                    </div>
                    <div className="p-3 border border-gray-300 rounded-lg space-y-1 bg-gray-50/50">
                      <p className="font-bold">3.2 กรณีที่มีเหตุฉุกเฉิน เช่น เจ็บป่วย หรือประสบอุบัติเหตุ:</p>
                      <p>ที่ไม่สามารถมานำเสนอตามกำหนดการได้ นิสิตสามารถฝากเพื่อนแจ้งต่ออาจารย์ผู้ประสานงานรายวิชา <strong>ทันทีภายหลังจากที่เกิดเหตุ</strong> ทั้งนี้การพิจารณาวันสอบจะพิจารณาเป็นรายกรณีต่อไป</p>
                    </div>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 border-b border-gray-300 pb-1">
                    4. การเตรียมตัวในการนำเสนอและข้อกำหนดในการสอบโครงงาน
                  </h3>
                  <div className="pl-4 space-y-2 leading-relaxed">
                    <p><strong>4.1</strong> นิสิตควรเข้าพบอาจารย์ที่ปรึกษาโครงงาน และนำเสนองานของตนเองให้อาจารย์ที่ปรึกษา ตรวจสอบความก้าวหน้าของโครงงานเป็นระยะ</p>
                    <p>
                      <strong>4.2</strong> เมื่อใกล้ถึงระยะเวลาในการสอบโครงงาน แต่ยังอยู่ในช่วงที่สามารถถอนรายวิชาได้ ให้นิสิตประเมินโครงงานของตนเองว่า <strong>ดำเนินการแล้วเสร็จถึงร้อยละ 80 ตามขอบเขตโครงงานหรือไม่</strong> หากไม่ถึงร้อยละ 80 นิสิตควรปรึกษาอาจารย์ที่ปรึกษาโครงงานเพื่อขอคำแนะนำว่าสมควรสอบ หรือสมควรจะถอนรายวิชา หากพบว่าตนเองไม่พร้อมที่จะสอบในตารางเวลาที่ประกาศไปแล้ว ควรจะถอนรายวิชาและดำเนินการให้แล้วเสร็จตามกำหนดเวลาการขอถอนรายวิชาตามประกาศมหาวิทยาลัย
                    </p>
                    <div className="p-3 border border-rose-200 bg-rose-50/50 rounded-lg text-rose-950 text-xs">
                      <p className="font-bold mb-1">4.3 เกณฑ์การประเมินเกรดกรณีไม่พร้อมสอบ:</p>
                      <p>• <strong>นิสิตที่ไม่สอบตามที่กำหนด:</strong> นิสิตจะได้รับเกรดเป็น <strong>F</strong></p>
                      <p>• <strong>นิสิตที่สอบตามที่กำหนด:</strong> นิสิตจะได้รับเกรดเป็น <strong>A - F</strong> ตามผลสัมฤทธิ์โครงงาน</p>
                    </div>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 border-b border-gray-300 pb-1">
                    5. แนวปฏิบัติในวันสอบโครงงานวิศวกรรมคอมพิวเตอร์
                  </h3>
                  <div className="pl-4 space-y-1.5 leading-relaxed">
                    <p>• จัดพิมพ์รายงานฉบับสมบูรณ์ (บทที่ 1 - 5) ส่งให้กรรมการก่อนสอบอย่างน้อย <strong>3 วัน</strong></p>
                    <p>• แต่งกายด้วยชุดนิสิตถูกต้องตามระเบียบของมหาวิทยาลัย และมาถึงห้องสอบก่อนเวลาสอบ <strong>30 นาที</strong> เพื่อเตรียมระบบ</p>
                    <p>• หากสอบห้องประชุมเล็ก ให้นิสิตตรวจสอบความพร้อมของอุปกรณ์ ได้แก่ โปรเจ็กเตอร์ จอภาพ และไมโครโฟน ให้เรียบร้อยก่อนเริ่มสอบ</p>
                    <p>• ซักซ้อมการนำเสนอให้กระชับและตรงเวลา พร้อมเตรียมข้อมูลทดสอบ (Test Data) และอุปกรณ์สาธิต (เช่น มือถือ, แท็บเล็ต, IoT)</p>
                    <p>• หากต้องมีการแก้ไขงาน ให้นิสิตดำเนินการแก้ไขและส่งให้กรรมการตรวจสอบไม่เกิน <strong>2 สัปดาห์หลังสัปดาห์สอบ</strong></p>
                    <p className="font-bold text-rose-900">• หากนิสิตมีเหตุผลเรื่องปัญหาทางด้านเทคนิค เช่น อุปกรณ์คอมพิวเตอร์เสีย ฮาร์ดดิสก์พัง หรือไฟล์หาย จะไม่อนุญาตให้เลื่อนกำหนดการนำเสนอโดยเด็ดขาด ให้นิสิตสำรองข้อมูลไว้สม่ำเสมอ</p>
                  </div>
                </div>

                {/* Section 6 */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900 border-b border-gray-300 pb-1">
                    6. การบันทึกข้อมูลการเข้าพบอาจารย์ที่ปรึกษา (CPE-02)
                  </h3>
                  <div className="pl-4 space-y-1.5 leading-relaxed">
                    <p>หลังจากที่เข้ารับคำปรึกษาและนำเสนอความก้าวหน้าแก่อาจารย์ที่ปรึกษาแล้ว นิสิตต้องบันทึกข้อมูลด้วยตนเองให้ครบถ้วน:</p>
                    <p>• ครั้งที่เข้าพบ, วันที่ เวลา สถานที่</p>
                    <p>• ตอนที่ 1 ส่วนของนิสิต (สรุปรายละเอียดผลการทำโครงงานและปัญหาที่พบ)</p>
                    <p>• ตอนที่ 2 ส่วนของอาจารย์ที่ปรึกษา (ข้อเสนอแนะและเกณฑ์คะแนนความก้าวหน้า 10 - 30 คะแนน)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs">
                  <div>
                    <p>ลงชื่อ ..............................................................</p>
                    <p className="font-bold mt-1">อาจารย์ผู้ประสานงานรายวิชาโครงงาน</p>
                    <p className="text-[10px] text-gray-500 mt-1">สาขาวิชาวิศวกรรมคอมพิวเตอร์</p>
                  </div>
                  <div>
                    <p>ลงชื่อ ..............................................................</p>
                    <p className="font-bold mt-1">หัวหน้าภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์</p>
                    <p className="text-[10px] text-gray-500 mt-1">คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</p>
                  </div>
                </div>
              </div>
            )}

            {/* TEMPLATES */}
            {form.categoryGroup === 'templates' && (
              <div className="space-y-4 text-xs">
                <KuSeal />
                <div className="text-center space-y-1 mb-4">
                  <h2 className="text-base sm:text-lg font-bold">{form.title}</h2>
                  <p className="text-xs">หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์ มก.ฉกส.</p>
                  <div className="border-b-2 border-black w-full pt-2"></div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <span className="font-bold text-sm text-gray-900 block">เทมเพลตมาตรฐานสำหรับจัดทำรูปเล่มวิจัยปริญญานิพนธ์</span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    ประกอบด้วยการตั้งค่าขอบกระดาษ รูปแบบฟอนต์ TH Sarabun New มาตรฐาน IEEE Citation Style สารบัญ ตาราง และเนื้อหาบทที่ 1 ถึง 5 ครบถ้วน
                  </p>
                </div>

                <div className="pt-4 text-center">
                  <button
                    onClick={handleDownloadWord}
                    className="px-6 py-2.5 rounded-xl bg-[#006644] text-white font-bold text-xs shadow-xs"
                  >
                    ดาวน์โหลดไฟล์เทมเพลตเพื่อเริ่มใช้งานทันที
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
