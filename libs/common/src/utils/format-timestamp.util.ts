// export function formatTimestamp(date: Date = new Date()): string {
//   const pad = (value: number) => String(value).padStart(2, '0');
//
//   const asiaJakartaDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
//
//   return [
//     asiaJakartaDate.getFullYear(),
//     pad(asiaJakartaDate.getMonth() + 1),
//     pad(asiaJakartaDate.getDate()),
//     pad(asiaJakartaDate.getHours()),
//     pad(asiaJakartaDate.getMinutes()),
//     pad(asiaJakartaDate.getSeconds()),
//   ].join('');
// }

export function formatTimestamp(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  return `${get('year')}${get('month')}${get('day')}${get('hour')}${get('minute')}${get('second')}`;
}

export function formatDateOnly(date: Date = new Date()): string {
  return formatTimestamp(date).slice(0, 8); // e.g., "20261112"
}
