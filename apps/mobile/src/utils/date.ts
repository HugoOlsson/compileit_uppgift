const shortDateFormatter = new Intl.DateTimeFormat('sv-SE', {
  day: 'numeric',
  month: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('sv-SE', {
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
});

const longDateFormatter = new Intl.DateTimeFormat('sv-SE', {
  day: 'numeric',
  month: 'long',
});

export function addDays(date: Date, numberOfDays: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + numberOfDays);
  return nextDate;
}

export function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateRange(firstDate: Date, numberOfDays: number) {
  return Array.from({ length: numberOfDays }, (_, index) => addDays(firstDate, index));
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatShortDate(date: Date) {
  return shortDateFormatter.format(date).replace('.', '');
}

export function formatLongDate(date: Date) {
  return longDateFormatter.format(date);
}

export function formatTimeRange(startsAt: string, endsAt: string) {
  return `${timeFormatter.format(new Date(startsAt))}-${timeFormatter.format(new Date(endsAt))}`;
}
