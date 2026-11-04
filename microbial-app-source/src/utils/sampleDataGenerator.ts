import * as XLSX from 'xlsx';

export function generateSampleWorkbookBuffer(): { buffer: ArrayBuffer; fileName: string } {
  const wb = XLSX.utils.book_new();

  // Create grid with sufficient rows and cols
  const rows: any[][] = [];

  // Rows 0 - 3: Document Title & Metadata
  rows.push(['แบบบันทึกผลการตรวจสอบการปนเปื้อนจุลินทรีย์ในห้องสะอาด (Cleanroom Environmental Monitoring)']);
  rows.push(['โรงงานผลิตยาแผนปัจจุบัน ฝ่ายควบคุมคุณภาพ (QC Microbiological Laboratory)']);
  rows.push(['ประจำเดือน ตุลาคม 2569 (Grade B/C Area)']);
  rows.push([]);

  // Row 4: "Date Perform" in Column F (index 5)
  // Dates in G, J, M, P, S, V, Y (indices 6, 9, 12, 15, 18, 21, 24)
  const dateRow: any[] = ['', '', '', '', '', 'Date Perform'];
  const dates = [
    '01/10/26',
    '02/10/26',
    '03/10/26',
    '04/10/26',
    '05/10/25', // Intentional year anomaly to test warning
    '06/10/26',
    '07/10/26',
  ];

  for (const d of dates) {
    dateRow.push(d, '', ''); // 3 columns per date
  }
  dateRow.push('Limits for Microbial Contamination: Glove <= 5 CFU, Contact <= 5 CFU');
  rows.push(dateRow);

  // Row 5: Shifts (เช้า, บ่าย, OT) under each date
  const shiftRow: any[] = ['', '', '', '', '', 'รอบเวลา'];
  for (let i = 0; i < dates.length; i++) {
    shiftRow.push('เช้า', 'บ่าย', 'OT');
  }
  rows.push(shiftRow);

  // Row 6: Section 1 Header - Glove print
  rows.push(['Glove print (5 fingers print)']);

  // Row 7: Subheader
  rows.push(['ชื่อ-นามสกุล พนักงาน', 'รหัส', 'กะ', 'ตำแหน่งตรวจ']);

  // Staff members
  const staff = [
    { name: 'สมชาย ใจดี', code: 'EMP-01', shift: 'A' },
    { name: 'วรรณา สดใส', code: 'EMP-02', shift: 'A' },
    { name: 'กิตติศักดิ์ เจริญ', code: 'EMP-03', shift: 'B' },
    { name: 'นภาวรรณ มั่นคง', code: 'EMP-04', shift: 'B' },
  ];

  // Helper to generate sample values
  // Somchai on 02/10/26 afternoon has 7 CFU (breach)
  // Wanna on 04/10/26 morning has 8 CFU (breach)
  // Kittisak on 03/10/26 has "TNTC" (0 deduction)
  // Naphawan on 06/10/26 has "*13 รา" (warning text)
  const getGloveVal = (staffIdx: number, pos: string, dateIdx: number, shiftIdx: number): any => {
    if (staffIdx === 0 && pos === 'ขวา' && dateIdx === 1 && shiftIdx === 1) return 7; // Breach!
    if (staffIdx === 1 && pos === 'ซ้าย' && dateIdx === 3 && shiftIdx === 0) return 6; // Breach!
    if (staffIdx === 2 && pos === 'ซ้าย' && dateIdx === 2 && shiftIdx === 0) return 'TNTC'; // TNTC
    if (staffIdx === 3 && pos === 'ขวา' && dateIdx === 5 && shiftIdx === 1) return '*13 รา'; // Non-numeric text!
    if (staffIdx === 3 && pos === 'ซ้าย' && dateIdx === 6 && shiftIdx === 2) return 9; // Breach!
    // Normal values 0-2
    return (staffIdx + dateIdx + shiftIdx) % 3 === 0 ? 1 : 0;
  };

  // Populate Glove print table
  staff.forEach((s, sIdx) => {
    // Row 1: ซ้าย (Name in Col A)
    const r1: any[] = [s.name, s.code, s.shift, 'ซ้าย', ''];
    for (let d = 0; d < dates.length; d++) {
      for (let sh = 0; sh < 3; sh++) {
        r1.push(getGloveVal(sIdx, 'ซ้าย', d, sh));
      }
    }
    rows.push(r1);

    // Row 2: ขวา (Merged Col A is blank)
    const r2: any[] = ['', '', '', 'ขวา', ''];
    for (let d = 0; d < dates.length; d++) {
      for (let sh = 0; sh < 3; sh++) {
        r2.push(getGloveVal(sIdx, 'ขวา', d, sh));
      }
    }
    rows.push(r2);
  });

  // Blank separator
  rows.push([]);

  // Section 2 Header - Personal Monitoring / Contact plate
  rows.push(['Personal Monitoring (Contact plate - 25 cm²)']);
  rows.push(['ชื่อ-นามสกุล พนักงาน', 'รหัส', 'กะ', 'ตำแหน่งตรวจ']);

  const getContactVal = (staffIdx: number, pos: string, dateIdx: number, shiftIdx: number): any => {
    // Somchai on 02/10/26 also has breach on chest on same day (test 1 deduction per day rule)
    if (staffIdx === 0 && pos === 'หน้าอก' && dateIdx === 1 && shiftIdx === 1) return 8;
    // Wanna on 04/10/26 has breach on arm on same day
    if (staffIdx === 1 && pos === 'แขนขวา' && dateIdx === 3 && shiftIdx === 1) return 9;
    // Kittisak on 05/10/25 has breach on chest (7 CFU)
    if (staffIdx === 2 && pos === 'หน้าอก' && dateIdx === 4 && shiftIdx === 0) return 7;
    // Normal 0 or 1
    return (staffIdx * 2 + dateIdx + shiftIdx) % 4 === 0 ? 2 : 0;
  };

  staff.forEach((s, sIdx) => {
    // 3 rows: แขนซ้าย, แขนขวา, หน้าอก
    const r1: any[] = [s.name, s.code, s.shift, 'แขนซ้าย', ''];
    for (let d = 0; d < dates.length; d++) {
      for (let sh = 0; sh < 3; sh++) {
        r1.push(getContactVal(sIdx, 'แขนซ้าย', d, sh));
      }
    }
    rows.push(r1);

    const r2: any[] = ['', '', '', 'แขนขวา', ''];
    for (let d = 0; d < dates.length; d++) {
      for (let sh = 0; sh < 3; sh++) {
        r2.push(getContactVal(sIdx, 'แขนขวา', d, sh));
      }
    }
    rows.push(r2);

    const r3: any[] = ['', '', '', 'หน้าอก', ''];
    for (let d = 0; d < dates.length; d++) {
      for (let sh = 0; sh < 3; sh++) {
        r3.push(getContactVal(sIdx, 'หน้าอก', d, sh));
      }
    }
    rows.push(r3);
  });

  // Blank separator
  rows.push([]);

  // Section 3: Surface equipment (Strictly must be IGNORED by algorithm)
  rows.push(['Surface equipment Monitoring (Contact plate - Machines & Tables)']);
  rows.push(['จุดสุ่มตรวจอุปกรณ์', 'รหัสจุด', 'พื้นที่', 'ตำแหน่ง']);
  rows.push(['Filling Needle Nozzle', 'EQ-01', 'Filling Room', 'Tip', 25, 30, 45]);
  rows.push(['Conveyor Belt Link', 'EQ-02', 'Capping Room', 'Surface', 10, 15, 20]);
  rows.push(['Air sampling & TSA Settle Plate Summary']);
  rows.push(['Cleanroom Room 101', 'AIR-01', 'Grade B', 'Center', 0, 0, 1]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set merges for dates in row 4
  const merges = [
    { s: { r: 4, c: 6 }, e: { r: 4, c: 8 } },
    { s: { r: 4, c: 9 }, e: { r: 4, c: 11 } },
    { s: { r: 4, c: 12 }, e: { r: 4, c: 14 } },
    { s: { r: 4, c: 15 }, e: { r: 4, c: 17 } },
    { s: { r: 4, c: 18 }, e: { r: 4, c: 20 } },
    { s: { r: 4, c: 21 }, e: { r: 4, c: 23 } },
    { s: { r: 4, c: 24 }, e: { r: 4, c: 26 } },
  ];
  ws['!merges'] = merges;

  XLSX.utils.book_append_sheet(wb, ws, 'Microbial Monitoring');

  const excelOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return {
    buffer: excelOut,
    fileName: 'ไฟล์ตัวอย่าง_ผลเพาะเชื้อโรงงานยา.xlsx',
  };
}

export function downloadSampleTemplateExcel() {
  const { buffer, fileName } = generateSampleWorkbookBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
