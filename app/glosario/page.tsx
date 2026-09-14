import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { GLOSSARY } from "@/lib/glossary";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Glosario",
  description:
    "Qué significan la unidad astronómica, el MOID, la magnitud absoluta, los elementos orbitales y el resto de términos que aparecen en las tablas de objetos próximos a la Tierra.",
};

export default function Glosario() {
  return (
    <main>
      <SiteHeader />

      <div className={styles.intro}>
        <h1>Glosario</h1>
        <p className={styles.lead}>
          Las tablas de este catálogo usan el vocabulario de la mecánica
          orbital. En esta página encontrarás cada término que vas a encontrar en castellano.
        </p>
      </div>

      <dl className={styles.list}>
        {GLOSSARY.map((entry) => (
          <div key={entry.id} id={entry.id} className={styles.entry}>
            <dt className={styles.term}>{entry.term}</dt>
            <dd className={styles.definition}>{entry.definition}</dd>
          </div>
        ))}
      </dl>

      <footer className={`label ${styles.footer}`}>
        Fuentes · JPL SBDB · CNEOS · NASA Open Data
      </footer>
    </main>
  );
}
