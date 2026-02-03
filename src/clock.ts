export type YearMonth = [number, number]

export const now: YearMonth = [new Date().getFullYear(), new Date().getMonth() + 1];

export let monthsForYear = (year: number): YearMonth[] =>
  Array.from({length: 12}, (_, i) => [year, i + 1])

export let getMonthName = ([year, month]: YearMonth): string | null =>
  new Intl.DateTimeFormat('sl-SI', {month: 'long'}).format(new Date(year, month - 1));

export const isFuture = ([year, month]: YearMonth): boolean => {
  const [currentYear, currentMonth] = now;
  if (year > currentYear) return true;
  return year === currentYear && month > currentMonth;
}

export const hasVisibleMonths = (year: number) =>
  monthsForYear(year).some(ym => !isFuture(ym));
