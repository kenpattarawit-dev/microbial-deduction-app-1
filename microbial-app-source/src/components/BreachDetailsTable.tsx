import React, { useState } from 'react';
import { Search, CheckCircle, ShieldAlert } from 'lucide-react';
import { BreachDetail } from '../types/microbial';

interface BreachDetailsTableProps {
  breaches: BreachDetail[];
  cfuThreshold: number;
}

export const BreachDetailsTable: React.FC<BreachDetailsTableProps> = ({
  breaches,
  cfuThreshold,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Glove print' | 'Contact plate'>('ALL');
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'เช้า' | 'บ่าย' | 'OT'>('ALL');

  const filteredBreaches = breaches.filter((b) => {
    const matchesSearch =
      b.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.dateLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.cellAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' || b.category === categoryFilter;

    const matchesShift =
      shiftFilter === 'ALL' || b.shift === shiftFilter;

    return matchesSearch && matchesCategory && matchesShift;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
      {/* Header and Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              รายละเอียดที่ทำให้ถูกหักเงิน
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ทุกตำแหน่งและรอบเวลาที่ตรวจพบเชื้อเกินเกณฑ์ (&gt; {cfuThreshold} CFU)
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, วันที่, ตำแหน่ง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">ประเภททั้งหมด</option>
            <option value="Glove print">Glove print</option>
            <option value="Contact plate">Contact plate</option>
          </select>

          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">ทุกรอบเวลา</option>
            <option value="เช้า">รอบเช้า</option>
            <option value="บ่าย">รอบบ่าย</option>
            <option value="OT">รอบ OT</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
        {breaches.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-zinc-900 dark:text-white">
              ยอดเยี่ยม! ไม่พบจุดที่ตรวจพบเชื้อเกินเกณฑ์
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ทุกการตรวจมีค่าไม่เกิน {cfuThreshold} CFU ไม่มีพนักงานถูกหักเงิน
            </p>
          </div>
        ) : filteredBreaches.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">
            ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-100/90 dark:bg-zinc-800/90 sticky top-0 z-10 backdrop-blur-xs text-zinc-700 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold text-center w-12">
                  ลำดับ
                </th>
                <th scope="col" className="px-3 py-3 font-semibold whitespace-nowrap">
                  วันที่
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  ชื่อ-นามสกุล
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  ประเภท
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  ตำแหน่งตรวจ
                </th>
                <th scope="col" className="px-3 py-3 font-semibold text-center">
                  รอบ
                </th>
                <th scope="col" className="px-3 py-3 font-bold text-center">
                  เชื้อที่พบ (CFU)
                </th>
                <th scope="col" className="px-3 py-3 font-semibold text-center text-zinc-500 dark:text-zinc-400">
                  เซลล์ในไฟล์เดิม
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
              {filteredBreaches.map((b, idx) => (
                <tr
                  key={b.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-3 py-2.5 text-center text-zinc-500 dark:text-zinc-400">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {b.dateLabel}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {b.personName}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        b.category === 'Glove print'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      }`}
                    >
                      {b.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {b.position}
                  </td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {b.shift}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900">
                      {b.cfu} CFU
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {b.cellAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
        <span>พบเชื้อเกินเกณฑ์ทั้งหมด {filteredBreaches.length} จุด (จากทั้งหมด {breaches.length} จุด)</span>
        <span>เกณฑ์: &gt; {cfuThreshold} CFU</span>
      </div>
    </div>
  );
};
