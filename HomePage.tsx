import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowRight, 
  BookOpen, 
  Star, 
  Eye, 
  Layers, 
  Users, 
  Award, 
  MessageSquare, 
  Calendar, 
  User, 
  ChevronRight,
  GraduationCap,
  Sparkles,
  Wifi,
  Brain,
  Shield,
  FileCode2,
  Cpu
} from 'lucide-react';
import { Thesis } from '../types';
import { OFFICIAL_RESEARCH_CATEGORIES } from '../data/researchCategories';

interface HomePageProps {
  onSelectTab: (tab: string) => void;
  theses: Thesis[];
  onOpenThesis: (thesis: Thesis) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectTab,
  theses,
  onOpenThesis
}) => {
  const [popularSearch, setPopularSearch] = useState('');

  // Connect directly to real theses from the archive (filter out any legacy system-seed or demo items)
  const realTheses = useMemo(() => {
    return theses.filter(t => t.createdBy !== 'system-seed' && !t.id.startsWith('demo-'));
  }, [theses]);

  // Top popular projects connected directly from the thesis repository (คลังปริญญานิพนธ์)
  // Ranked dynamically by ratings, review counts, and views
  const popularProjects = useMemo(() => {
    const approved = realTheses.filter(t => t.status === 'approved');
    return [...approved]
      .sort((a, b) => {
        const scoreA = ((a.rating || 5.0) * 100) + ((a.reviewCount || 0) * 15) + ((a.viewCount || 0) * 0.2);
        const scoreB = ((b.rating || 5.0) * 100) + ((b.reviewCount || 0) * 15) + ((b.viewCount || 0) * 0.2);
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [realTheses]);

  // Filter popular items by search query
  const filteredPopular = useMemo(() => {
    if (!popularSearch.trim()) return popularProjects;
    const q = popularSearch.toLowerCase().trim();
    return popularProjects.filter(p => 
      p.titleTh.toLowerCase().includes(q) ||
      p.titleEn.toLowerCase().includes(q) ||
      p.studentNames.some(s => s.toLowerCase().includes(q)) ||
      p.advisorNames.some(a => a.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      (p.keywords && p.keywords.some(k => k.toLowerCase().includes(q)))
    );
  }, [popularProjects, popularSearch]);

  // Card themes for top 3 spots
  const getRankBadgeStyle = (index: number) => {
    if (index === 0) return { bg: 'from-emerald-700 via-emerald-600 to-teal-600', badge: '#1 ยอดนิยมอันดับ 1', color: 'emerald' };
    if (index === 1) return { bg: 'from-[#0a2540] via-blue-900 to-indigo-900', badge: '#2 ยอดนิยมอันดับ 2', color: 'blue' };
    return { bg: 'from-amber-700 via-amber-600 to-yellow-600', badge: '#3 ยอดนิยมอันดับ 3', color: 'amber' };
  };

  return (
    <div className="space-y-12 pb-16 pt-4 font-sans antialiased text-gray-900">
      {/* 
        รูปที่ 3: โปรเจกต์ยอดนิยม (POPULAR PROJECTS)
        เชื่อมต่อข้อมูลจริงโดยตรงมาจากคลังปริญญานิพนธ์ (Thesis Repository)
        ตัดส่วนรูปที่ 1-2 (แบนเนอร์และกล่องก่อนหน้า) ออกจากหน้าเว็บตามคำสั่ง
      */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-gray-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>POPULAR PROJECTS</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
              โปรเจกต์ยอดนิยม
            </h1>
            
            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
              ผลงานปริญญานิพนธ์ที่ได้รับความสนใจสูงสุด 
            </p>
          </div>

          {/* Quick Action Navigation & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={popularSearch}
                onChange={(e) => setPopularSearch(e.target.value)}
                placeholder="ค้นหาผลงานยอดนิยม..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs"
              />
            </div>

            {/* Direct button to Thesis Archive */}
            <button
              onClick={() => onSelectTab('archive')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#006644] hover:bg-[#005236] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer shrink-0"
            >
              <span>คลังปริญญานิพนธ์ทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Popular Projects Cards Grid */}
        {filteredPopular.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPopular.map((project, index) => {
              const theme = getRankBadgeStyle(index);
              const realRating = project.rating ? project.rating.toFixed(1) : '5.0';
              const realReviews = project.reviewCount || 0;
              const realViews = project.viewCount || 0;

              return (
                <div
                  key={project.id}
                  onClick={() => onOpenThesis(project)}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group transform hover:-translate-y-1"
                >
                  {/* Card Banner Header */}
                  <div className={`bg-gradient-to-r ${theme.bg} p-6 text-white relative overflow-hidden`}>
                    <div className="flex items-center justify-between relative z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                        <Award className="w-3.5 h-3.5" />
                        <span>{theme.badge}</span>
                      </span>

                      <span className="text-xs font-bold bg-black/25 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                        ปีการศึกษา {project.academicYear}
                      </span>
                    </div>

                    <div className="mt-4 relative z-10">
                      <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider block">
                        รหัสโครงงาน
                      </span>
                      <span className="text-lg font-black tracking-tight text-white">
                        {project.code}
                      </span>
                    </div>

                    {/* Subtle Category watermark behind */}
                    <div className="absolute right-3 bottom-0 text-white/10 font-black text-6xl select-none uppercase pointer-events-none">
                      {project.category.includes('ไอโอที') || project.category.includes('IoT') ? 'IoT' : project.category.includes('ไซเบอร์') ? 'SEC' : 'CPE'}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Category Tag */}
                      <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                        {project.category}
                      </span>

                      {/* Thai Title */}
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                        {project.titleTh}
                      </h3>

                      {/* English Title */}
                      {project.titleEn && (
                        <p className="text-xs text-gray-500 font-medium italic line-clamp-1">
                          {project.titleEn}
                        </p>
                      )}

                      {/* Abstract snippet */}
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {project.abstractTh}
                      </p>
                    </div>

                    {/* Metadata & Scores */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      {/* Author & Advisor */}
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 truncate">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate"><strong>ผู้จัดทำ:</strong> {project.studentNames.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate"><strong>ที่ปรึกษา:</strong> {project.advisorNames.join(', ')}</span>
                        </div>
                      </div>

                      {/* Statistics Bar: Rating, Reviews, Views */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3 text-xs">
                          {/* Rating */}
                          <div className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{realRating}</span>
                          </div>

                          {/* Reviews */}
                          <div className="flex items-center gap-1 text-gray-500">
                            <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                            <span>{realReviews} รีวิว</span>
                          </div>

                          {/* Views */}
                          <div className="flex items-center gap-1 text-gray-500">
                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                            <span>{realViews} ครั้ง</span>
                          </div>
                        </div>

                        {/* Detail Link */}
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                          ดูรายละเอียด <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Official Empty State if no real approved thesis exists yet */
          <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center max-w-3xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
            
            </h3>
            <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
              เมื่อมีการยื่นเสนอโครงงานและได้รับการอนุมัติจากอาจารย์ที่ปรึกษา ผลงานยอดนิยมจะถูกคำนวณและนำมาแสดงที่นี่โดยอัตโนมัติแบบเรียลไทม์
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onSelectTab('archive')}
                className="px-6 py-2.5 rounded-xl bg-[#006644] hover:bg-[#005236] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
              >
                เข้าสู่คลังปริญญานิพนธ์
              </button>
              <button
                onClick={() => onSelectTab('advisors')}
                className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                ดูข้อมูลอาจารย์ที่ปรึกษา (8 ท่าน)
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Official Research Categories Section (Connecting to Archive) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>RESEARCH SPECIALIZATIONS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                หมวดหมู่งานวิจัยตามความเชี่ยวชาญอาจารย์ 8 ท่าน
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                คลิกเลือกหมวดหมู่เพื่อค้นหาและสืบค้นปริญญานิพนธ์ในคลังตามแขนงวิจัยที่สนใจ
              </p>
            </div>

            <button
              onClick={() => onSelectTab('archive')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>เปิดคลังปริญญานิพนธ์</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid of the 8 Official Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OFFICIAL_RESEARCH_CATEGORIES.map((cat) => {
              const count = realTheses.filter(t => t.category === cat.name || t.category.includes(cat.name)).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectTab('archive')}
                  className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200/80 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                        {count} เรื่องในระบบ
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition line-clamp-2">
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium italic line-clamp-1">
                      {cat.nameEn}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="truncate">อาจารย์: {cat.advisors.length} ท่าน</span>
                    <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                      ดูผลงาน <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
