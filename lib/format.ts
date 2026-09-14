const DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const TIME_FORMAT = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  hour12: false,
});

/** "2026-10-31T02:35:00Z" -> "31 oct 2026 · 02:35" */
export function formatUtc(iso: string): string {
  const date = new Date(iso);
  return `${DATE_FORMAT.format(date)} · ${TIME_FORMAT.format(date)}`;
}

/** Spanish uses the comma as decimal separator. */
export function formatNumber(value: number, decimals: number): string {
  return value.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
