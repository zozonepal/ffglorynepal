/**
 * Nepal Standard Time (NPT) is UTC + 5 hours and 45 minutes
 */
export function getNepalDate(): Date {
  const now = new Date();
  // calculate current UTC time
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  // NPT is UTC + 5:45
  const nptOffset = (5 * 60 + 45) * 60000;
  return new Date(utc + nptOffset);
}

export function formatNepalTime(date: Date = getNepalDate()): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h12)}:${pad(minutes)}:${pad(seconds)} ${ampm} NPT`;
}

export function isFridayInNepal(date: Date = getNepalDate()): boolean {
  return date.getDay() === 5; // 5 = Friday
}

export function getTimeUntilFriday(): {
  hours: number;
  minutes: number;
  seconds: number;
  isToday: boolean;
} {
  const npt = getNepalDate();
  const day = npt.getDay();

  // If today is Friday
  if (day === 5) {
    return { hours: 0, minutes: 0, seconds: 0, isToday: true };
  }

  // Days until next Friday (5)
  let daysUntil = (5 - day + 7) % 7;
  if (daysUntil === 0) daysUntil = 7;

  const target = new Date(npt);
  target.setDate(npt.getDate() + daysUntil);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - npt.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  return { hours, minutes, seconds, isToday: false };
}
