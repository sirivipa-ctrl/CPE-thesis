import React from 'react';
import { BookOpen, CheckSquare, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { MANUALS_DATA } from '../data/templatesAndManuals';

export const ManualsPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-16">
      {/* Dark Teal Hero Banner (Screenshot 165158) */}
      <div className="bg-[#064e3b] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-xs font-semibold backdrop-blur-xs">
            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            คู่มือ เกณฑ์ และระเบียบปฏิบัติ
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            คู่มือและข้อมูลที่เกี่ยวข้อง (Manuals & Guidelines)
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 max-w-3xl leading-relaxed">
            คู่มือการจัดทำรูปเล่มปริญญานิพนธ์ฉบับสมบูรณ์ เกณฑ์การประเมินผลคะแนน และปฏิทินการดำเนินงานวิชาโครงงาน
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: KU CSC Thesis Format Guide */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              {MANUALS_DATA[0].title}
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {MANUALS_DATA[0].description}
            </p>

            <ul className="space-y-2.5 pt-2">
              {MANUALS_DATA[0].bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Evaluation Criteria */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              {MANUALS_DATA[1].title}
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {MANUALS_DATA[1].description}
            </p>

            <div className="space-y-3 pt-2">
              {MANUALS_DATA[1].bullets.map((b, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-800">
                  <span>{b.split(':')[0]}</span>
                  <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {b.split(':')[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Project Calendar Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {MANUALS_DATA[2].title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {MANUALS_DATA[2].bullets.map((b, i) => {
              const [week, desc] = b.split(': ');
              return (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                    {week}
                  </span>
                  <p className="text-xs font-medium text-gray-800 pt-1">
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
