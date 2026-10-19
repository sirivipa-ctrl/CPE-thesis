import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  ExternalLink, 
  Table as TableIcon, 
  LayoutGrid, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  FilePlus,
  Search
} from 'lucide-react';
import { ADVISORS_DATA } from '../data/advisorsData';
import { AdvisorFaculty } from '../types';

interface AdvisorsPageProps {
  onSelectAdvisor?: (advisor: AdvisorFaculty) => void;
  onViewProjects: (advisorName: string) => void;
}

export const AdvisorsPage: React.FC<AdvisorsPageProps> = ({
  onSelectAdvisor,
  onViewProjects
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const totalAdvisors = ADVISORS_DATA.length;
  const totalQuota = ADVISORS_DATA.reduce((sum, a) => sum + a.quotaMax, 0);
  const totalUsed = ADVISORS_DATA.reduce((sum, a) => sum + a.quotaUsed, 0);
  const totalAvailable = totalQuota - totalUsed;

  const filteredAdvisors = ADVISORS_DATA.filter(adv => 
    searchQuery === '' ||
    adv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    adv.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
    adv.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Dark Maroon Hero Banner (Screenshot 165223) */}
      <div className="bg-[#60121a] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            ข้อมูลอาจารย์ที่ปรึกษา
          </h1>
          <p className="text-sm sm:text-base text-rose-100 mt-2 max-w-3xl">
            สาขาวิชาวิศวกรรมคอมพิวเตอร์ ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิทยาศาสตร์และวิศวกรรมศาสตร์
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Main Card Header & Summary (Matching Screenshot 165223) */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#111827]">
                ข้อมูลการรับนิสิตในที่ปรึกษาโครงงานของอาจารย์ประจำหลักสูตร
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                ตรวจสอบโควตาที่เปิดรับ แขนงความเชี่ยวชาญงานวิจัย และข้อมูลการติดต่ออาจารย์แต่ละท่าน
              </p>
              <div className="mt-2.5 text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-3.5 py-2 inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>นิสิตสามารถยื่นขออาจารย์ที่ปรึกษาและเสนอหัวข้อโครงงาน (CPE-01) ได้โดยตรงที่ <strong>ระบบสำหรับนิสิต (Student Dashboard)</strong></span>
              </div>
            </div>

            {/* Toggle View & Search */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Google Sheets View</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards View</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stat Cards (Matching Screenshot 165223) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200">
              <span className="text-xs font-medium text-gray-500 block">อาจารย์ประจำหลักสูตร</span>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                {totalAdvisors} ท่าน
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-xs font-medium text-emerald-700 block">โควตารับนิสิตทั้งหมด</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">
                {totalQuota} โครงงาน
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
              <span className="text-xs font-medium text-blue-700 block">คงเหลือเปิดรับได้ (Available)</span>
              <div className="text-2xl sm:text-3xl font-black text-blue-900 mt-1">
                {totalAvailable} ที่นั่ง / โครงงาน
              </div>
            </div>
          </div>

          {/* Search bar inside advisors */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่ออาจารย์, ความเชี่ยวชาญ, หรือห้องพัก..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* Table View (Matching Screenshots 165247, 165256, 165312) */}
          {viewMode === 'table' ? (
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700">
                  <tr>
                    <th className="py-3.5 px-4 text-center w-12">ลำดับ</th>
                    <th className="py-3.5 px-4 min-w-[200px]">ชื่อ-นามสกุล / ตำแหน่งทางวิชาการ</th>
                    <th className="py-3.5 px-4 min-w-[260px]">ความเชี่ยวชาญ / งานวิจัย</th>
                    <th className="py-3.5 px-4 min-w-[200px]">ห้องพัก & การติดต่อ</th>
                    <th className="py-3.5 px-4 text-center min-w-[80px]">รับแล้ว</th>
                    <th className="py-3.5 px-4 text-center min-w-[80px]">โควตาสูงสุด</th>
                    <th className="py-3.5 px-4 text-center min-w-[120px]">สถานะการรับ</th>
                    <th className="py-3.5 px-4 text-center min-w-[120px]">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAdvisors.map((adv, index) => {
                    const remaining = adv.quotaMax - adv.quotaUsed;
                    return (
                      <tr key={adv.id} className="hover:bg-gray-50/80 transition">
                        {/* 1. Sequence */}
                        <td className="py-4 px-4 text-center font-bold text-gray-600 text-sm">
                          {index + 1}
                        </td>

                        {/* 2. Name & Rank */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-[#111827] text-sm">
                            {adv.name}
                          </div>
                          <div className="text-xs text-emerald-800 font-medium mt-0.5">
                            {adv.academicRank}
                          </div>
                        </td>

                        {/* 3. Expertise */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {adv.expertise.map((exp, i) => (
                              <span 
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* 4. Contact */}
                        <td className="py-4 px-4 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{adv.room}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <a href={`mailto:${adv.email}`} className="hover:text-emerald-700 underline truncate">
                              {adv.email}
                            </a>
                          </div>
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
                              KU Forest Profile <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </td>

                        {/* 5. Used */}
                        <td className="py-4 px-4 text-center font-bold text-gray-800">
                          {adv.quotaUsed} <span className="text-xs font-normal text-gray-500">กลุ่ม</span>
                        </td>

                        {/* 6. Max */}
                        <td className="py-4 px-4 text-center font-bold text-gray-800">
                          {adv.quotaMax} <span className="text-xs font-normal text-gray-500">กลุ่ม</span>
                        </td>

                        {/* 7. Status Pill (Matching Screenshot: green circular pill "เปิดรับ (ว่าง X)") */}
                        <td className="py-4 px-4 text-center">
                          {adv.status === 'almost_full' ? (
                            <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                              ใกล้เต็ม (เหลือ {remaining})
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]">
                              เปิดรับ (ว่าง {remaining})
                            </span>
                          )}
                        </td>

                        {/* 8. Action (Only 'ดูผลงานโครงงาน' as 'ยื่นขอที่ปรึกษา' is submitted via Student Dashboard) */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => onViewProjects(adv.name)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer shadow-2xs w-full"
                          >
                            <span>ดูผลงานโครงงาน</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAdvisors.map((adv) => {
                const remaining = adv.quotaMax - adv.quotaUsed;
                return (
                  <div key={adv.id} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-base text-gray-900">{adv.name}</h3>
                          <span className="text-xs font-medium text-emerald-800">{adv.academicRank}</span>
                        </div>
                        {adv.status === 'almost_full' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            ใกล้เต็ม ({remaining})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            เปิดรับ ({remaining})
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-xs text-gray-600">
                        <p>{adv.room}</p>
                        <p className="text-emerald-700">{adv.email}</p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {adv.expertise.map((exp, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-gray-700">
                        รับแล้ว {adv.quotaUsed}/{adv.quotaMax} กลุ่ม
                      </span>
                      <button
                        onClick={() => onViewProjects(adv.name)}
                        className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold py-1.5 px-3 rounded-lg transition cursor-pointer"
                      >
                        <span>ดูผลงานโครงงาน</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
