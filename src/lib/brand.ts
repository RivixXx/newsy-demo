/** Keeps legacy database records from leaking the retired product name. */
export function normalizeBrand(value: string): string {
  return value.replace(/newsy/gi, 'ЧИ');
}
