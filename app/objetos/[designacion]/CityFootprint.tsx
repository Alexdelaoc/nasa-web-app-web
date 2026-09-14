import { ASPECT, cityView } from "@/lib/city";
import { estimateSize, formatSize } from "@/lib/size";
import type { SmallBody } from "@/lib/api";
import styles from "./CityFootprint.module.css";

/** Outline of the footprint, in a 92 by 68 box. */
const ROCK =
  "M92.0 34.8 L87.8 44.3 L87.0 53.1 L73.8 62.9 L65.7 67.7 L48.8 68.0 L37.2 61.7 L29.2 60.0 L15.7 55.2 L4.9 51.8 L0.0 39.9 L4.1 32.0 L6.7 24.6 L15.2 15.8 L31.7 9.3 L40.1 7.0 L50.5 0.9 L70.4 0.0 L81.5 16.9 L86.1 28.1 Z";
const ROCK_W = 92;
const ROCK_H = 68;

/**
 * The outline scaled so its long axis spans `metres`, centred on the origin.
 *
 * The same outline serves every object: shape models exist for about twenty
 * bodies and for none of the rest of the catalogue, so the drawing claims a
 * width and nothing more.
 */
function footprint(metres: number): string {
  const k = metres / ROCK_W;
  const dx = (ROCK_W / 2) * k;
  const dy = (ROCK_H / 2) * k;
  return ROCK.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) =>
    `${(Number(x) * k - dx).toFixed(1)} ${(Number(y) * k - dy).toFixed(1)}`,
  );
}

/** Width of the window, in metres, that leaves the object about a third of the frame. */
const MIN_EXTENT = 40;
function extentFor(widest: number): number {
  return Math.max(MIN_EXTENT, widest * 2.8);
}

/** The largest round number that still fits in a third of the window. */
function scaleBar(extent: number): number {
  const steps = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000];
  const room = extent / 3;
  return [...steps].reverse().find((step) => step <= room) ?? steps[0];
}

export function CityFootprint({ body }: { body: SmallBody }) {
  const size = estimateSize(body.magnitudeH, body.diameterKm);
  if (!size) return null;

  const extent = extentFor(size.maxMetres);
  const { groups, trees } = cityView(extent);
  const bar = scaleBar(extent);
  const halfW = extent / 2;
  const halfH = (extent * ASPECT) / 2;
  // Constant on screen at any zoom: a tree has a measured position but no
  // measured canopy, so the mark must not read as an area.
  const treeRadius = (extent / 700) * 2.9;

  return (
    <section className={styles.cell}>
      <div className={styles.head}>
        <h2 className={`label ${styles.kicker}`}>Tamaño sobre Barcelona</h2>
        <span className={`label ${styles.reading} numeric`}>
          {size.measured
            ? formatSize(size.metres)
            : `${formatSize(size.minMetres)} – ${formatSize(size.maxMetres)}`}
        </span>
      </div>

      <div className={styles.scale}>
        <span
          className={styles.bar}
          style={{ width: `${(bar / extent) * 100}%` }}
        />
        <span className={`label ${styles.caption}`}>{formatSize(bar)}</span>
      </div>

      <div className={styles.canvas}>
        <svg
          viewBox={`${-halfW} ${-halfH} ${extent} ${extent * ASPECT}`}
          preserveAspectRatio="xMidYMid slice"
          className={styles.svg}
          role="img"
          aria-label={`Huella de ${body.designation}, de ${formatSize(size.metres)} de diámetro, sobre el Eixample de Barcelona`}
        >
          {groups.map((group) => (
            <g
              key={group.id}
              className={group.closed ? styles.blocks : styles.streets}
            >
              {group.shapes.map((d, index) => (
                <path key={index} d={d} />
              ))}
            </g>
          ))}

          {trees.map(([x, y], index) => (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={treeRadius}
              className={styles.tree}
            />
          ))}

          {size.measured ? null : (
            <path d={footprint(size.minMetres)} className={styles.least} />
          )}
          <path d={footprint(size.maxMetres)} className={styles.rock} />
        </svg>
      </div>

      <div className={styles.foot}>
        <p className={styles.note}>
          {size.measured
            ? "Diámetro medido por el JPL."
            : "Nadie ha medido cuánta luz refleja este objeto, así que su tamaño depende de si la superficie es oscura o clara. La línea continua es el máximo; la de puntos, el mínimo."}
        </p>
        <span className={`label ${styles.caption}`}>
          Mapa © colaboradores de OpenStreetMap
        </span>
      </div>
    </section>
  );
}
