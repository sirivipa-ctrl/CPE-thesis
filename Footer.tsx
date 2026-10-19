import React from 'react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-[#0f172a] text-gray-300 py-10 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#60121a] text-white flex items-center justify-center font-bold text-sm tracking-tight shrink-0 shadow-md">
              KU.SE
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                CPE Thesis Website • สาขาวิชาวิศวกรรมคอมพิวเตอร์
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xl">
                ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ คณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <button onClick={() => onSelectTab('home')} className="hover:text-white transition">หน้าแรก</button>
            <span>•</span>
            <button onClick={() => onSelectTab('guidelines')} className="hover:text-white transition">ข้อปฏิบัติ & แนวทาง</button>
            <span>•</span>
            <button onClick={() => onSelectTab('advisors')} className="hover:text-white transition">ข้อมูลอาจารย์ที่ปรึกษา</button>
            <span>•</span>
            <button onClick={() => onSelectTab('forms')} className="hover:text-white transition">แบบฟอร์ม & Templates</button>
            <span>•</span>
            <button onClick={() => onSelectTab('manuals')} className="hover:text-white transition">คู่มือจัดทำรูปเล่ม</button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 SmartThesis CPE • Department of Electrical and Computer Engineering, Kasetsart University CSC</p>
          <div className="flex items-center gap-4 text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Firebase Firestore & Auth Connected
            </span>
            <span className="text-gray-600">|</span>
            <span>Security Rules Enforced</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
