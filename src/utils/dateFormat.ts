export function formatDate(
  date: string,
  withTime: boolean = false,
  withDay: boolean = false,
): string {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { weekday: 'short' } : {}),
    ...(withDay ? { hour: 'numeric', minute: '2-digit', hour12: false } : {}),
  });
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
