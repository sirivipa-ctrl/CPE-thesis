import React from 'react';
import { X, BarChart3, PieChart, CheckCircle2, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Thesis } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theses: Thesis[];
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  theses
}) => {
  if (!isOpen) return null;

  const total = theses.length;
  const approved = theses.filter(t => t.status === 'approved').length;
  const inProgress = theses.filter(t => t.status !== 'approved').length;

  const categoryCounts = theses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const yearCounts = theses.reduce((acc, t) => {
    acc[t.academicYear] = (acc[t.academicYear] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">ภาพรวมสถิติปริญญานิพนธ์</h3>
              <p className="text-xs text-gray-500">รายงานการจัดเก็บและจำแนกตามสาขางานวิจัยและปีการศึกษา</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Metric cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 text-center">
            <span className="text-xs text-gray-500 font-medium">โครงงานทั้งหมด</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{total}</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 text-center">
            <span className="text-xs text-emerald-700 font-medium">สำเร็จสมบูรณ์</span>
            <div className="text-2xl font-black text-emerald-800 mt-1">{approved}</div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 text-center">
            <span className="text-xs text-blue-700 font-medium">กำลังดำเนินการ</span>
            <div className="text-2xl font-black text-blue-800 mt-1">{inProgress}</div>
          </div>
        </div>

        {/* Categories breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            สัดส่วนตามหมวดหมู่งานวิจัย
          </h4>
          <div className="space-y-2">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / (total || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-700">
                    <span className="font-medium">{cat}</span>
                    <span className="font-bold">{count} เรื่อง ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Year breakdown */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            จำแนกตามปีการศึกษา
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(yearCounts).map(([year, count]) => (
              <div key={year} className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">ปีการศึกษา {year}</span>
                <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {count} เรื่อง
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
