/**
 * SBDB names orbit classes in English. These are proper names of the groups, so
 * they have settled Spanish forms — using them keeps the page in one language.
 * Anything unlisted falls back to whatever the upstream sent.
 */
const NAMES: Record<string, string> = {
  IEO: "Atira",
  ATE: "Atón",
  APO: "Apolo",
  AMO: "Amor",
  MCA: "cruzador de Marte",
  IMB: "cinturón interior",
  MBA: "cinturón principal",
  OMB: "cinturón exterior",
  TJN: "troyano de Júpiter",
  CEN: "centauro",
  TNO: "transneptuniano",
  JFC: "cometa de la familia de Júpiter",
  HTC: "cometa tipo Halley",
  PAA: "parabólico",
  HYA: "hiperbólico",
};

export function orbitClassName(
  code: string | null,
  fallback: string | null,
): string | null {
  if (code && NAMES[code]) return NAMES[code];
  return fallback;
}
