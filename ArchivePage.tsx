import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  Bookmark, 
  Star, 
  Eye, 
  BookOpen, 
  ArrowRight,
  Wifi,
  Cpu,
  Shield,
  FileCode2,
  FolderOpen,
  PlusCircle,
  GraduationCap,
  X,
  Filter
} from 'lucide-react';
import { Thesis } from '../types';
import { ADVISORS_DATA } from '../data/advisorsData';
import { OFFICIAL_RESEARCH_CATEGORIES } from '../data/researchCategories';
import { subscribeToCategories, ResearchCategoryDoc } from '../services/categoryService';

interface ArchivePageProps {
  theses: Thesis[];
  loading: boolean;
  onOpenThesis: (thesis: Thesis) => void;
  onOpenUpload: () => void;
  onOpenStats: () => void;
  onSelectTab?: (tab: string) => void;
  initialAdvisorFilter?: string;
}

export const ArchivePage: React.FC<ArchivePageProps> = ({
  theses,
  loading,
  onOpenThesis,
  onOpenUpload,
  onOpenStats,
  onSelectTab,
  initialAdvisorFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทุกหมวดหมู่');
  const [selectedYear, setSelectedYear] = useState('ทุกปีการศึกษา');
  const [selectedAdvisor, setSelectedAdvisor] = useState(initialAdvisorFilter || 'อาจารย์ที่ปรึกษาทั้งหมด');

  // React to prop change when navigating from advisors page
  React.useEffect(() => {
    if (initialAdvisorFilter) {
      setSelectedAdvisor(initialAdvisorFilter);
    }
  }, [initialAdvisorFilter]);

  const [liveCategories, setLiveCategories] = useState<ResearchCategoryDoc[]>([]);

  React.useEffect(() => {
    const unsub = subscribeToCategories((cats) => {
      setLiveCategories(cats);
    });
    return () => unsub();
  }, []);

  const [activeSort, setActiveSort] = useState<'latest' | 'rating' | 'reviews' | 'alpha'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const itemsPerPage = 6;

  // Filter out any legacy dummy/seed data to ensure 100% real data
  const realTheses = useMemo(() => {
    return theses.filter(t => t.createdBy !== 'system-seed' && !t.id.startsWith('demo-'));
  }, [theses]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Map category to icon
  const getCategoryIcon = (categoryName: string) => {
    if (categoryName.includes('ไอโอที') || categoryName.includes('IoT') || categoryName.includes('สมองกล')) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
          <Wifi className="w-5 h-5" />
        </div>
      );
    }
    if (categoryName.includes('ปัญญาประดิษฐ์') || categoryName.includes('AI') || categoryName.includes('เรียนรู้')) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
          <Cpu className="w-5 h-5" />
        </div>
      );
    }
    if (categoryName.includes('ปลอดภัย') || categoryName.includes('ไซเบอร์') || categoryName.includes('เครือข่าย')) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
          <Shield className="w-5 h-5" />
        </div>
      );
    }
    if (categoryName.includes('ซอฟต์แวร์') || categoryName.includes('บล็อกเชน') || categoryName.includes('เว็บ')) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
          <FileCode2 className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
        <Cpu className="w-5 h-5" />
      </div>
    );
  };

  // Filter & sort logic for the main list
  const filteredTheses = useMemo(() => {
    let list = [...realTheses];

    // Filter Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        item.titleTh.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.studentNames.some(s => s.toLowerCase().includes(q)) ||
        item.advisorNames.some(a => a.toLowerCase().includes(q)) ||
        (item.keywords && item.keywords.some(k => k.toLowerCase().includes(q)))
      );
    }

    // Filter Category
    if (selectedCategory !== 'ทุกหมวดหมู่') {
      list = list.filter(item => item.category === selectedCategory || item.category.includes(selectedCategory));
    }

    // Filter Year
    if (selectedYear !== 'ทุกปีการศึกษา') {
      list = list.filter(item => item.academicYear === selectedYear);
    }

    // Filter Advisor (8 Faculty Members)
    if (selectedAdvisor !== 'อาจารย์ที่ปรึกษาทั้งหมด') {
      list = list.filter(item => item.advisorNames.some(name => name.includes(selectedAdvisor)));
    }

    // Sort
    if (activeSort === 'rating') {
      list.sort((a, b) => ((b.rating || 0) - (a.rating || 0)));
    } else if (activeSort === 'reviews') {
      list.sort((a, b) => ((b.reviewCount || 0) - (a.reviewCount || 0)));
    } else if (activeSort === 'alpha') {
      list.sort((a, b) => a.titleTh.localeCompare(b.titleTh));
    } else {
      // Latest
      list.sort((a, b) => (b.academicYear === a.academicYear ? b.code.localeCompare(a.code) : b.academicYear.localeCompare(a.academicYear)));
    }

    return list;
  }, [realTheses, searchQuery, selectedCategory, selectedYear, selectedAdvisor, activeSort]);

  // Total and pagination
  const totalCount = filteredTheses.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const paginatedTheses = filteredTheses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ทุกหมวดหมู่');
    setSelectedYear('ทุกปีการศึกษา');
    setSelectedAdvisor('อาจารย์ที่ปรึกษาทั้งหมด');
    setActiveSort('latest');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || 
    selectedCategory !== 'ทุกหมวดหมู่' || 
    selectedYear !== 'ทุกปีการศึกษา' || 
    selectedAdvisor !== 'อาจารย์ที่ปรึกษาทั้งหมด';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 pb-24 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-500">
          <span 
            className="hover:text-gray-800 transition cursor-pointer" 
            onClick={() => onSelectTab && onSelectTab('home')}
          >
            หน้าแรก
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold">คลังปริญญานิพนธ์</span>
        </nav>

        {/* 2. Top Header with 3 Real Statistics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-200/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0f766e] text-xs font-bold border border-emerald-100">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Smart Thesis CPE Repository • ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์ มก.ฉกส.</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-[40px] font-extrabold text-[#0f172a] tracking-tight leading-tight">
              คลังปริญญานิพนธ์ สาขาวิศวกรรมคอมพิวเตอร์
            </h1>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl">
              ระบบจัดเก็บและบริหารข้อมูลปริญญานิพนธ์จริง พร้อมผลการประเมิน รีวิวจริงจากคณาจารย์ 8 ท่าน และการสืบค้นตามความเชี่ยวชาญวิจัย
            </p>
          </div>

          {/* Stats on Right: Real count of theses, 8 research categories, 8 faculty advisors */}
          <div className="flex items-center divide-x divide-gray-200 text-center shrink-0 bg-white p-4 rounded-3xl border border-gray-200/80 shadow-2xs">
            <div className="px-5 sm:px-7">
              <span className="text-3xl sm:text-4xl font-black text-[#0f766e] block">
                {realTheses.length}
              </span>
              <span className="text-xs text-gray-500 mt-1 block font-medium">ผลงานในระบบ</span>
            </div>

            <div className="px-5 sm:px-7">
              <span className="text-3xl sm:text-4xl font-black text-[#0f172a] block">
                8
              </span>
              <span className="text-xs text-gray-500 mt-1 block font-medium">หมวดหมู่งานวิจัย</span>
            </div>

            <div className="px-5 sm:px-7">
              <span className="text-3xl sm:text-4xl font-black text-[#0f172a] block">
                8
              </span>
              <span className="text-xs text-gray-500 mt-1 block font-medium">อาจารย์ที่ปรึกษา</span>
            </div>
          </div>
        </div>

        {/* 3. Filter Box: Search, Year, 8 Advisors, 8 Categories */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs p-5 sm:p-7 space-y-4">
          {/* Search Row */}
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหาชื่อปริญญานิพนธ์ ภาษาไทย/อังกฤษ รหัสโครงงาน ผู้จัดทำ หรือคำสำคัญ..."
              className="w-full pl-12 pr-40 py-3 text-sm text-gray-800 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 focus:border-[#0f766e] transition placeholder-gray-400"
            />
            <span className="absolute right-4 text-xs text-gray-400 hidden sm:inline">
              เช่น IoT, การเรียนรู้ของเครื่อง
            </span>
          </div>

          {/* Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Academic Year */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-600 block pl-1">ปีการศึกษา</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0f766e] appearance-none text-gray-700 cursor-pointer"
                >
                  <option value="ทุกปีการศึกษา">ทุกปีการศึกษา</option>
                  <option value="2568">ปีการศึกษา 2568</option>
                  <option value="2567">ปีการศึกษา 2567</option>
                  <option value="2566">ปีการศึกษา 2566</option>
                  <option value="2565">ปีการศึกษา 2565</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Advisor (All 8 Faculty Members Only) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-600 block pl-1">
                อาจารย์ที่ปรึกษา (8 ท่าน)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={selectedAdvisor}
                  onChange={(e) => {
                    setSelectedAdvisor(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0f766e] appearance-none text-gray-700 cursor-pointer"
                >
                  <option value="อาจารย์ที่ปรึกษาทั้งหมด">อาจารย์ที่ปรึกษาทั้งหมด</option>
                  {ADVISORS_DATA.map(adv => (
                    <option key={adv.id} value={adv.name}>
                      {adv.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Research Category (8 Official Categories) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-600 block pl-1">
                หมวดหมู่งานวิจัย (8 หมวด)
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0f766e] appearance-none text-gray-700 cursor-pointer"
                >
                  <option value="ทุกหมวดหมู่">ทุกหมวดหมู่</option>
                  {OFFICIAL_RESEARCH_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Actions: Search Button + Reset + Add New Thesis CTA */}
            <div className="flex items-end gap-2 pt-1 sm:pt-0">
              <button
                onClick={() => setCurrentPage(1)}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-[#0f766e] hover:bg-[#115e59] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>ค้นหา</span>
              </button>

              <button
                onClick={handleResetFilters}
                className="py-2.5 px-3 rounded-2xl border border-gray-200 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition cursor-pointer"
                title="รีเซ็ตตัวกรองทั้งหมด"
              >
                ล้างตัวกรอง
              </button>

              <button
                onClick={onOpenUpload}
                className="py-2.5 px-3 rounded-2xl bg-[#006644] hover:bg-[#005236] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                title="ยื่นเสนอโครงงานใหม่"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden xl:inline">เสนอโครงงาน</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 flex-wrap text-xs">
              <div className="flex items-center gap-1 text-gray-400 font-medium">
                <Filter className="w-3.5 h-3.5" />
                <span>ตัวกรองที่ใช้งาน:</span>
              </div>

              {searchQuery.trim() !== '' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  <span>ค้นหา: "{searchQuery}"</span>
                  <button 
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }} 
                    className="hover:text-emerald-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedYear !== 'ทุกปีการศึกษา' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-[#0f766e] border border-teal-200 font-medium">
                  <span>ปีการศึกษา: {selectedYear}</span>
                  <button 
                    onClick={() => { setSelectedYear('ทุกปีการศึกษา'); setCurrentPage(1); }} 
                    className="hover:text-teal-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedAdvisor !== 'อาจารย์ที่ปรึกษาทั้งหมด' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                  <span>อาจารย์: {selectedAdvisor}</span>
                  <button 
                    onClick={() => { setSelectedAdvisor('อาจารย์ที่ปรึกษาทั้งหมด'); setCurrentPage(1); }} 
                    className="hover:text-blue-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'ทุกหมวดหมู่' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium">
                  <span>หมวดหมู่: {selectedCategory}</span>
                  <button 
                    onClick={() => { setSelectedCategory('ทุกหมวดหมู่'); setCurrentPage(1); }} 
                    className="hover:text-indigo-950 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-gray-400 hover:text-red-600 ml-1 transition cursor-pointer text-[11px] underline"
              >
                ล้างทั้งหมด
              </button>
            </div>
          )}
        </div>

        {/* 4. Main Balanced Content: Left Sidebar (8 Categories Explorer) + Right Thesis List */}
        <div className="space-y-6">

          {/* Section Header with Tabs / Filter Result Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
                  ปริญญานิพนธ์ทั้งหมด
                </h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#0f766e] border border-emerald-100">
                  {totalCount} ผลงานจริง
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                แสดง {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} จาก {totalCount} ผลงาน · {selectedYear} · {selectedAdvisor} · {selectedCategory}
              </p>
            </div>

            {/* Sorting Pills */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
              <span className="text-gray-400 text-xs mr-1 hidden sm:inline">เรียงตาม:</span>
              <button
                onClick={() => setActiveSort('latest')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  activeSort === 'latest'
                    ? 'bg-white shadow-xs text-[#0f766e] font-bold border border-gray-200'
                    : 'hover:text-gray-900'
                }`}
              >
                เผยแพร่ล่าสุด
              </button>
              <button
                onClick={() => setActiveSort('rating')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  activeSort === 'rating'
                    ? 'bg-white shadow-xs text-[#0f766e] font-bold border border-gray-200'
                    : 'hover:text-gray-900'
                }`}
              >
                คะแนนเฉลี่ยสูงสุด
              </button>
              <button
                onClick={() => setActiveSort('reviews')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  activeSort === 'reviews'
                    ? 'bg-white shadow-xs text-[#0f766e] font-bold border border-gray-200'
                    : 'hover:text-gray-900'
                }`}
              >
                รีวิวมากที่สุด
              </button>
              <button
                onClick={() => setActiveSort('alpha')}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  activeSort === 'alpha'
                    ? 'bg-white shadow-xs text-[#0f766e] font-bold border border-gray-200'
                    : 'hover:text-gray-900'
                }`}
              >
                ชื่อเรื่อง ก-ฮ
              </button>
            </div>
          </div>

          {/* Grid Layout: Sidebar (1 Col) + Thesis Cards (3 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* LEFT SIDEBAR: 8 Official Research Categories */}
            <div className="space-y-6 lg:sticky lg:top-24">
              {/* Category Explorer Card */}
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900">
                    หมวดหมู่งานวิจัย (8 หมวด)
                  </h3>
                  <span className="text-[11px] text-gray-400">อ้างอิงอาจารย์ 8 ท่าน</span>
                </div>

                <div className="space-y-1">
                  {/* All Categories Option */}
                  <button
                    onClick={() => {
                      setSelectedCategory('ทุกหมวดหมู่');
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                      selectedCategory === 'ทุกหมวดหมู่'
                        ? 'bg-[#e6f4ea] text-[#137333] font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>ทุกหมวดหมู่งานวิจัย</span>
                    <span className={`text-[11px] font-semibold ${selectedCategory === 'ทุกหมวดหมู่' ? 'text-[#137333]' : 'text-gray-400'}`}>
                      {realTheses.length}
                    </span>
                  </button>

                  {/* Categories from Firestore */}
                  {(liveCategories.length > 0 ? liveCategories : OFFICIAL_RESEARCH_CATEGORIES).map((cat) => {
                    const isActive = selectedCategory === cat.name;
                    const catCount = realTheses.filter(t => t.category === cat.name || t.category.includes(cat.name)).length;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer text-left ${
                          isActive
                            ? 'bg-[#e6f4ea] text-[#137333] font-bold shadow-2xs'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        title={`${cat.name}${(cat as any).advisors ? `\nที่ปรึกษา: ${(cat as any).advisors.join(', ')}` : ''}`}
                      >
                        <span className="truncate pr-2">{cat.name}</span>
                        <span className={`text-[11px] font-semibold shrink-0 ${isActive ? 'text-[#137333]' : 'text-gray-400'}`}>
                          {catCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Research Guidance Card */}
              <div className="bg-[#f0f7ff] rounded-3xl p-6 border border-blue-100/80 space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-[#0f172a]">
                    แนวทางการทำโครงงาน
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    ศึกษาระเบียบ แบบฟอร์ม CPE-01 ถึง CPE-05 และกำหนดการนำเสนอโครงงาน 100%
                  </p>
                </div>

                <div className="pt-1 flex flex-col gap-2">
                  <button
                    onClick={() => onSelectTab && onSelectTab('forms')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f766e] hover:text-[#115e59] transition cursor-pointer"
                  >
                    <span>ดาวน์โหลดแบบฟอร์มโครงงาน</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectTab && onSelectTab('advisors')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition cursor-pointer"
                  >
                    <span>ตรวจสอบโควตาอาจารย์ (8 ท่าน)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT THESIS CARDS LIST */}
            <div className="lg:col-span-3 space-y-4">
              
              {loading && (
                <div className="py-20 text-center bg-white rounded-3xl border border-gray-200">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0f766e] border-t-transparent mb-2"></div>
                  <p className="text-xs text-gray-500">กำลังโหลดรายการปริญญานิพนธ์จากฐานข้อมูลจริง...</p>
                </div>
              )}

              {/* Empty state */}
              {!loading && filteredTheses.length === 0 && (
                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-4 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                    <FolderOpen className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-base text-gray-800">
                      ไม่พบปริญญานิพนธ์ที่ตรงกับเงื่อนไข
                    </p>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      คุณสามารถลองปรับเปลี่ยนคำค้นหา ตัวกรองปีการศึกษา หมวดหมู่งานวิจัย หรือยื่นเสนอโครงงานใหม่เข้าระบบได้ทันที
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                    <button
                      onClick={onOpenUpload}
                      className="px-4 py-2 bg-[#0f766e] hover:bg-[#115e59] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      + เสนอโครงงานใหม่
                    </button>
                  </div>
                </div>
              )}

              {/* Real Thesis List Cards */}
              {!loading && paginatedTheses.map((item) => {
                const isBookmarked = bookmarkedIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenThesis(item)}
                    className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-gray-300 transition p-6 space-y-4 cursor-pointer group"
                  >
                    {/* Top Row: Category Pill, Year, Bookmark, and Real Rating */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Domain Icon */}
                        {getCategoryIcon(item.category)}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#0f766e] border border-emerald-100">
                              {item.category}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              ปีการศึกษา {item.academicYear} (ภาคเรียนที่ {item.semester || '1'})
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'revision_required'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-50 text-blue-700'
                            }`}>
                              {item.status === 'approved' ? 'อนุมัติแล้ว' : item.status === 'revision_required' ? 'ให้แก้ไข' : 'กำลังพิจารณา'}
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-[#0f172a] group-hover:text-[#0f766e] transition leading-snug">
                            {item.titleTh}
                          </h3>

                          {item.titleEn && (
                            <p className="text-xs text-gray-400 italic line-clamp-1">
                              {item.titleEn}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Bookmark + Real Star Rating */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={(e) => toggleBookmark(item.id, e)}
                          className={`p-1.5 rounded-xl transition ${
                            isBookmarked
                              ? 'text-amber-500 bg-amber-50'
                              : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                          title={isBookmarked ? 'ลบบุ๊กมาร์ก' : 'บันทึกรายการ'}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                        </button>

                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="font-extrabold text-[#0f172a]">
                            {item.rating ? item.rating.toFixed(1) : '5.0'}
                          </span>
                          <span className="text-gray-400 text-xs">
                            / 5 · {item.reviewCount || 0} รีวิวจริง
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description / Abstract snippet */}
                    <p className="text-xs text-gray-600 leading-relaxed sm:pl-15 line-clamp-2">
                      {item.abstractTh}
                    </p>

                    {/* Authors and Advisor Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2 sm:pl-15 pt-1">
                      <div>
                        <span>ผู้จัดทำ: </span>
                        <span className="text-gray-900 font-semibold">
                          {item.studentNames.join(' และ ')}
                        </span>
                      </div>

                      <div>
                        <span>ที่ปรึกษา: </span>
                        <span className="text-[#0f766e] font-semibold">
                          {item.advisorNames.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Meta & View Details */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs sm:pl-15">
                      <span className="text-gray-400 font-medium">
                        รหัสโครงงาน {item.code} · เข้าชม {item.viewCount || 0} ครั้ง
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenThesis(item);
                        }}
                        className="text-[#0f766e] hover:text-[#115e59] font-bold flex items-center gap-1 group-hover:translate-x-1 transition cursor-pointer"
                      >
                        <span>ดูรายละเอียด</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* 5. Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-200/80 text-xs text-gray-500">
                  <span>หน้า {currentPage} จาก {totalPages}</span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl font-bold text-xs transition cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#0f766e] text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
