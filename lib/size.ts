/**
 * Turning absolute magnitude into a size a reader can picture.
 *
 * The relation is D = 1329 / sqrt(albedo) · 10^(-H/5) kilometres. Albedo is how
 * much light the surface reflects, and for most objects nobody has measured it,
 * so the honest answer is a range: dark rock at 0.05, bright rock at 0.25.
 */
const CONSTANT_KM = 1329;
const DARKEST = 0.05;
const BRIGHTEST = 0.25;

export interface SizeEstimate {
  minMetres: number;
  maxMetres: number;
  /** Midpoint, used to pick what to compare it against. */
  metres: number;
  measured: boolean;
}

export function estimateSize(
  magnitudeH: number | null,
  measuredDiameterKm: number | null,
): SizeEstimate | null {
  if (measuredDiameterKm !== null) {
    const metres = measuredDiameterKm * 1000;
    return { minMetres: metres, maxMetres: metres, metres, measured: true };
  }

  if (magnitudeH === null) return null;

  const factor = CONSTANT_KM * 10 ** (-magnitudeH / 5) * 1000;
  const minMetres = factor / Math.sqrt(BRIGHTEST);
  const maxMetres = factor / Math.sqrt(DARKEST);

  return {
    minMetres,
    maxMetres,
    metres: Math.sqrt(minMetres * maxMetres),
    measured: false,
  };
}

export function formatSize(metres: number): string {
  if (metres >= 1000) {
    return `${(metres / 1000).toLocaleString("es-ES", {
      maximumFractionDigits: 1,
    })} km`;
  }
  return `${Math.round(metres).toLocaleString("es-ES")} m`;
}
