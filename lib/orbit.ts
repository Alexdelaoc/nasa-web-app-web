/**
 * Keplerian orbit maths, shared by the object diagram and later by the map.
 *
 * Everything is in astronomical units and radians internally, and works in the
 * ecliptic frame: the plane of Earth's orbit, with the Sun at the origin.
 */

const DEG = Math.PI / 180;

/** Julian date of the Unix epoch. */
const JD_UNIX = 2440587.5;

export interface Elements {
  /** Semi-major axis, AU. */
  semiMajorAxisAu: number;
  eccentricity: number;
  /** Inclination to the ecliptic, degrees. */
  inclinationDeg: number;
  /** Longitude of the ascending node, degrees. */
  ascendingNodeDeg: number;
  /** Argument of perihelion, degrees. */
  perihelionArgumentDeg: number;
  /** Mean anomaly at the epoch, degrees. */
  meanAnomalyDeg: number;
  /** Orbital period, days. */
  periodDays: number;
  /** Julian date the mean anomaly refers to. */
  epochJd: number;
}

export interface Point {
  x: number;
  y: number;
  z: number;
}

/** Earth, from its J2000 osculating elements. */
export const EARTH: Elements = {
  semiMajorAxisAu: 1.00000011,
  eccentricity: 0.01671022,
  inclinationDeg: 0,
  ascendingNodeDeg: 0,
  perihelionArgumentDeg: 102.94719,
  meanAnomalyDeg: 357.51716,
  periodDays: 365.256363,
  epochJd: 2451545,
};

export function toJulianDate(date: Date): number {
  return date.getTime() / 86_400_000 + JD_UNIX;
}

/**
 * Solves M = E - e·sin E for the eccentric anomaly. Newton–Raphson converges in
 * a handful of passes for every elliptical orbit; the cap is there so a
 * malformed eccentricity cannot spin forever.
 */
function eccentricAnomaly(meanAnomaly: number, e: number): number {
  let E = e < 0.8 ? meanAnomaly : Math.PI;

  for (let pass = 0; pass < 60; pass += 1) {
    const delta = (E - e * Math.sin(E) - meanAnomaly) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-12) break;
  }

  return E;
}

/** Position in the ecliptic frame for a given true anomaly. */
function place(elements: Elements, trueAnomaly: number): Point {
  const { semiMajorAxisAu: a, eccentricity: e } = elements;
  const i = elements.inclinationDeg * DEG;
  const node = elements.ascendingNodeDeg * DEG;
  const argument = elements.perihelionArgumentDeg * DEG;

  const r = (a * (1 - e * e)) / (1 + e * Math.cos(trueAnomaly));
  const u = argument + trueAnomaly;

  return {
    x: r * (Math.cos(node) * Math.cos(u) - Math.sin(node) * Math.sin(u) * Math.cos(i)),
    y: r * (Math.sin(node) * Math.cos(u) + Math.cos(node) * Math.sin(u) * Math.cos(i)),
    z: r * (Math.sin(u) * Math.sin(i)),
  };
}

/** Where the body is at a given moment. */
export function positionAt(elements: Elements, date: Date): Point {
  const daysSinceEpoch = toJulianDate(date) - elements.epochJd;
  const meanMotion = (2 * Math.PI) / elements.periodDays;
  const meanAnomaly = elements.meanAnomalyDeg * DEG + meanMotion * daysSinceEpoch;

  const E = eccentricAnomaly(meanAnomaly, elements.eccentricity);
  const e = elements.eccentricity;
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2),
  );

  return place(elements, trueAnomaly);
}

/** The whole orbit, as evenly spaced points in true anomaly. */
export function orbitPath(elements: Elements, samples = 180): Point[] {
  return Array.from({ length: samples + 1 }, (_, step) =>
    place(elements, (step / samples) * 2 * Math.PI),
  );
}
