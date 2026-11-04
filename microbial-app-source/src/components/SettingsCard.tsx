import React from 'react';
import { Sliders, HelpCircle, CheckCircle2 } from 'lucide-react';

interface SettingsCardProps {
  cfuThreshold: number;
  onCfuThresholdChange: (value: number) => void;
  deductionRate: number;
  onDeductionRateChange: (value: number) => void;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  cfuThreshold,
  onCfuThresholdChange,
  deductionRate,
  onDeductionRateChange,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
            <Sliders className="w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            เงื่อนไขการคำนวณหักเงิน
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
          คำนวณใหม่ทันทีที่ปรับค่า
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Field 1: CFU Threshold */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            หักเมื่อพบมากกว่า (CFU)
          </label>
          <div className="relative rounded-xl shadow-xs">
            <input
              type="number"
              min="0"
              step="1"
              value={cfuThreshold}
              onChange={(e) => onCfuThresholdChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full pl-3.5 pr-14 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs font-medium text-zinc-400 dark:text-zinc-500">
              CFU
            </div>
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
            <span>
              {cfuThreshold} พอดีไม่ถูกหัก, ตั้งแต่ {cfuThreshold + 1} CFU ขึ้นไปจะถูกหัก
            </span>
          </p>
        </div>

        {/* Field 2: Deduction Rate */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            อัตราหัก (บาท/คน/วัน)
          </label>
          <div className="relative rounded-xl shadow-xs">
            <input
              type="number"
              min="0"
              step="1"
              value={deductionRate}
              onChange={(e) => onDeductionRateChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full pl-3.5 pr-28 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs font-medium text-zinc-400 dark:text-zinc-500">
              บาท / คน / วัน
            </div>
          </div>
          <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
            <span>
              หากพบเกินเกณฑ์กี่ตำแหน่ง/รอบในวันเดียวกัน จะหักเพียง 1 ครั้ง ({deductionRate} บาท)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
