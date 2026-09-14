import type { Metadata } from "next";
import Link from "next/link";
import { ApproachTable } from "../components/ApproachTable";
import { SiteHeader } from "../components/SiteHeader";
import { Term } from "../components/Term";
import { getCloseApproaches } from "@/lib/api";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Próximas aproximaciones",
  description:
    "Todos los cuerpos menores que pasarán a menos de 0,05 unidades astronómicas de la Tierra en los próximos 60 días, ordenados por distancia mínima, con datos del CNEOS.",
};

export default async function Aproximaciones() {
  const approaches = await getCloseApproaches();
  const inside = approaches?.filter((a) => a.insideLunarOrbit).length ?? 0;

  return (
    <main>
      <SiteHeader />

      <nav className={styles.back}>
        <Link href="/">← Volver a la portada</Link>
      </nav>

      <div className={styles.head}>
        <p className={`label ${styles.kicker}`}>Próximos 60 días</p>
        <h1>Aproximaciones a la Tierra</h1>
        {approaches !== null ? (
          <p className={styles.lead}>
            {approaches.length} objetos pasarán a menos de 0,05{" "}
            <Term id="ua">UA</Term> de la Tierra, ordenados por distancia
            mínima.{" "}
            {inside > 0
              ? `${inside === 1 ? "Uno de ellos cruza" : `${inside} de ellos cruzan`} por dentro de la órbita de la Luna.`
              : "Ninguno cruza por dentro de la órbita de la Luna."}
          </p>
        ) : null}
      </div>

      <ApproachTable approaches={approaches} />

      <footer className={`label ${styles.footer}`}>
        Fuente · CNEOS Close Approach Data
      </footer>
    </main>
  );
}
