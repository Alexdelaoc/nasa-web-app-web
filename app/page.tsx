import Link from "next/link";
import { getCloseApproaches, toSlug, type CloseApproach } from "@/lib/api";
import { formatNumber, formatUtc } from "@/lib/format";
import { OrbitDiagram } from "./components/OrbitDiagram";
import { SiteHeader } from "./components/SiteHeader";
import { Term } from "./components/Term";
import styles from "./page.module.css";

/** The distance bar runs from the Earth to this many lunar distances. */
const SCALE_LUNAR = 5;
const MOON_POSITION = `${(1 / SCALE_LUNAR) * 100}%`;
const ROWS_ON_HOMEPAGE = 8;

const SECTIONS = [
  {
    number: "02",
    href: "/impactos",
    title: "Impactos en la Tierra",
    note: "45.716 meteoritos y 1.016 bólidos, sobre el globo",
  },
  {
    number: "03",
    href: "/objetos",
    title: "Catálogo de objetos",
    note: "Filtra por clase orbital, distancia mínima o magnitud",
  },
  {
    number: "04",
    href: "/glosario",
    title: "Glosario",
    note: "Qué significa cada término de las tablas",
  },
  {
    number: "05",
    href: "/imagen-del-dia",
    title: "Imagen del día",
    note: "La fotografía astronómica que publica hoy la NASA",
  },
];

function DistanceTrack({ approach }: { approach: CloseApproach }) {
  const width = `${Math.min((approach.distanceLunar / SCALE_LUNAR) * 100, 100)}%`;

  return (
    <div className={styles.track}>
      <div className={styles.moon} style={{ left: MOON_POSITION }} />
      <div
        className={`${styles.trackFill} ${approach.insideLunarOrbit ? styles.trackFillRisk : ""}`}
        style={{ width }}
      />
    </div>
  );
}

function ApproachRow({ approach }: { approach: CloseApproach }) {
  return (
    <tr className={approach.insideLunarOrbit ? styles.rowRisk : undefined}>
      <td className={styles.designation}>
        <Link href={`/objetos/${toSlug(approach.designation)}`}>
          {approach.designation}
        </Link>
      </td>
      <td
        className={`${styles.distance} numeric ${approach.insideLunarOrbit ? styles.distanceRisk : ""}`}
      >
        {formatNumber(approach.distanceLunar, 2)}{" "}
        <span className={styles.unit}>DL</span>
      </td>
      <td className={styles.trackCell}>
        <DistanceTrack approach={approach} />
      </td>
      <td className={`${styles.meta} numeric`}>
        {formatUtc(approach.date)} · {formatNumber(approach.velocityKmS, 2)} km/s
      </td>
      <td className={styles.flagCell}>
        {approach.insideLunarOrbit ? (
          <span className={styles.badge}>Dentro de la órbita lunar</span>
        ) : null}
      </td>
      <td className={`${styles.secondary} numeric`}>
        {formatNumber(approach.distanceAu, 5)}
      </td>
      <td className={`${styles.secondary} numeric`}>
        {approach.magnitudeH === null ? "—" : formatNumber(approach.magnitudeH, 1)}
      </td>
    </tr>
  );
}

export default async function Home() {
  const approaches = await getCloseApproaches();
  const shown = approaches?.slice(0, ROWS_ON_HOMEPAGE) ?? [];

  return (
    <main>
      <SiteHeader />

      <div className={styles.introBand}>
        <p className={styles.intro}>
          Catálogo consultable de los cuerpos menores que se acercan a la Tierra
          y de los meteoritos que han llegado a caer, con datos abiertos de la
          NASA y el JPL.
        </p>
      </div>

      <div className={styles.question}>
        <h1>¿Qué se acerca ahora?</h1>
        <p className={styles.questionNote}>
          {approaches === null
            ? "Los datos de aproximaciones no están disponibles en este momento."
            : `${approaches.length} objetos pasarán a menos de 0,05 `}
          {approaches !== null ? (
            <>
              <Term id="ua">UA</Term>{" "}
              de la Tierra en los próximos 60 días. Ordenados por distancia
              mínima:
            </>
          ) : null}
        </p>
      </div>

      {approaches === null ? (
        <p className={styles.unavailable}>
          Vuelve a intentarlo en unos minutos.
        </p>
      ) : (
        <>
          <div className={styles.scaleKey}>
            <span className="label">
              Distancia en{" "}
              <Term id="distancia-lunar">distancias lunares</Term>
            </span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className={`label ${styles.caption}`}>
                La marca en la barra es la órbita de la Luna (1 DL = 384.400 km)
              </caption>
              <thead>
                <tr className="label">
                  <th>Objeto</th>
                  <th>Distancia</th>
                  <th />
                  <th>Máxima aproximación</th>
                  <th />
                  <th style={{ textAlign: "right" }}>
                    En{" "}
                    <Term id="ua">UA</Term>
                  </th>
                  <th style={{ textAlign: "right" }}>
                    <Term id="magnitud-h">Magnitud H</Term>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((approach) => (
                  <ApproachRow
                    key={`${approach.designation}-${approach.date}`}
                    approach={approach}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.more}>
            <Link href="/aproximaciones">
              Ver las {approaches.length} aproximaciones →
            </Link>
          </p>
        </>
      )}

      <div className={styles.islandRow}>
        <div className={styles.indexColumn}>
          {SECTIONS.map((section) => (
            <Link
              key={section.number}
              href={section.href}
              className={styles.entry}
            >
              <span className={`${styles.entryNumber} numeric`}>
                {section.number}
              </span>
              <div>
                <div className={styles.entryTitle}>{section.title}</div>
                <div className={styles.entryNote}>{section.note}</div>
              </div>
            </Link>
          ))}
        </div>

        <section className={styles.island}>
          <div className={styles.islandHead}>
            <span className={`label ${styles.islandTitle}`}>
              01 · Sistema solar
            </span>
            <Link href="/sistema-solar" className={styles.islandLink}>
              Abrir el mapa →
            </Link>
          </div>
          <OrbitDiagram className={styles.diagram} />
          <div className={`${styles.islandFoot} numeric`}>
            42.286 ÓRBITAS PROPAGADAS · 2D POR DEFECTO, 3D BAJO DEMANDA
          </div>
        </section>
      </div>

      <footer className={`label ${styles.footer}`}>
        Fuentes · JPL SBDB · CNEOS · NASA Open Data
      </footer>
    </main>
  );
}
