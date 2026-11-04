import React from 'react';
import { Download, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { DeductionSummary, ParseResult } from '../types/microbial';

interface SummaryCardsProps {
  parseResult: ParseResult;
  summary: DeductionSummary;
  onDownloadExcel: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  parseResult,
  summary,
  onDownloadExcel,
}) => {
  const penalizedPersonsCount = summary.personSummaries.filter((p) => p.totalAmount > 0).length;
  const totalPersonsCount = parseResult.persons.length;
  const totalDaysCount = parseResult.dates.length;

  return (
    <div className="space-y-4">
      {/* Success Read Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
          <span className="font-semibold text-sm">
            อ่านสำเร็จ: <span className="underline decoration-teal-400 font-bold">{totalPersonsCount} คน</span>,{' '}
            <span className="underline decoration-teal-400 font-bold">{totalDaysCount} วัน</span>
          </span>
          <span className="text-xs text-teal-700 dark:text-teal-300 hidden sm:inline">
            (ชีท: {parseResult.sheetName})
          </span>
        </div>
        <div className="text-xs text-teal-700 dark:text-teal-300">
          ครอบคลุม Glove print และ Personal Monitoring
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highlight Card: Total Deduction Amount & Download CTA */}
        <div className="sm:col-span-2 bg-gradient-to-br from-red-500 via-rose-600 to-red-700 dark:from-red-600 dark:via-rose-700 dark:to-red-800 text-white rounded-2xl p-6 shadow-md shadow-red-500/10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-red-100">
                ยอดหักเงินรวมทั้งหมด
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs text-white">
                {summary.totalPenalizedPersonDays} คน-วัน
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                {summary.grandTotal.toLocaleString()}
              </span>
              <span className="text-lg font-medium text-red-100">บาท</span>
            </div>
            <p className="mt-1 text-xs text-red-100/90">
              หักจากพนักงาน {penalizedPersonsCount} คน (จากทั้งหมด {totalPersonsCount} คน)
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 relative z-10">
            <button
              onClick={onDownloadExcel}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white text-red-700 hover:bg-red-50 active:scale-[0.99] shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ Excel สรุป (สรุปหักเงิน.xlsx)</span>
            </button>
          </div>

          {/* Decorative background shape */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: Penalized Staff */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              พนักงานที่ถูกหักเงิน
            </span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                {penalizedPersonsCount}
              </span>
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                / {totalPersonsCount} คน
              </span>
            </div>
            <div className="mt-2 w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalPersonsCount > 0 ? (penalizedPersonsCount / totalPersonsCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {totalPersonsCount - penalizedPersonsCount} คน ผ่านเกณฑ์ 100% ไม่ถูกหักเงิน
          </p>
        </div>

        {/* Card 3: Breach Events */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              จุดที่พบเชื้อเกินเกณฑ์
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                {summary.totalBreachEvents}
              </span>
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">จุด/ครั้ง</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              เฉลี่ย {totalDaysCount > 0 ? (summary.totalBreachEvents / totalDaysCount).toFixed(1) : 0} จุดต่อวัน
            </p>
          </div>
          <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
            นับเฉพาะค่าตัวเลขที่มากกว่าเกณฑ์ (ไม่รวม TNTC)
          </p>
        </div>
      </div>
    </div>
  );
};
