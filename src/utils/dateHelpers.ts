const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntilDate(date: string, from = new Date()) {
  const target = parseLocalDate(date);

  if (!target) {
    return 0;
  }

  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  return Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY);
}

export function parseLocalDate(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  const isValid =
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;

  return isValid ? parsed : null;
}

export function formatDisplayDate(value: string) {
  const date = parseLocalDate(value);

  if (!date) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
