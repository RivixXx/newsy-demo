export function combineDateAndTime(date: Date | null, time?: string | null): Date | null {
  if (!date) return null;
  const d = new Date(date);
  if (time) {
    const [h, m] = time.split(':').map(Number);
    if (!isNaN(h)) d.setHours(h, m || 0, 0, 0);
  }
  return d;
}

export function formatDateRu(date: Date | null): string {
  if (!date) return 'Бессрочно';
  return date.toLocaleDateString('ru-RU');
}

export function formatDateTimeISO(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString();
}

export const NEW_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export function isNewEntity(createdAt: Date): boolean {
  return Date.now() - new Date(createdAt).getTime() < NEW_THRESHOLD_MS;
}

export function isActivePeriod(startDate: Date | null, endDate: Date | null): boolean {
  if (!startDate || !endDate) return false;
  const now = Date.now();
  return now >= new Date(startDate).getTime() && now <= new Date(endDate).getTime();
}

export function computeOverallStatus(
  startDate: Date | null,
  endDate: Date | null,
  startTime?: string | null
): 'registration' | 'active' | 'completed' {
  const now = new Date();
  const startMoment = startDate ? combineDateAndTime(startDate, startTime) : null;
  const endMoment = endDate ? new Date(endDate) : null;

  if (startMoment && now < startMoment) return 'registration';
  if (endMoment && now > endMoment) return 'completed';
  return 'active';
}