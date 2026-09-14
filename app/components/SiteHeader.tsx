import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark}>
        NASA WEB APP
      </Link>
      <nav className={styles.nav}>
        <Link href="/sistema-solar">Sistema solar</Link>
        <Link href="/impactos">Impactos</Link>
        <Link href="/objetos">Catálogo</Link>
        <Link href="/glosario">Glosario</Link>
        <Link href="/imagen-del-dia">Imagen del día</Link>
      </nav>
    </header>
  );
}
