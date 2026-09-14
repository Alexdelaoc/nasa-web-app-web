import type { ReactNode } from "react";
import { EARTH, orbitPath, positionAt, type Elements, type Point } from "@/lib/orbit";
import type { SmallBody } from "@/lib/api";
import styles from "./OrbitChart.module.css";

const SIZE = 300;
const PADDING = 26;

/** Two views of the same orbit: from above the ecliptic, and edge-on. */
type Plane = "top" | "side";

function project(point: Point, plane: Plane): [number, number] {
  // Screen y grows downwards, so the vertical axis is negated in both views.
  return plane === "top" ? [point.x, -point.y] : [point.x, -point.z];
}

function toPath(points: Point[], plane: Plane, scale: number): string {
  return points
    .map((point, index) => {
      const [x, y] = project(point, plane);
      return `${index === 0 ? "M" : "L"}${(x * scale).toFixed(2)} ${(y * scale).toFixed(2)}`;
    })
    .join(" ");
}

function elementsOf(body: SmallBody): Elements | null {
  const e = body.elements;

  if (
    e.semiMajorAxisAu === null ||
    e.eccentricity === null ||
    e.inclinationDeg === null ||
    e.ascendingNodeDeg === null ||
    e.perihelionArgumentDeg === null ||
    e.meanAnomalyDeg === null ||
    e.periodDays === null ||
    e.epochJd === null ||
    e.eccentricity >= 1
  ) {
    return null;
  }

  return {
    semiMajorAxisAu: e.semiMajorAxisAu,
    eccentricity: e.eccentricity,
    inclinationDeg: e.inclinationDeg,
    ascendingNodeDeg: e.ascendingNodeDeg,
    perihelionArgumentDeg: e.perihelionArgumentDeg,
    meanAnomalyDeg: e.meanAnomalyDeg,
    periodDays: e.periodDays,
    epochJd: e.epochJd,
  };
}

function View({
  plane,
  kicker,
  reading,
  caption,
  legend,
  scale,
  earthOrbit,
  bodyOrbit,
  earth,
  body,
  hazardous,
  designation,
}: {
  plane: Plane;
  kicker: string;
  reading?: string;
  caption: string;
  legend?: ReactNode;
  scale: number;
  earthOrbit: Point[];
  bodyOrbit: Point[];
  earth: Point;
  body: Point;
  hazardous: boolean;
  designation: string;
}) {
  const [ex, ey] = project(earth, plane).map((v) => v * scale);
  const [bx, by] = project(body, plane).map((v) => v * scale);
  const half = SIZE / 2;

  return (
    <figure className={styles.cell}>
      <div className={styles.head}>
        <span className={`label ${styles.kicker}`}>{kicker}</span>
        {reading ? (
          <span className={`label ${styles.reading} numeric`}>{reading}</span>
        ) : null}
      </div>

      <div className={styles.plot}>
        <svg
          viewBox={`${-half} ${-half} ${SIZE} ${SIZE}`}
          className={styles.svg}
          role="img"
          aria-label={`Órbita de ${designation} vista ${plane === "top" ? "desde arriba del plano de la eclíptica" : "de canto"}, con la órbita de la Tierra como referencia`}
        >
          <path d={toPath(earthOrbit, plane, scale)} className={styles.earthOrbit} />
          <path
            d={toPath(bodyOrbit, plane, scale)}
            className={hazardous ? styles.bodyOrbitRisk : styles.bodyOrbit}
          />
          <line x1={ex} y1={ey} x2={bx} y2={by} className={styles.separation} />
          <circle cx={0} cy={0} r={4} className={styles.sun} />
          <circle cx={ex} cy={ey} r={3} className={styles.earth} />
          <circle
            cx={bx}
            cy={by}
            r={3.4}
            className={hazardous ? styles.bodyRisk : styles.body}
          />
        </svg>
      </div>

      <figcaption className={`label ${styles.caption}`}>{caption}</figcaption>
      {legend}
    </figure>
  );
}

export function OrbitChart({ body }: { body: SmallBody }) {
  const elements = elementsOf(body);
  if (!elements) return null;

  const now = new Date();
  const bodyOrbit = orbitPath(elements);
  const earthOrbit = orbitPath(EARTH);

  // Scale so the whole orbit fits, however far out it goes.
  const reach = Math.max(
    ...bodyOrbit.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z))),
    1.05,
  );
  const scale = (SIZE / 2 - PADDING) / reach;

  const earth = positionAt(EARTH, now);
  const position = positionAt(elements, now);
  const separation = Math.hypot(
    position.x - earth.x,
    position.y - earth.y,
    position.z - earth.z,
  );

  const shared = {
    scale,
    earthOrbit,
    bodyOrbit,
    earth,
    body: position,
    hazardous: body.isPotentiallyHazardous,
    designation: body.designation,
  };

  return (
    <div className={styles.pair}>
      <View
        plane="top"
        kicker="Desde arriba"
        reading={`${separation.toFixed(3)} UA ahora mismo`}
        caption="Plano de la eclíptica"
        {...shared}
      />
      <View
        plane="side"
        kicker="De canto"
        caption="Se ve la inclinación"
        legend={
          <div className={`label ${styles.legend}`}>
            <span><span className={styles.keySun} /> Sol</span>
            <span><span className={styles.keyEarth} /> Tierra</span>
            <span>
              <span className={body.isPotentiallyHazardous ? styles.keyBodyRisk : styles.keyBody} />{" "}
              {body.designation}
            </span>
          </div>
        }
        {...shared}
      />
    </div>
  );
}
