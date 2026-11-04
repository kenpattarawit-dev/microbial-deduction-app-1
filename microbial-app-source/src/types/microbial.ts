export type ShiftType = 'เช้า' | 'บ่าย' | 'OT';

export interface DateColumnInfo {
  dateIndex: number;
  colStart: number;
  dateLabel: string;
  year?: number;
  month?: number;
  day?: number;
  rawDateValue?: any;
}

export interface ReadingItem {
  id: string;
  personName: string;
  category: 'Glove print' | 'Contact plate';
  position: string; // ซ้าย, ขวา, แขนซ้าย, แขนขวา, หน้าอก
  dateLabel: string;
  shift: ShiftType;
  cfu: number;
  isTNTC: boolean;
  cellAddress: string;
  rawText?: string;
  isUnparsedText?: boolean;
}

export interface TextWarning {
  id: string;
  cellAddress: string;
  personName: string;
  position: string;
  dateLabel: string;
  shift: ShiftType;
  rawText: string;
}

export interface YearAnomalyWarning {
  dateLabel: string;
  detectedYear: number;
  majorityYear: number;
}

export interface BreachDetail {
  id: string;
  dateLabel: string;
  personName: string;
  category: 'Glove print' | 'Contact plate';
  position: string;
  shift: ShiftType;
  cfu: number;
  cellAddress: string;
}

export interface PersonDailyDeduction {
  personName: string;
  dailyDeductions: Record<string, number>; // dateLabel -> deduction amount (0 or deductionRate)
  dailyBreaches: Record<string, BreachDetail[]>; // dateLabel -> breaches on that day
  totalAmount: number;
  breachDaysCount: number;
}

export interface ParseResult {
  success: boolean;
  errorMessage?: string;
  fileName: string;
  dates: DateColumnInfo[];
  persons: string[];
  readings: ReadingItem[];
  warnings: TextWarning[];
  yearAnomalies: YearAnomalyWarning[];
  sheetName: string;
}

export interface DeductionSummary {
  personSummaries: PersonDailyDeduction[];
  dateTotals: Record<string, number>; // dateLabel -> total THB
  grandTotal: number;
  allBreaches: BreachDetail[];
  totalBreachEvents: number;
  totalPenalizedPersonDays: number;
}
