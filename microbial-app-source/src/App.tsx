/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SettingsCard } from './components/SettingsCard';
import { FileUpload } from './components/FileUpload';
import { SummaryCards } from './components/SummaryCards';
import { WarningsAlert } from './components/WarningsAlert';
import { DeductionTable } from './components/DeductionTable';
import { BreachDetailsTable } from './components/BreachDetailsTable';
import { ParseResult } from './types/microbial';
import { parseMicrobialWorkbook } from './utils/excelParser';
import { calculateDeductions } from './utils/calculator';
import { exportDeductionsToExcel } from './utils/excelExporter';
import { Shield, Info } from 'lucide-react';

export default function App() {
  // Theme state: dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Settings
  const [cfuThreshold, setCfuThreshold] = useState<number>(5);
  const [deductionRate, setDeductionRate] = useState<number>(10);

  // File & Parsing state
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileLoaded = (buffer: ArrayBuffer, fileName: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = parseMicrobialWorkbook(buffer, fileName);
      if (result.success) {
        setParseResult(result);
        setCurrentFileName(fileName);
        setErrorMessage('');
      } else {
        setParseResult(null);
        setErrorMessage(result.errorMessage || 'เกิดข้อผิดพลาดในการประมวลผลไฟล์');
      }
    } catch (err: any) {
      setParseResult(null);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setParseResult(null);
    setCurrentFileName('');
    setErrorMessage('');
  };

  // Recalculate deductions instantaneously whenever parseResult, threshold, or rate changes
  const summary = useMemo(() => {
    if (!parseResult || !parseResult.success) return null;
    return calculateDeductions(parseResult, cfuThreshold, deductionRate);
  }, [parseResult, cfuThreshold, deductionRate]);

  // Download Excel Handler
  const handleDownloadExcel = () => {
    if (!parseResult || !summary) return;
    exportDeductionsToExcel(parseResult, summary, cfuThreshold, deductionRate);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors selection:bg-teal-500 selection:text-white">
      {/* App Header */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onReset={handleReset}
        hasData={!!parseResult}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Control Section: Settings & File Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Settings: 5 cols on desktop */}
          <div className="lg:col-span-5 w-full">
            <SettingsCard
              cfuThreshold={cfuThreshold}
              onCfuThresholdChange={setCfuThreshold}
              deductionRate={deductionRate}
              onDeductionRateChange={setDeductionRate}
            />
          </div>

          {/* File Upload / Drag & Drop: 7 cols on desktop */}
          <div className="lg:col-span-7 w-full">
            <FileUpload
              onFileLoaded={handleFileLoaded}
              isLoading={isLoading}
              currentFileName={currentFileName}
              errorMessage={errorMessage}
            />
          </div>
        </div>

        {/* When data is loaded and parsed */}
        {parseResult && summary && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Summary Cards & Big Download CTA */}
            <SummaryCards
              parseResult={parseResult}
              summary={summary}
              onDownloadExcel={handleDownloadExcel}
            />

            {/* 2. Yellow Warnings Alert (if any non-numeric text or year anomaly) */}
            <WarningsAlert
              warnings={parseResult.warnings}
              yearAnomalies={parseResult.yearAnomalies}
            />

            {/* 3. Table 1: สรุปรายคนรายวัน (บาท) */}
            <DeductionTable
              parseResult={parseResult}
              summary={summary}
              deductionRate={deductionRate}
            />

            {/* 4. Table 2: รายละเอียดที่ทำให้ถูกหัก */}
            <BreachDetailsTable
              breaches={summary.allBreaches}
              cfuThreshold={cfuThreshold}
            />
          </div>
        )}

        {/* When no file is loaded yet - Helpful Guide */}
        {!parseResult && !errorMessage && (
          <div className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2 mb-3 text-zinc-900 dark:text-white font-semibold text-base">
              <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>หลักเกณฑ์การคำนวณและโครงสร้างไฟล์ Excel</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[11px] font-bold">1</span>
                  โครงสร้างหัวตาราง
                </h4>
                <p>
                  โปรแกรมค้นหาแถว <strong>&quot;Date Perform&quot;</strong> ในชีทแรก แล้วอ่านวันที่ทางขวาซึ่งแต่ละวันกินพื้นที่ 3 คอลัมน์ (เช้า / บ่าย / OT) โดยอัตโนมัติ
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[11px] font-bold">2</span>
                  ขอบเขตตารางที่ตรวจ
                </h4>
                <p>
                  คำนวณเฉพาะตาราง <strong>Glove print</strong> (ซ้าย, ขวา) และ <strong>Personal Monitoring / Contact plate</strong> (แขนซ้าย, แขนขวา, หน้าอก) และละเว้นตาราง Surface equipment โดยสิ้นเชิง
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[11px] font-bold">3</span>
                  กติกาหักเงินรายคนรายวัน
                </h4>
                <p>
                  หากวันเดียวกันพบเชื้อเกินเกณฑ์กี่ตำแหน่งหรือกี่รอบเวลา จะหักเพียง <strong>1 ครั้งต่อวัน ({deductionRate} บาท)</strong> ตรวจแยกรายเซลล์โดยไม่นำตัวเลขมาบวกกัน และ TNTC ไม่ถูกหัก
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-4 text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>คำนวณหักเงินจากผลเพาะเชื้อ — Client-Side Application สำหรับโรงงานผลิตยา</span>
          </div>
          <div>
            <span>ประมวลผลด้วย SheetJS (xlsx) ในหน่วยความจำของเบราว์เซอร์เท่านั้น</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
