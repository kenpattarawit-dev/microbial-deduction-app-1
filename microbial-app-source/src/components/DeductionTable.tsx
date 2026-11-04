import React, { useState } from 'react';
import { Search, Table, LayoutGrid, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DeductionSummary, ParseResult } from '../types/microbial';

interface DeductionTableProps {
  parseResult: ParseResult;
  summary: DeductionSummary;
  deductionRate: number;
}

export const DeductionTable: React.FC<DeductionTableProps> = ({
  parseResult,
  summary,
  deductionRate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyDeducted, setShowOnlyDeducted] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  // Filter persons
  const filteredPersons = summary.personSummaries.filter((p) => {
    const matchesSearch = p.personName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = showOnlyDeducted ? p.totalAmount > 0 : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              สรุปรายคนรายวัน (บาท)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ช่องที่ถูกหักไฮไลต์สีแดง ช่องที่ไม่ถูกหักแสดง &quot;-&quot;
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Search */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Mobile View Toggle */}
          <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>ตารางเต็ม</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>การ์ดมือถือ</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowOnlyDeducted(!showOnlyDeducted)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              showOnlyDeducted
                ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            {showOnlyDeducted ? 'แสดงทั้งหมด' : 'เฉพาะผู้ถูกหัก'}
          </button>
        </div>
      </div>

      {/* Swipe Hint for Mobile View (Visible on small screens in Table Mode) */}
      {viewMode === 'table' && (
        <div className="sm:hidden px-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>👈 เลื่อนซ้าย-ขวาเพื่อดูวันที่ทั้งหมด</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">{parseResult.dates.length} วัน</span>
        </div>
      )}

      {/* 1. TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="relative overflow-x-auto max-h-[600px] border-b border-zinc-100 dark:border-zinc-800 scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-100/95 dark:bg-zinc-800/95 sticky top-0 z-20 backdrop-blur-xs text-zinc-700 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold text-center w-12 sticky left-0 z-30 bg-zinc-100 dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 shadow-xs">
                  ลำดับ
                </th>
                <th scope="col" className="px-4 py-3 font-semibold min-w-[170px] sticky left-12 z-30 bg-zinc-100 dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 shadow-xs">
                  ชื่อ-นามสกุล
                </th>
                {parseResult.dates.map((d) => (
                  <th
                    key={d.dateIndex}
                    scope="col"
                    className="px-3 py-3 font-semibold text-center min-w-[72px] whitespace-nowrap border-r border-zinc-200/60 dark:border-zinc-700/60"
                  >
                    {d.dateLabel}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-4 py-3 font-bold text-center min-w-[90px] sticky right-0 z-20 bg-zinc-200/95 dark:bg-zinc-700/95 border-l border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white"
                >
                  รวม (บาท)
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
              {filteredPersons.length === 0 ? (
                <tr>
                  <td
                    colSpan={parseResult.dates.length + 3}
                    className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    ไม่พบข้อมูลพนักงานที่ตรงกับการค้นหา
                  </td>
                </tr>
              ) : (
                filteredPersons.map((person, idx) => {
                  const hasDeduction = person.totalAmount > 0;
                  return (
                    <tr
                      key={person.personName}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-center text-zinc-500 dark:text-zinc-400 sticky left-0 z-10 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100 sticky left-12 z-10 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 whitespace-nowrap shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span>{person.personName}</span>
                          {hasDeduction && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          )}
                        </div>
                      </td>

                      {parseResult.dates.map((d) => {
                        const amount = person.dailyDeductions[d.dateLabel] || 0;
                        const isDeducted = amount > 0;

                        return (
                          <td
                            key={d.dateIndex}
                            className={`px-3 py-2.5 text-center border-r border-zinc-200/40 dark:border-zinc-800/60 transition-colors ${
                              isDeducted
                                ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-bold'
                                : 'text-zinc-400 dark:text-zinc-600'
                            }`}
                          >
                            {isDeducted ? amount : '-'}
                          </td>
                        );
                      })}

                      <td
                        className={`px-4 py-2.5 text-center font-bold sticky right-0 z-10 border-l border-zinc-300 dark:border-zinc-700 ${
                          hasDeduction
                            ? 'bg-red-100/80 dark:bg-red-950/80 text-red-800 dark:text-red-200'
                            : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {person.totalAmount > 0 ? person.totalAmount.toLocaleString() : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            <tfoot className="bg-zinc-200 dark:bg-zinc-800 sticky bottom-0 z-20 font-bold text-zinc-900 dark:text-white border-t-2 border-zinc-300 dark:border-zinc-700">
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-3 text-right sticky left-0 z-30 bg-zinc-200 dark:bg-zinc-800 border-r border-zinc-300 dark:border-zinc-700"
                >
                  รวมทั้งหมด (บาท)
                </td>
                {parseResult.dates.map((d) => {
                  const dayTotal = summary.dateTotals[d.dateLabel] || 0;
                  return (
                    <td
                      key={d.dateIndex}
                      className={`px-3 py-3 text-center border-r border-zinc-300/70 dark:border-zinc-700/70 ${
                        dayTotal > 0
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {dayTotal > 0 ? dayTotal.toLocaleString() : '-'}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center text-sm font-extrabold sticky right-0 z-20 bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 border-l border-zinc-300 dark:border-zinc-600">
                  {summary.grandTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* 2. MOBILE CARD VIEW (Optimized for small smartphone screens) */
        <div className="p-4 space-y-3">
          {filteredPersons.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm">
              ไม่พบข้อมูลพนักงาน
            </div>
          ) : (
            filteredPersons.map((person, idx) => {
              const hasDeduction = person.totalAmount > 0;
              const isExpanded = expandedPerson === person.personName;
              const breachDates = Object.entries(person.dailyDeductions).filter(
                ([_, amt]) => amt > 0
              );

              return (
                <div
                  key={person.personName}
                  className={`rounded-xl border transition-all ${
                    hasDeduction
                      ? 'border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div
                    onClick={() => setExpandedPerson(isExpanded ? null : person.personName)}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">
                          {person.personName}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {hasDeduction ? (
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              ถูกหัก {person.breachDaysCount} วัน ({breachDates.map(([d]) => d).join(', ')})
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 inline" />
                              ผ่านเกณฑ์ทุกวัน
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span
                          className={`text-base font-bold ${
                            hasDeduction
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-zinc-400 dark:text-zinc-500'
                          }`}
                        >
                          {person.totalAmount > 0 ? `${person.totalAmount} บ.` : '0 บ.'}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-zinc-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded detail for this person on mobile */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        สรุปรายวัน ({parseResult.dates.length} วัน):
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {parseResult.dates.map((d) => {
                          const amt = person.dailyDeductions[d.dateLabel] || 0;
                          return (
                            <div
                              key={d.dateIndex}
                              className={`p-2 rounded-lg text-center ${
                                amt > 0
                                  ? 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900 font-bold'
                                  : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400'
                              }`}
                            >
                              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                {d.dateLabel}
                              </div>
                              <div className="mt-0.5">{amt > 0 ? `${amt} บ.` : '-'}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer Legend */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 inline-block" />
            <span>ถูกหักเงิน ({deductionRate} บาท)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-zinc-400 dark:text-zinc-600 font-bold">-</span>
            <span>ไม่พบเชื้อเกินเกณฑ์</span>
          </span>
        </div>
        <span>แสดง {filteredPersons.length} จาก {summary.personSummaries.length} คน</span>
      </div>
    </div>
  );
};
