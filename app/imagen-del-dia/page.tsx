import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { getApod } from "@/lib/api";
import styles from "./page.module.css";

const DATE_FORMAT = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatDay(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`));
}

export async function generateMetadata(): Promise<Metadata> {
  const picture = await getApod();

  if (!picture) {
    return { title: "Imagen del día" };
  }

  return {
    title: picture.title,
    description: picture.explanation.slice(0, 180),
    openGraph: {
      title: picture.title,
      images: picture.mediaType === "image" ? [picture.url] : undefined,
    },
  };
}

export default async function ImagenDelDia() {
  const picture = await getApod();

  if (!picture) {
    return (
      <main>
        <SiteHeader />
        <div className={styles.head}>
          <h1>Imagen del día</h1>
        </div>
        <p className={styles.unavailable}>
          La imagen de hoy no está disponible en este momento. Vuelve a
          intentarlo en unos minutos.
        </p>
      </main>
    );
  }

  return (
    <main>
      <SiteHeader />

      <nav className={styles.back}>
        <Link href="/" className={styles.backLink}>
          ← Volver a la portada
        </Link>
      </nav>

      {/* The photograph lives inside a dark island, the same way the map does:
          bounded, never bleeding into the page. */}
      <figure className={styles.island}>
        {picture.mediaType === "image" ? (
          <Image
            src={picture.url}
            alt={picture.title}
            fill
            sizes="(min-width: 900px) 900px, 100vw"
            className={styles.photo}
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          <a
            href={picture.url}
            className={styles.videoLink}
            target="_blank"
            rel="noreferrer"
          >
            La entrada de hoy es un vídeo · verlo en su fuente →
          </a>
        )}
      </figure>

      <article className={styles.article}>
        <p className={`label ${styles.kicker}`}>
          Imagen astronómica del día · {formatDay(picture.date)}
        </p>
        {/* NASA writes the APOD in English. Marking the subtree says so: screen
            readers switch voice instead of reading English with Spanish
            phonetics, and the browser can offer to translate just this part. */}
        <h1 className={styles.title} lang="en">
          {picture.title}
        </h1>
        <p className={styles.explanation} lang="en">
          {picture.explanation}
        </p>

        <dl className={styles.credits}>
          <div className={styles.creditRow}>
            <dt className="label">Crédito</dt>
            <dd className={styles.creditValue}>
              {picture.credit ?? "Dominio público · NASA"}
            </dd>
          </div>
          {picture.hdUrl ? (
            <div className={styles.creditRow}>
              <dt className="label">Original</dt>
              <dd className={styles.creditValue}>
                <a href={picture.hdUrl} target="_blank" rel="noreferrer">
                  Ver a resolución completa →
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      </article>

      <footer className={`label ${styles.footer}`}>
        Fuente · NASA Astronomy Picture of the Day
      </footer>
    </main>
  );
}
