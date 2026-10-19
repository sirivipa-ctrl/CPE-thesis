import React, { useState } from 'react';
import { OFFICIAL_PROJECT_FORMS, OfficialProjectForm } from '../data/templatesAndManuals';
import { OfficialFormViewer } from '../components/OfficialFormViewer';

export const FormsPage: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<OfficialProjectForm | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'Word'>('PDF');

  // Exact Section 1 items matching Screenshot 2026-10-15 015143.png
  const section1Items = [
    {
      id: 'form-01',
      title: '1-แบบขอเสนออนุมัติโครงงานวิศวกรรมคอมพิวเตอร์',
      pdf: true,
      word: true
    },
    {
      id: 'form-02',
      title: '2-แบบประเมินการนำเสนอข้อเสนอโครงงานบทที่ 1 - 3',
      pdf: true,
      word: true
    },
    {
      id: 'form-04-eval',
      title: '4-แบบประเมินการนำเสนอโครงงาน 100% (โปรแกรม+รูปเล่มปริญญานิพนธ์)',
      pdf: true,
      word: true
    },
    {
      id: 'form-04-rubric',
      title: '4-เกณฑ์การประเมินโครงงาน 100% (โปรแกรม+รูปเล่มปริญญานิพนธ์)',
      pdf: true,
      word: false
    },
    {
      id: 'form-05-confirm',
      title: '5-แบบฟอร์มยืนยันการขอนำเสนอโครงงานวิศวกรรมคอมพิวเตอร์',
      pdf: true,
      word: true
    }
  ];

  // Exact Section 2 items matching Screenshot 2026-10-15 015143.png
  const section2Items = [
    {
      id: 'form-other-logbook',
      title: 'แบบฟอร์มสมุดบันทึกรายงานการเข้าพบอาจารย์ที่ปรึกษา',
      pdf: true,
      word: true
    },
    {
      id: 'form-other-scoresheet',
      title: 'แบบฟอร์มคะแนนการเข้าพบอาจารย์ที่ปรึกษา',
      pdf: true,
      word: true
    },
    {
      id: 'form-other-scope',
      title: 'แบบอนุมัติขอบเขตโครงงานวิศวกรรมคอมพิวเตอร์',
      pdf: true,
      word: true
    }
  ];

  const handleOpenDoc = (formId: string, format: 'PDF' | 'Word', e: React.MouseEvent) => {
    e.preventDefault();
    const form = OFFICIAL_PROJECT_FORMS.find(f => f.id === formId);
    if (form) {
      setSelectedForm(form);
      setSelectedFormat(format);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-28">
      {/* Top Banner Matching Screenshot 2026-10-15 015143.png */}
      <div 
        className="w-full relative overflow-hidden py-14 sm:py-20 px-6 sm:px-12 md:px-20 text-white shadow-inner"
        style={{
          backgroundColor: '#571c21',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='36' height='18' viewBox='0 0 36 18' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L18 18 M18 0 L36 18 M-9 9 L9 27 M9 -9 L27 9 M27 -9 L45 9' stroke='%23381014' stroke-width='1.5' fill='none' opacity='0.7'/%3E%3Cpath d='M18 18 L36 0 M0 18 L18 0 M9 27 L27 9 M27 27 L45 9 M-9 9 L9 -9' stroke='%23381014' stroke-width='1.5' fill='none' opacity='0.7'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-snug sm:leading-tight">
            แบบฟอร์มต่าง ๆ ที่เกี่ยวข้องในการบริหารจัดการวิชาโครงงาน<br />
            วิศวกรรมคอมพิวเตอร์
          </h1>
        </div>
      </div>

      {/* Main Content Area Matching Screenshot Typography and Layout */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 md:px-20 pt-10 sm:pt-14 space-y-12 sm:space-y-16">

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold text-gray-950 tracking-tight leading-snug">
            แบบฟอร์มที่เกี่ยวข้องสำหรับการบริหารจัดการวิชาโครงงาน/การเตรียมความพร้อมโครงงาน
          </h2>

          <ul className="space-y-3 pt-2 text-sm sm:text-base text-gray-800">
            {section1Items.map((item) => (
              <li key={item.id} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-xs text-gray-700 mt-1.5 select-none">▪</span>
                <div className="flex-1">
                  <span>{item.title}</span>{' '}
                  <span className="text-gray-900 font-normal">
                    ( {item.pdf && (
                      <button
                        onClick={(e) => handleOpenDoc(item.id, 'PDF', e)}
                        className="text-gray-900 hover:text-rose-700 underline underline-offset-2 font-normal cursor-pointer transition"
                        title="เปิดดูและดาวน์โหลดเอกสาร PDF ฉบับจริง"
                      >
                        PDF
                      </button>
                    )}
                    {item.pdf && item.word && <span> | </span>}
                    {item.word && (
                      <button
                        onClick={(e) => handleOpenDoc(item.id, 'Word', e)}
                        className="text-gray-900 hover:text-blue-700 underline underline-offset-2 font-normal cursor-pointer transition"
                        title="เปิดดูและดาวน์โหลดเอกสาร Word (.doc)"
                      >
                        Word
                      </button>
                    )} )
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl md:text-[26px] font-bold text-gray-950 tracking-tight leading-snug">
            แบบฟอร์มอื่น ๆ ที่เกี่ยวข้อง
          </h2>

          <ul className="space-y-3 pt-2 text-sm sm:text-base text-gray-800">
            {section2Items.map((item) => (
              <li key={item.id} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-xs text-gray-700 mt-1.5 select-none">▪</span>
                <div className="flex-1">
                  <span>{item.title}</span>{' '}
                  <span className="text-gray-900 font-normal">
                    ( {item.pdf && (
                      <button
                        onClick={(e) => handleOpenDoc(item.id, 'PDF', e)}
                        className="text-gray-900 hover:text-rose-700 underline underline-offset-2 font-normal cursor-pointer transition"
                        title="เปิดดูและดาวน์โหลดเอกสาร PDF ฉบับจริง"
                      >
                        PDF
                      </button>
                    )}
                    {item.pdf && item.word && <span> | </span>}
                    {item.word && (
                      <button
                        onClick={(e) => handleOpenDoc(item.id, 'Word', e)}
                        className="text-gray-900 hover:text-blue-700 underline underline-offset-2 font-normal cursor-pointer transition"
                        title="เปิดดูและดาวน์โหลดเอกสาร Word (.doc)"
                      >
                        Word
                      </button>
                    )} )
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

      </div>

      {/* Official Authentic Form Viewer & Real PDF Generator */}
      <OfficialFormViewer
        form={selectedForm}
        initialFormat={selectedFormat}
        onClose={() => setSelectedForm(null)}
      />
    </div>
  );
};
