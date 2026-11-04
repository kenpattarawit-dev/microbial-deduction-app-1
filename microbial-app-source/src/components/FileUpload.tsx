import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, Sparkles, AlertCircle, FolderArchive } from 'lucide-react';
import { downloadSampleTemplateExcel, generateSampleWorkbookBuffer } from '../utils/sampleDataGenerator';

interface FileUploadProps {
  onFileLoaded: (buffer: ArrayBuffer, fileName: string) => void;
  isLoading: boolean;
  currentFileName?: string;
  errorMessage?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileLoaded,
  isLoading,
  currentFileName,
  errorMessage,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        onFileLoaded(buffer, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const handleSampleLoad = () => {
    const { buffer, fileName } = generateSampleWorkbookBuffer();
    onFileLoaded(buffer, fileName);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx, .xlsm, .xls"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Drag & Drop Area */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
          isDragOver
            ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
            : currentFileName
            ? 'border-teal-300 dark:border-teal-800 bg-teal-50/20 dark:bg-teal-950/10 hover:border-teal-400'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-teal-500 dark:hover:border-teal-500 bg-zinc-50/50 dark:bg-zinc-800/30'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${
              isDragOver ? 'scale-110 bg-teal-500 text-white' : 'bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400'
            }`}
          >
            {currentFileName ? (
              <FileSpreadsheet className="w-8 h-8" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              {currentFileName ? (
                <span>ไฟล์ปัจจุบัน: <span className="text-teal-600 dark:text-teal-400">{currentFileName}</span></span>
              ) : (
                'ลากและวางไฟล์ผลเพาะเชื้อที่นี่ หรือคลิกเพื่อเลือกไฟล์'
              )}
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              รองรับไฟล์ Excel นามสกุล <span className="font-medium text-zinc-700 dark:text-zinc-300">.xlsx, .xlsm, .xls</span> (อ่านเฉพาะชีทแรก)
            </p>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
          >
            {currentFileName ? 'เปลี่ยนไฟล์ Excel อื่น' : 'เลือกไฟล์จากอุปกรณ์'}
          </button>
        </div>
      </div>

      {/* Error message if reading failed */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-700 dark:text-red-300 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="font-semibold">ไม่สามารถอ่านข้อมูลไฟล์ได้</p>
            <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Quick Actions: Sample Data / Download Template */}
      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          ยังไม่มีไฟล์ทดสอบ?
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSampleLoad}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ทดลองด้วยข้อมูลตัวอย่างทันที</span>
          </button>

          <button
            type="button"
            onClick={downloadSampleTemplateExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>เทมเพลตตัวอย่าง (.xlsx)</span>
          </button>

          <a
            href="/microbial-app-source.zip"
            download="microbial-app-source.zip"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
            title="ดาวน์โหลดโฟลเดอร์โปรเจกต์และโค้ดทั้งหมดเป็นไฟล์ .zip เพื่อนำไปขึ้น GitHub"
          >
            <FolderArchive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>ดาวน์โหลดโค้ดทั้งโฟลเดอร์ (.zip)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
