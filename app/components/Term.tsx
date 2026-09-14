"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { glossaryEntry } from "@/lib/glossary";
import styles from "./Term.module.css";

/**
 * A glossary term that explains itself where the reader meets it. Uses a native
 * <dialog> so focus trapping and dismissal on Escape come from the platform.
 *
 * The dialog is portalled to <body> rather than rendered beside the button:
 * terms live inside paragraphs and table cells, and a <dialog> nested in a <p>
 * is invalid HTML that breaks hydration. Being a child of <body> also keeps it
 * clear of inherited text styling.
 *
 * It is only mounted while open. Opening slides the sheet up, which says where
 * it came from and how to dismiss it; closing just removes it, because an exit
 * animation would carry no information.
 */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  const entry = glossaryEntry(id);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  // The dialog only exists while it is open, so this runs once per opening.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, [open]);

  if (!entry) {
    return <>{children}</>;
  }

  const sheet = (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      onClose={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) setOpen(false);
      }}
    >
      <div className={styles.sheetBody}>
        <p className={`label ${styles.kicker}`}>Glosario</p>
        <h2 className={styles.title}>{entry.term}</h2>
        <p className={styles.definition}>{entry.definition}</p>
        <div className={styles.actions}>
          <Link href="/glosario" className={styles.allTerms}>
            Ver todos los términos →
          </Link>
          <button
            type="button"
            className={styles.close}
            onClick={() => setOpen(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );

  return (
    <>
      <button
        type="button"
        className={styles.term}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        {children}
      </button>

      {open ? createPortal(sheet, document.body) : null}
    </>
  );
}
