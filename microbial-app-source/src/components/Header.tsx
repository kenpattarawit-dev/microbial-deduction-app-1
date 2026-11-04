import React from 'react';
import { ShieldCheck, Moon, Sun, Microscope, RefreshCw, FolderArchive } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onReset?: () => void;
  hasData?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onReset,
  hasData,
}) => {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <Microscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                คำนวณหักเงินจากผลเพาะเชื้อ
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                QC โรงงานยา
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Glove Print & Personal Monitoring (Contact Plate)
            </p>
          </div>
        </div>

        {/* Action Controls & Privacy Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <PWAInstallButton />

          <a
            href="/microbial-app-source.zip"
            download="microbial-app-source.zip"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
            title="ดาวน์โหลดซอร์สโค้ดทั้งหมด (.zip) สำหรับนำไปขึ้น GitHub"
          >
            <FolderArchive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>ดาวน์โหลดโค้ด (.zip)</span>
          </a>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>ประมวลผลในเบราว์เซอร์ 100%</span>
          </div>

          {hasData && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="ล้างข้อมูลและอัปโหลดไฟล์ใหม่"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">เริ่มใหม่</span>
            </button>
          )}

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Toggle Theme"
            title={isDarkMode ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-600" />}
          </button>
        </div>
      </div>

      {/* Mobile privacy banner */}
      <div className="md:hidden px-4 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/40 border-t border-emerald-100 dark:border-emerald-900 text-center">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ไฟล์ประมวลผลในเครื่องของคุณ ไม่ส่งข้อมูลไปเซิร์ฟเวอร์ใดๆ
        </span>
      </div>
    </header>
  );
};
