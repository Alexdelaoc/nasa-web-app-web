import Link from "next/link";
import { toSlug, type CloseApproach } from "@/lib/api";
import { formatNumber, formatUtc } from "@/lib/format";
import { Term } from "./Term";
import styles from "./ApproachTable.module.css";

/** The distance bar runs from the Earth to this many lunar distances. */
const SCALE_LUNAR = 5;
const MOON_POSITION = `${(1 / SCALE_LUNAR) * 100}%`;

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
          /* Two spellings, one meaning: the full label needs 159px and a phone
             row has about 110 to spare. The accessible name carries the whole
             phrase either way, so both spans are decoration. */
          <span className={styles.badge} aria-label="Dentro de la órbita lunar">
            <span className={styles.badgeShort} aria-hidden="true">
              &lt; 1 DL
            </span>
            <span className={styles.badgeLong} aria-hidden="true">
              Dentro de la órbita lunar
            </span>
          </span>
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

export function ApproachTable({
  approaches,
}: {
  approaches: CloseApproach[] | null;
}) {
  if (approaches === null) {
    return (
      <p className={styles.unavailable}>
        Los datos de aproximaciones no están disponibles en este momento. Vuelve
        a intentarlo en unos minutos.
      </p>
    );
  }

  return (
    <>
      <div className={styles.scaleKey}>
        <span className="label">
          Distancia en <Term id="distancia-lunar">distancias lunares</Term>
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
                En <Term id="ua">UA</Term>
              </th>
              <th style={{ textAlign: "right" }}>
                <Term id="magnitud-h">Magnitud H</Term>
              </th>
            </tr>
          </thead>
          <tbody>
            {approaches.map((approach) => (
              <ApproachRow
                key={`${approach.designation}-${approach.date}`}
                approach={approach}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
