import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { Term } from "../../components/Term";
import { getObject, type SmallBody } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import styles from "./page.module.css";

type Params = { designacion: string };

function fromSlug(slug: string): string {
  return decodeURIComponent(slug).replace(/-+/g, " ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { designacion } = await params;
  const body = await getObject(designacion);

  if (!body) {
    return { title: fromSlug(designacion) };
  }

  const klass = body.orbitClassName ? `Asteroide de clase ${body.orbitClassName}` : "Cuerpo menor";

  return {
    title: body.fullName,
    description: `${klass}. Elementos orbitales, magnitud absoluta y datos de observación de ${body.fullName}, según la base de datos de cuerpos menores del JPL.`,
  };
}

function Row({
  label,
  value,
  term,
}: {
  label: string;
  value: string;
  term?: string;
}) {
  return (
    <div className={styles.row}>
      <dt className={styles.rowLabel}>
        {term ? <Term id={term}>{label}</Term> : label}
      </dt>
      <dd className={`${styles.rowValue} numeric`}>{value}</dd>
    </div>
  );
}

function optional(
  value: number | null,
  decimals: number,
  unit = "",
): string {
  if (value === null) return "—";
  return `${formatNumber(value, decimals)}${unit}`;
}

function PhysicalRows({ body }: { body: SmallBody }) {
  const rows = [
    body.diameterKm !== null && (
      <Row key="d" label="Diámetro" value={optional(body.diameterKm, 2, " km")} />
    ),
    body.albedo !== null && (
      <Row key="a" label="Albedo" term="albedo" value={optional(body.albedo, 2)} />
    ),
    body.rotationPeriodHours !== null && (
      <Row
        key="r"
        label="Período de rotación"
        value={optional(body.rotationPeriodHours, 2, " h")}
      />
    ),
    body.spectralType !== null && (
      <Row key="s" label="Tipo espectral" value={body.spectralType} />
    ),
  ].filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <section className={styles.block}>
      <h2 className={`label ${styles.blockTitle}`}>Propiedades físicas</h2>
      <dl className={styles.rows}>{rows}</dl>
    </section>
  );
}

export default async function ObjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { designacion } = await params;
  const body = await getObject(designacion);

  if (!body) {
    notFound();
  }

  const { elements } = body;

  return (
    <main>
      <SiteHeader />

      <div className={styles.head}>
        <p className={`label ${styles.kicker}`}>Ficha de objeto</p>
        <h1>{body.fullName}</h1>
        <div className={styles.flags}>
          {body.orbitClassName ? (
            <span className={styles.flag}>
              <Term id="clase-orbital">Clase {body.orbitClassName}</Term>
            </span>
          ) : null}
          {body.isNearEarth ? (
            <span className={styles.flag}>
              <Term id="neo">Próximo a la Tierra</Term>
            </span>
          ) : null}
          {body.isPotentiallyHazardous ? (
            <span className={styles.flagRisk}>
              <Term id="pha">Potencialmente peligroso</Term>
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.columns}>
        <section className={styles.block}>
          <h2 className={`label ${styles.blockTitle}`}>Elementos orbitales</h2>
          <dl className={styles.rows}>
            <Row
              label="Excentricidad"
              term="excentricidad"
              value={optional(elements.eccentricity, 4)}
            />
            <Row
              label="Semieje mayor"
              term="semieje-mayor"
              value={optional(elements.semiMajorAxisAu, 4, " UA")}
            />
            <Row
              label="Perihelio"
              term="perihelio"
              value={optional(elements.perihelionAu, 4, " UA")}
            />
            <Row
              label="Afelio"
              term="afelio"
              value={optional(elements.aphelionAu, 4, " UA")}
            />
            <Row
              label="Inclinación"
              term="inclinacion"
              value={optional(elements.inclinationDeg, 3, "°")}
            />
            <Row
              label="Nodo ascendente"
              term="nodo-ascendente"
              value={optional(elements.ascendingNodeDeg, 3, "°")}
            />
            <Row
              label="Argumento del perihelio"
              term="argumento-del-perihelio"
              value={optional(elements.perihelionArgumentDeg, 3, "°")}
            />
            <Row
              label="Anomalía media"
              term="anomalia-media"
              value={optional(elements.meanAnomalyDeg, 3, "°")}
            />
            <Row
              label="Período orbital"
              value={optional(elements.periodDays, 1, " días")}
            />
            <Row
              label="Época"
              term="epoca"
              value={optional(elements.epochJd, 1, " DJ")}
            />
          </dl>
        </section>

        <div>
          <section className={styles.block}>
            <h2 className={`label ${styles.blockTitle}`}>Brillo y tamaño</h2>
            <dl className={styles.rows}>
              <Row
                label="Magnitud absoluta"
                term="magnitud-h"
                value={optional(body.magnitudeH, 2)}
              />
            </dl>
          </section>

          <PhysicalRows body={body} />

          <section className={styles.block}>
            <h2 className={`label ${styles.blockTitle}`}>Observación</h2>
            <dl className={styles.rows}>
              <Row
                label="Primera observación"
                value={body.firstObserved ?? "—"}
              />
              <Row
                label="Arco de observación"
                term="arco-de-observacion"
                value={optional(body.observationArcDays, 0, " días")}
              />
              <Row
                label="Observaciones usadas"
                value={optional(body.observationCount, 0)}
              />
            </dl>
          </section>
        </div>
      </div>

      <footer className={`label ${styles.footer}`}>
        Fuente · JPL Small-Body Database
      </footer>
    </main>
  );
}
