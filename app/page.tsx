import Image from "next/image";
import Link from "next/link";
import { getApod, getCloseApproaches, type AstronomyPicture } from "@/lib/api";
import { ApproachTable } from "./components/ApproachTable";
import { OrbitDiagram } from "./components/OrbitDiagram";
import { SiteHeader } from "./components/SiteHeader";
import { Term } from "./components/Term";
import styles from "./page.module.css";

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

/**
 * The photograph is blurred at rest so it stays subordinate to the text beside
 * it, and sharpens on hover, focus or press.
 */
function ApodIsland({ picture }: { picture: AstronomyPicture }) {
  return (
    <Link href="/imagen-del-dia" className={styles.apodLink}>
      {picture.mediaType === "image" ? (
        <Image
          src={picture.url}
          alt=""
          fill
          sizes="(min-width: 900px) 420px, 100vw"
          className={styles.apodPhoto}
          loading="eager"
          fetchPriority="high"
        />
      ) : null}
      <div className={styles.apodCaption}>
        <span className={`label ${styles.apodKicker}`}>Imagen del día</span>
        <span className={styles.apodTitle} lang="en">
          {picture.title}
        </span>
      </div>
    </Link>
  );
}

export default async function Home() {
  const [approaches, picture] = await Promise.all([
    getCloseApproaches(),
    getApod(),
  ]);

  return (
    <main>
      <SiteHeader />

      <div className={styles.introBand}>
        <p className={styles.intro}>
          Catálogo consultable de los cuerpos menores que se acercan a la Tierra
          y de los meteoritos que han llegado a caer, con datos abiertos de la
          NASA y el JPL.
        </p>
        {picture ? <ApodIsland picture={picture} /> : null}
      </div>

      <div className={styles.question}>
        <h1>¿Qué se acerca ahora?</h1>
        <p className={styles.questionNote}>
          {approaches === null ? (
            "Los datos de aproximaciones no están disponibles en este momento."
          ) : (
            <>
              {approaches.length} objetos pasarán a menos de 0,05{" "}
              <Term id="ua">UA</Term> de la Tierra en los próximos 60 días. Los{" "}
              {Math.min(ROWS_ON_HOMEPAGE, approaches.length)} más cercanos:
            </>
          )}
        </p>
      </div>

      <ApproachTable approaches={approaches?.slice(0, ROWS_ON_HOMEPAGE) ?? null} />

      {approaches !== null ? (
        <p className={styles.more}>
          <Link href="/aproximaciones">
            Ver las {approaches.length} aproximaciones →
          </Link>
        </p>
      ) : null}

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
