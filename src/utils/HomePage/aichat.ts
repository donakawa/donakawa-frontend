export function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
