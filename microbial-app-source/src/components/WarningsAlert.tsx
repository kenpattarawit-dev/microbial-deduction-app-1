import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Calendar, ChevronDown, ChevronUp, FileEdit } from 'lucide-react';
import { TextWarning, YearAnomalyWarning } from '../types/microbial';

interface WarningsAlertProps {
  warnings: TextWarning[];
  yearAnomalies: YearAnomalyWarning[];
}

export const WarningsAlert: React.FC<WarningsAlertProps> = ({
  warnings,
  yearAnomalies,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasWarnings = warnings.length > 0;
  const hasYearAnomalies = yearAnomalies.length > 0;

  if (!hasWarnings && !hasYearAnomalies) {
    return null;
  }

  const displayedWarnings = isExpanded ? warnings : warnings.slice(0, 3);

  return (
    <div className="space-y-3">
      {/* 1. Year Anomaly Alert */}
      {hasYearAnomalies && (
        <div className="rounded-2xl p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold">
                แจ้งเตือน: พบวันที่ที่ปีไม่ตรงกับข้อมูลส่วนใหญ่ (อาจพิมพ์ปีผิด)
              </h4>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                รายการปีที่ผิดปกติจะไม่ส่งผลกระทบต่อการคำนวณยอดเงิน แต่แนะนำให้ตรวจเช็กความถูกต้อง:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {yearAnomalies.map((ya, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                  >
                    วันที่: {ya.dateLabel} (ปี {ya.detectedYear} ≠ ปีส่วนใหญ่ {ya.majorityYear})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Non-numeric Text In Cells Alert */}
      {hasWarnings && (
        <div className="rounded-2xl p-4 sm:p-5 bg-amber-50/90 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                  <span>แจ้งเตือน: พบข้อความที่ไม่ใช่ตัวเลขในตาราง ({warnings.length} จุด)</span>
                </h4>
                <p className="mt-1 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                  ข้อความเหล่านี้ (เช่น &quot;*13 รา&quot;) <strong>จะไม่ถูกนำมาคำนวณหักเงิน</strong> หากต้องการให้นับ กรุณาแก้ไขเป็นตัวเลขในไฟล์ Excel แล้วอัปโหลดใหม่
                </p>
              </div>
            </div>

            {warnings.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-amber-800 dark:text-amber-200 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 transition flex-shrink-0"
              >
                <span>{isExpanded ? 'ย่อรายการ' : `ดูทั้งหมด (${warnings.length})`}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* List of Warning Items */}
          <div className="mt-3.5 space-y-2">
            {displayedWarnings.map((w) => (
              <div
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-amber-200/80 dark:border-amber-900/80 text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-200/80 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                    เซลล์ {w.cellAddress}
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {w.personName}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">({w.position})</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    วันที่ {w.dateLabel} รอบ {w.shift}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 dark:text-zinc-400">พบข้อความ:</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900">
                    &quot;{w.rawText}&quot;
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/60 flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
            <FileEdit className="w-3.5 h-3.5" />
            <span>คำแนะนำ: หากข้อความดังกล่าวคือผลการตรวจ ให้พิมพ์เฉพาะตัวเลข CFU ลงในเซลล์นั้นๆ</span>
          </div>
        </div>
      )}
    </div>
  );
};
