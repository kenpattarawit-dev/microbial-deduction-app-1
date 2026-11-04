import * as XLSX from 'xlsx';
import { DeductionSummary, ParseResult } from '../types/microbial';

export function exportDeductionsToExcel(
  parseResult: ParseResult,
  summary: DeductionSummary,
  cfuThreshold: number,
  deductionRate: number
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: สรุปหักเงิน
  const sheet1Data: any[][] = [];

  // Title / Metadata info
  sheet1Data.push(['ตารางสรุปการหักเงินจากผลเพาะเชื้อ']);
  sheet1Data.push([
    `เกณฑ์หักเงิน: พบเชื้อมากกว่า ${cfuThreshold} CFU | อัตราหัก: ${deductionRate} บาท/คน/วัน`,
  ]);
  sheet1Data.push([`ไฟล์ต้นทาง: ${parseResult.fileName}`, `วันที่ส่งออก: ${new Date().toLocaleDateString('th-TH')}`]);
  sheet1Data.push([]); // blank row

  // Header row
  const headerRow: string[] = ['ลำดับ', 'ชื่อ-นามสกุล'];
  for (const d of parseResult.dates) {
    headerRow.push(d.dateLabel);
  }
  headerRow.push('รวม (บาท)');
  sheet1Data.push(headerRow);

  // Rows for each person
  summary.personSummaries.forEach((person, idx) => {
    const row: any[] = [idx + 1, person.personName];
    for (const d of parseResult.dates) {
      const amt = person.dailyDeductions[d.dateLabel] || 0;
      row.push(amt > 0 ? amt : '-');
    }
    row.push(person.totalAmount);
    sheet1Data.push(row);
  });

  // Total summary row
  const totalRow: any[] = ['', 'รวมทั้งหมด (บาท)'];
  for (const d of parseResult.dates) {
    totalRow.push(summary.dateTotals[d.dateLabel] || 0);
  }
  totalRow.push(summary.grandTotal);
  sheet1Data.push(totalRow);

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

  // Set column widths for Sheet 1
  const ws1Cols = [
    { wch: 8 },  // ลำดับ
    { wch: 26 }, // ชื่อ-นามสกุล
  ];
  for (let i = 0; i < parseResult.dates.length; i++) {
    ws1Cols.push({ wch: 12 });
  }
  ws1Cols.push({ wch: 14 }); // รวม
  ws1['!cols'] = ws1Cols;

  XLSX.utils.book_append_sheet(wb, ws1, 'สรุปหักเงิน');

  // 2. Sheet 2: รายละเอียด
  const sheet2Data: any[][] = [];
  sheet2Data.push(['รายละเอียดจุดที่ตรวจพบเชื้อเกินเกณฑ์และทำให้ถูกหักเงิน']);
  sheet2Data.push([`เกณฑ์ที่กำหนด: มากกว่า ${cfuThreshold} CFU`]);
  sheet2Data.push([]);

  // Detail headers
  const detailHeaders = [
    'ลำดับ',
    'วันที่',
    'ชื่อ-นามสกุล',
    'ประเภทการตรวจ',
    'ตำแหน่ง',
    'รอบเวลา',
    'จำนวนเชื้อที่พบ (CFU)',
    'ตำแหน่งเซลล์ในไฟล์เดิม',
  ];
  sheet2Data.push(detailHeaders);

  if (summary.allBreaches.length === 0) {
    sheet2Data.push(['-', '-', 'ไม่พบรายการที่เกินเกณฑ์', '-', '-', '-', 0, '-']);
  } else {
    summary.allBreaches.forEach((b, idx) => {
      sheet2Data.push([
        idx + 1,
        b.dateLabel,
        b.personName,
        b.category,
        b.position,
        b.shift,
        b.cfu,
        b.cellAddress,
      ]);
    });
  }

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!cols'] = [
    { wch: 8 },
    { wch: 14 },
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 12 },
    { wch: 22 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, ws2, 'รายละเอียด');

  // Download directly from browser
  XLSX.writeFile(wb, 'สรุปหักเงิน.xlsx');
}
