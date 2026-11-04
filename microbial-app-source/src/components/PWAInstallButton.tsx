import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition active:scale-[0.98]"
        title="ติดตั้งลงเครื่องเพื่อเปิดใช้งานสะดวกเหมือนแอปทั่วไป"
      >
        <Smartphone className="w-4 h-4" />
        <span>ติดตั้งแอปลงเครื่อง</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition"
        >
          <Smartphone className="w-4 h-4" />
          <span>ติดตั้งบน iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    ติดตั้งบน iPhone / iPad
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">ขั้นตอนที่ 1</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      แตะปุ่ม <strong>แชร์ (Share)</strong> ที่แถบเมนูด้านล่างของ Safari
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                  <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex-shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">ขั้นตอนที่ 2</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      เลื่อนลงมาแล้วเลือก <strong>&quot;เพิ่มไปยังหน้าจอโฮม&quot; (Add to Home Screen)</strong>
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-teal-600 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-teal-700 transition"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
