// Daily reminder time, stored as 24-hour "HH:MM".
export const DEFAULT_REMINDER = '19:30';

export function parseTime(t: string): { h: number; m: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(t);
  const h = match ? Number(match[1]) : 19;
  const m = match ? Number(match[2]) : 30;
  return { h: h >= 0 && h < 24 ? h : 19, m: m >= 0 && m < 60 ? m : 30 };
}

export function toTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// "19:30" -> "7:30 PM"
export function formatTime(t: string): string {
  const { h, m } = parseTime(t);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
