import * as XLSX from 'xlsx';
import {
  DateColumnInfo,
  ParseResult,
  ReadingItem,
  ShiftType,
  TextWarning,
  YearAnomalyWarning,
} from '../types/microbial';

// Helper to convert cell value to string safely
function getCellString(cell: XLSX.CellObject | undefined): string {
  if (!cell || cell.v === undefined || cell.v === null) return '';
  return String(cell.w ?? cell.v).trim();
}

// Helper to check if text contains any keywords
function containsText(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

// Parse date label and year/month/day
function parseDateCell(
  cell: XLSX.CellObject | undefined
): { label: string; year?: number; month?: number; day?: number } | null {
  if (!cell || cell.v === undefined || cell.v === null) return null;

  const rawStr = getCellString(cell);
  if (!rawStr) return null;

  // Check if it's non-date text like limits or headers
  if (
    containsText(rawStr, [
      'limit',
      'standard',
      'microbial',
      'contamination',
      'เกณฑ์',
      'มาตรฐาน',
      'total',
      'รวม',
      'date perform',
    ])
  ) {
    return null;
  }

  // If cell is Excel Date object or serial number
  if (cell.t === 'd' && cell.v instanceof Date) {
    const d = cell.v;
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const shortYear = year % 100;
    return {
      label: `${day}/${month}/${shortYear < 10 ? '0' + shortYear : shortYear}`,
      year,
      month,
      day,
    };
  }

  if (cell.t === 'n' && typeof cell.v === 'number' && cell.v > 30000 && cell.v < 70000) {
    const parsed = XLSX.SSF.parse_date_code(cell.v);
    if (parsed) {
      const day = parsed.d;
      const month = parsed.m;
      const year = parsed.y;
      const shortYear = year % 100;
      return {
        label: `${day}/${month}/${shortYear < 10 ? '0' + shortYear : shortYear}`,
        year,
        month,
        day,
      };
    }
  }

  // Match typical Thai/Gregorian date strings like "1/10/26", "01/10/2026", "1-10-26"
  const match = rawStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    let rawYear = parseInt(match[3], 10);
    let year = rawYear;

    // If 2 digits, assume 20xx or 25xx
    if (rawYear < 100) {
      year = 2000 + rawYear;
    }

    return {
      label: rawStr,
      year,
      month,
      day,
    };
  }

  // If it's a non-empty string that could be a date label (e.g. "1 ต.ค. 69")
  if (/\d/.test(rawStr) && rawStr.length <= 15) {
    return {
      label: rawStr,
    };
  }

  return null;
}

export function parseMicrobialWorkbook(fileData: ArrayBuffer, fileName: string): ParseResult {
  try {
    const workbook = XLSX.read(fileData, {
      type: 'array',
      cellDates: true,
      cellStyles: true,
    });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        success: false,
        errorMessage: 'ไม่พบชีทในไฟล์ Excel ที่อัปโหลด',
        fileName,
        dates: [],
        persons: [],
        readings: [],
        warnings: [],
        yearAnomalies: [],
        sheetName: '',
      };
    }

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    if (!sheet || !sheet['!ref']) {
      return {
        success: false,
        errorMessage: `ชีทแรก "${firstSheetName}" ไม่มีข้อมูล`,
        fileName,
        dates: [],
        persons: [],
        readings: [],
        warnings: [],
        yearAnomalies: [],
        sheetName: firstSheetName,
      };
    }

    const range = XLSX.utils.decode_range(sheet['!ref']);
    const maxRow = range.e.r;
    const maxCol = range.e.c;

    // 1. Locate "Date Perform" cell within the first 25 rows
    let datePerformRow = -1;
    let datePerformCol = -1;

    for (let r = 0; r <= Math.min(25, maxRow); r++) {
      for (let c = 0; c <= Math.min(20, maxCol); c++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })];
        const val = getCellString(cell);
        if (containsText(val, ['date perform'])) {
          datePerformRow = r;
          datePerformCol = c;
          break;
        }
      }
      if (datePerformRow !== -1) break;
    }

    if (datePerformRow === -1) {
      return {
        success: false,
        errorMessage:
          'ไม่พบหัวข้อ "Date Perform" ใน 25 แถวแรกของชีท กรุณาตรวจสอบว่าเป็นไฟล์บันทึกผลเพาะเชื้อตามรูปแบบที่กำหนดหรือไม่',
        fileName,
        dates: [],
        persons: [],
        readings: [],
        warnings: [],
        yearAnomalies: [],
        sheetName: firstSheetName,
      };
    }

    // 2. Read Date columns starting to the right of "Date Perform"
    // Each date spans 3 columns (เช้า, บ่าย, OT)
    const dates: DateColumnInfo[] = [];
    let c = datePerformCol + 1;
    let emptyStreak = 0;

    while (c <= maxCol) {
      const cell = sheet[XLSX.utils.encode_cell({ r: datePerformRow, c })];
      const parsedDate = parseDateCell(cell);

      if (parsedDate) {
        emptyStreak = 0;
        dates.push({
          dateIndex: dates.length,
          colStart: c,
          dateLabel: parsedDate.label,
          year: parsedDate.year,
          month: parsedDate.month,
          day: parsedDate.day,
          rawDateValue: cell?.v,
        });
        // Date spans 3 columns (e.g., G, H, I for เช้า, บ่าย, OT)
        c += 3;
      } else {
        // If cell has limit/standard text, stop scanning dates
        const cellStr = getCellString(cell);
        if (
          cellStr &&
          containsText(cellStr, [
            'limit',
            'standard',
            'microbial',
            'contamination',
            'เกณฑ์',
            'มาตรฐาน',
            'remark',
            'หมายเหตุ',
          ])
        ) {
          break;
        }

        // Check if there is an empty column or end of dates
        emptyStreak++;
        if (emptyStreak >= 2) {
          break;
        }
        c += 3;
      }
    }

    if (dates.length === 0) {
      return {
        success: false,
        errorMessage: `พบคำว่า "Date Perform" ที่แถว ${datePerformRow + 1} แต่ไม่พบคอลัมน์วันที่ทางด้านขวา กรุณาตรวจสอบหัวตารางวันที่`,
        fileName,
        dates: [],
        persons: [],
        readings: [],
        warnings: [],
        yearAnomalies: [],
        sheetName: firstSheetName,
      };
    }

    // 3. Find Section Headers in Column A (Index 0) or Column B (Index 1)
    let gloveHeaderRow = -1;
    let personalHeaderRow = -1;
    let surfaceHeaderRow = -1;

    for (let r = 0; r <= maxRow; r++) {
      const cellA = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
      const valA = getCellString(cellA);
      const cellB = sheet[XLSX.utils.encode_cell({ r, c: 1 })];
      const valB = getCellString(cellB);
      const combined = `${valA} ${valB}`;

      if (gloveHeaderRow === -1 && containsText(combined, ['glove print'])) {
        gloveHeaderRow = r;
      } else if (
        personalHeaderRow === -1 &&
        (containsText(combined, ['personal monitoring']) || containsText(combined, ['contact plate']))
      ) {
        personalHeaderRow = r;
      } else if (
        surfaceHeaderRow === -1 &&
        personalHeaderRow !== -1 &&
        containsText(combined, ['surface equipment', 'surface', 'air sampling', 'tsa settle plate'])
      ) {
        surfaceHeaderRow = r;
      }
    }

    if (gloveHeaderRow === -1 && personalHeaderRow === -1) {
      return {
        success: false,
        errorMessage:
          'ไม่พบหัวตาราง "Glove print" หรือ "Personal Monitoring / Contact plate" ในคอลัมน์ A/B กรุณาตรวจสอบโครงสร้างไฟล์',
        fileName,
        dates: [],
        persons: [],
        readings: [],
        warnings: [],
        yearAnomalies: [],
        sheetName: firstSheetName,
      };
    }

    // Boundaries:
    // Glove section: from gloveHeaderRow down to personalHeaderRow
    // Contact plate section: from personalHeaderRow down to surfaceHeaderRow (or maxRow)
    const gloveEndRow = personalHeaderRow !== -1 ? personalHeaderRow - 1 : (surfaceHeaderRow !== -1 ? surfaceHeaderRow - 1 : maxRow);
    const personalEndRow = surfaceHeaderRow !== -1 ? surfaceHeaderRow - 1 : maxRow;

    const readings: ReadingItem[] = [];
    const warnings: TextWarning[] = [];
    const personSet = new Set<string>();

    const shifts: ShiftType[] = ['เช้า', 'บ่าย', 'OT'];

    // Helper to process rows for a table section
    const processSection = (
      startRow: number,
      endRow: number,
      category: 'Glove print' | 'Contact plate'
    ) => {
      let currentPerson = '';

      for (let r = startRow; r <= endRow; r++) {
        const cellA = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
        const valA = getCellString(cellA);

        // Check if row is a header row to skip
        if (
          containsText(valA, ['ชื่อ', 'name', 'ลำดับ', 'no.', 'date perform', 'glove print', 'personal monitoring', 'contact plate'])
        ) {
          continue;
        }

        // Column D is usually index 3 (position/body part)
        // Some templates might have it in index 2 or 3
        let position = getCellString(sheet[XLSX.utils.encode_cell({ r, c: 3 })]);
        if (!position) {
          // fallback check col C (index 2) or col E (index 4)
          const posC = getCellString(sheet[XLSX.utils.encode_cell({ r, c: 2 })]);
          const posE = getCellString(sheet[XLSX.utils.encode_cell({ r, c: 4 })]);
          if (containsText(posC, ['ซ้าย', 'ขวา', 'แขน', 'อก', 'left', 'right', 'chest', 'arm'])) {
            position = posC;
          } else if (containsText(posE, ['ซ้าย', 'ขวา', 'แขน', 'อก', 'left', 'right', 'chest', 'arm'])) {
            position = posE;
          }
        }

        // If row is a subheader like "เช้า / บ่าย / OT" or "Total" or empty row
        if (containsText(valA, ['เช้า', 'บ่าย', 'ot', 'total', 'รวม']) || containsText(position, ['เช้า', 'บ่าย', 'ot', 'total', 'รวม'])) {
          continue;
        }

        // Update currentPerson if col A has a valid person name
        if (valA && !/^\d+$/.test(valA)) {
          // not just a row number
          currentPerson = valA;
          personSet.add(currentPerson);
        }

        // If no person or no position, skip this row
        if (!currentPerson || !position) {
          continue;
        }

        // Now read cells for each date and each shift
        for (const dateInfo of dates) {
          for (let sIdx = 0; sIdx < 3; sIdx++) {
            const shiftCol = dateInfo.colStart + sIdx;
            const shiftName = shifts[sIdx];
            const cellAddress = XLSX.utils.encode_cell({ r, c: shiftCol });
            const cell = sheet[cellAddress];
            const rawStr = getCellString(cell);

            // Empty cell or whitespace -> 0 CFU
            if (!rawStr) {
              readings.push({
                id: `${category}-${r}-${shiftCol}`,
                personName: currentPerson,
                category,
                position,
                dateLabel: dateInfo.dateLabel,
                shift: shiftName,
                cfu: 0,
                isTNTC: false,
                cellAddress,
              });
              continue;
            }

            // TNTC -> 0 CFU, not deducted
            if (rawStr.toUpperCase() === 'TNTC') {
              readings.push({
                id: `${category}-${r}-${shiftCol}`,
                personName: currentPerson,
                category,
                position,
                dateLabel: dateInfo.dateLabel,
                shift: shiftName,
                cfu: 0,
                isTNTC: true,
                cellAddress,
              });
              continue;
            }

            // Pure number check: e.g. "0", "5", "12", or cell.t === 'n'
            const cleanedNum = Number(rawStr);
            if (!isNaN(cleanedNum) && /^-?\d+(\.\d+)?$/.test(rawStr.replace(/,/g, ''))) {
              const cfuVal = Math.max(0, Math.floor(cleanedNum));
              readings.push({
                id: `${category}-${r}-${shiftCol}`,
                personName: currentPerson,
                category,
                position,
                dateLabel: dateInfo.dateLabel,
                shift: shiftName,
                cfu: cfuVal,
                isTNTC: false,
                cellAddress,
              });
            } else {
              // Non-numeric text (e.g. "*13 รา", ">100", "ปนเปื้อน")
              // Not counted towards deduction, but trigger warning!
              readings.push({
                id: `${category}-${r}-${shiftCol}`,
                personName: currentPerson,
                category,
                position,
                dateLabel: dateInfo.dateLabel,
                shift: shiftName,
                cfu: 0,
                isTNTC: false,
                cellAddress,
                rawText: rawStr,
                isUnparsedText: true,
              });

              warnings.push({
                id: `warn-${cellAddress}`,
                cellAddress,
                personName: currentPerson,
                position,
                dateLabel: dateInfo.dateLabel,
                shift: shiftName,
                rawText: rawStr,
              });
            }
          }
        }
      }
    };

    // Process Glove Print
    if (gloveHeaderRow !== -1) {
      processSection(gloveHeaderRow + 1, gloveEndRow, 'Glove print');
    }

    // Process Personal Monitoring / Contact Plate
    if (personalHeaderRow !== -1) {
      processSection(personalHeaderRow + 1, personalEndRow, 'Contact plate');
    }

    const persons = Array.from(personSet);

    if (persons.length === 0) {
      return {
        success: false,
        errorMessage:
          'ไม่พบรายชื่อพนักงานในคอลัมน์ A ของตาราง Glove print หรือ Personal Monitoring กรุณาตรวจสอบตำแหน่งรายชื่อ',
        fileName,
        dates,
        persons: [],
        readings: [],
        warnings,
        yearAnomalies: [],
        sheetName: firstSheetName,
      };
    }

    // 4. Detect Year Anomalies
    const yearCounts: Record<number, number> = {};
    for (const d of dates) {
      if (d.year) {
        yearCounts[d.year] = (yearCounts[d.year] || 0) + 1;
      }
    }

    let majorityYear = 0;
    let maxCount = 0;
    for (const [yStr, count] of Object.entries(yearCounts)) {
      const y = Number(yStr);
      if (count > maxCount) {
        maxCount = count;
        majorityYear = y;
      }
    }

    const yearAnomalies: YearAnomalyWarning[] = [];
    if (majorityYear > 0) {
      for (const d of dates) {
        if (d.year && d.year !== majorityYear) {
          yearAnomalies.push({
            dateLabel: d.dateLabel,
            detectedYear: d.year,
            majorityYear,
          });
        }
      }
    }

    return {
      success: true,
      fileName,
      dates,
      persons,
      readings,
      warnings,
      yearAnomalies,
      sheetName: firstSheetName,
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: `เกิดข้อผิดพลาดในการอ่านไฟล์: ${err.message || String(err)}`,
      fileName,
      dates: [],
      persons: [],
      readings: [],
      warnings: [],
      yearAnomalies: [],
      sheetName: '',
    };
  }
}
