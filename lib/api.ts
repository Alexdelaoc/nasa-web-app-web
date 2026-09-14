/**
 * Typed client for the NASA-WEB-APP API.
 *
 * These interfaces are hand-written for now. Once the API exposes its OpenAPI
 * document they will be generated from it, so keep them in step with the
 * backend contract rather than reshaping data here.
 */

const API_URL = process.env.API_URL ?? "http://localhost:3000";

/** Matches the backend's revalidation window for these resources. */
const REVALIDATE_SECONDS = 3600;

export interface CloseApproach {
  designation: string;
  date: string;
  distanceAu: number;
  distanceLunar: number;
  velocityKmS: number;
  magnitudeH: number | null;
  insideLunarOrbit: boolean;
}

/**
 * Returns null when the API cannot answer, so a page can degrade instead of
 * failing: the backend already turns upstream problems into a 503.
 */
async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      console.error(`API ${path} responded with HTTP ${response.status}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (cause) {
    console.error(`API ${path} unreachable: ${(cause as Error).message}`);
    return null;
  }
}

export interface OrbitalElements {
  eccentricity: number | null;
  semiMajorAxisAu: number | null;
  perihelionAu: number | null;
  aphelionAu: number | null;
  inclinationDeg: number | null;
  ascendingNodeDeg: number | null;
  perihelionArgumentDeg: number | null;
  meanAnomalyDeg: number | null;
  periodDays: number | null;
  epochJd: number | null;
}

export interface SmallBody {
  designation: string;
  fullName: string;
  orbitClassCode: string | null;
  orbitClassName: string | null;
  isNearEarth: boolean;
  isPotentiallyHazardous: boolean;
  elements: OrbitalElements;
  magnitudeH: number | null;
  diameterKm: number | null;
  albedo: number | null;
  rotationPeriodHours: number | null;
  spectralType: string | null;
  firstObserved: string | null;
  observationArcDays: number | null;
  observationCount: number | null;
}

export function getCloseApproaches(): Promise<CloseApproach[] | null> {
  return getJson<CloseApproach[]>("/close-approaches");
}

export interface AstronomyPicture {
  date: string;
  title: string;
  explanation: string;
  mediaType: "image" | "video";
  url: string;
  hdUrl: string | null;
  credit: string | null;
}

export function getApod(): Promise<AstronomyPicture | null> {
  return getJson<AstronomyPicture>("/apod");
}

export function getObject(designation: string): Promise<SmallBody | null> {
  return getJson<SmallBody>(`/objects/${encodeURIComponent(designation)}`);
}

/** Designations carry spaces; URLs carry hyphens. */
export function toSlug(designation: string): string {
  return designation.trim().replace(/\s+/g, "-");
}
