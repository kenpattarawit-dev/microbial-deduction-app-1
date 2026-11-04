import {
  BreachDetail,
  DeductionSummary,
  ParseResult,
  PersonDailyDeduction,
  ReadingItem,
} from '../types/microbial';

export function calculateDeductions(
  parseResult: ParseResult,
  cfuThreshold: number,
  deductionRate: number
): DeductionSummary {
  const { persons, dates, readings } = parseResult;

  // Group readings by person and date
  // key: personName -> key: dateLabel -> array of ReadingItem
  const personDateReadingsMap = new Map<string, Map<string, ReadingItem[]>>();

  for (const person of persons) {
    personDateReadingsMap.set(person, new Map());
  }

  for (const reading of readings) {
    let dateMap = personDateReadingsMap.get(reading.personName);
    if (!dateMap) {
      dateMap = new Map();
      personDateReadingsMap.set(reading.personName, dateMap);
    }
    const list = dateMap.get(reading.dateLabel) || [];
    list.push(reading);
    dateMap.set(reading.dateLabel, list);
  }

  const allBreaches: BreachDetail[] = [];
  const personSummaries: PersonDailyDeduction[] = [];
  const dateTotals: Record<string, number> = {};

  // Initialize date totals
  for (const d of dates) {
    dateTotals[d.dateLabel] = 0;
  }

  let grandTotal = 0;
  let totalPenalizedPersonDays = 0;

  for (const person of persons) {
    const dateMap = personDateReadingsMap.get(person) || new Map();
    const dailyDeductions: Record<string, number> = {};
    const dailyBreaches: Record<string, BreachDetail[]> = {};
    let personTotalAmount = 0;
    let breachDaysCount = 0;

    for (const dateInfo of dates) {
      const dateLabel = dateInfo.dateLabel;
      const dayReadings = dateMap.get(dateLabel) || [];

      // Find any reading on this day where cfu > cfuThreshold
      const breachesForDay: BreachDetail[] = [];

      for (const r of dayReadings) {
        if (!r.isTNTC && !r.isUnparsedText && r.cfu > cfuThreshold) {
          const breachItem: BreachDetail = {
            id: `breach-${r.id}`,
            dateLabel,
            personName: person,
            category: r.category,
            position: r.position,
            shift: r.shift,
            cfu: r.cfu,
            cellAddress: r.cellAddress,
          };
          breachesForDay.push(breachItem);
          allBreaches.push(breachItem);
        }
      }

      dailyBreaches[dateLabel] = breachesForDay;

      // Rule: If any breach occurred on this day across any position/shift/category,
      // deduct ONCE for that person on that day.
      if (breachesForDay.length > 0) {
        dailyDeductions[dateLabel] = deductionRate;
        personTotalAmount += deductionRate;
        breachDaysCount++;
        dateTotals[dateLabel] = (dateTotals[dateLabel] || 0) + deductionRate;
        totalPenalizedPersonDays++;
      } else {
        dailyDeductions[dateLabel] = 0;
      }
    }

    grandTotal += personTotalAmount;

    personSummaries.push({
      personName: person,
      dailyDeductions,
      dailyBreaches,
      totalAmount: personTotalAmount,
      breachDaysCount,
    });
  }

  return {
    personSummaries,
    dateTotals,
    grandTotal,
    allBreaches,
    totalBreachEvents: allBreaches.length,
    totalPenalizedPersonDays,
  };
}
