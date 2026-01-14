export type YearMonth = [number, number]

export const now: YearMonth = [new Date().getFullYear(), new Date().getMonth() + 1];

export function monthsForYear(year: number): YearMonth[] {
  return Array.from({length: 12}, (_, i) => [year, i + 1])
}

export function getMonthName([year, month]: YearMonth): string | null {
  const date = new Date(year, month - 1);
  return new Intl.DateTimeFormat('sl-SI', {month: 'long'}).format(date);
}

export function isFuture([year, month]: YearMonth): boolean {
  const [currentYear, currentMonth] = now;
  if (year > currentYear) return true;
  return year === currentYear && month > currentMonth;
}

export const hasVisibleMonths = (year: number) => monthsForYear(year).some(ym => !isFuture(ym));
