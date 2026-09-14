/**
 * Generates `lib/city-map.ts` from OpenStreetMap.
 *
 * Fetches each detail level over its own area, projects it to metres about a
 * fixed centre and simplifies it to the size it is drawn at. The output is
 * committed; the site never calls OpenStreetMap at run time.
 *
 *   node scripts/bake-city-map.mjs [--cache <dir>]
 *
 * `--cache` reads and writes the raw Overpass responses in that directory,
 * which makes re-runs offline and avoids hammering the API.
 *
 * Map data © OpenStreetMap contributors, ODbL.
 */
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Origin of every coordinate in the baked file, in Dreta de l'Eixample.
 *
 * Moving it changes what the closest windows show, so a replacement needs
 * pavements, trees and building fronts within about twenty metres.
 */
const CENTRE = { lat: 41.3966, lon: 2.163 };

/** Height of a window relative to its width. Matches the 92 by 68 footprint. */
const ASPECT = 3 / 4;

const LEVELS = [
  {
    // Drawn over the buildings rather than in place of them.
    id: "street-detail",
    maxExtent: 150,
    closed: false,
    overlay: true,
    keep: 220,
    bbox: [41.3939, 2.1594, 41.3993, 2.1666],
    query: 'way["highway"~"^(footway|steps|service)$"];way["natural"="tree_row"];node["natural"="tree"]',
  },
  {
    id: "buildings",
    maxExtent: 700,
    closed: true,
    // Past this width a window holds thousands of footprints a few pixels
    // wide, so the street network takes over instead.
    keep: 500,
    bbox: [41.3831, 2.1467, 41.4101, 2.1793],
    query: 'way["building"]',
  },
  {
    id: "streets-fine",
    maxExtent: 2800,
    closed: false,
    keep: 1900,
    bbox: [41.3759, 2.138, 41.4174, 2.19],
    query: 'way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|pedestrian|living_street)$"]',
  },
  {
    id: "streets",
    maxExtent: 13000,
    closed: false,
    keep: 8900,
    bbox: [41.332, 2.056, 41.458, 2.27],
    query: 'way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"];way["natural"="coastline"]',
  },
  {
    id: "coast",
    maxExtent: Infinity,
    closed: false,
    keep: 45000,
    bbox: [41.0, 1.6, 41.8, 2.7],
    query: 'way["natural"="coastline"];way["highway"~"^(motorway|trunk)$"]',
  },
];

/** Half a pixel of ground at the widest window a level serves. */
const ISLAND_PX = 700;
const tolerance = (level, widest) => (widest / ISLAND_PX) * 0.5;

/** Local equirectangular projection, accurate to well under a metre at these areas. */
function project(geometry) {
  const mx = 111320 * Math.cos((CENTRE.lat * Math.PI) / 180);
  return geometry.map((p) => [
    (p.lon - CENTRE.lon) * mx,
    -(p.lat - CENTRE.lat) * 110540,
  ]);
}

function perpendicular(p, a, b) {
  const [ax, ay] = a;
  const dx = b[0] - ax;
  const dy = b[1] - ay;
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - ax, p[1] - ay);
  const t = Math.max(0, Math.min(1,
    ((p[0] - ax) * dx + (p[1] - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - (ax + t * dx), p[1] - (ay + t * dy));
}

/** Douglas-Peucker simplification. Iterative, so long coastlines cannot overflow the stack. */
function simplify(points, tol) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let index = -1;
    let furthest = tol;
    for (let i = first + 1; i < last; i += 1) {
      const d = perpendicular(points[i], points[first], points[last]);
      if (d > furthest) { furthest = d; index = i; }
    }
    if (index !== -1) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const round = (v, decimals) => Number(v.toFixed(decimals));

/**
 * Encodes points as one absolute move followed by deltas, which roughly halves
 * the size of the file.
 *
 * SVG repeats the last command for bare coordinate pairs, so `l` is written
 * once. Each delta is measured against the already rounded position to stop
 * rounding error accumulating along the path.
 */
function relativePath(points, decimals, closed) {
  const n = (v) => String(round(v, decimals));
  let [cx, cy] = [round(points[0][0], decimals), round(points[0][1], decimals)];
  const parts = [`M${n(cx)} ${n(cy)}l`];
  for (let i = 1; i < points.length; i += 1) {
    const tx = round(points[i][0], decimals);
    const ty = round(points[i][1], decimals);
    parts.push(`${n(tx - cx)} ${n(ty - cy)}`);
    cx = tx; cy = ty;
  }
  return parts[0] + parts.slice(1).join(" ") + (closed ? "Z" : "");
}

async function overpass(level, cacheDir) {
  const cached = cacheDir && path.join(cacheDir, `${level.id}.json`);
  if (cached && existsSync(cached)) {
    return JSON.parse(await readFile(cached, "utf8"));
  }
  const [s, w, n, e] = level.bbox;
  const parts = level.query.split(";").filter(Boolean)
    .map((q) => `${q}(${s},${w},${n},${e});`).join("");
  const body = `[out:json][timeout:180];(${parts});out geom;`;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    // Overpass answers 406 to Node's default user agent.
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "nasa-web-app-bake/0.1",
        accept: "application/json",
      },
      body: new URLSearchParams({ data: body }),
    });
    if (response.ok) {
      const json = await response.json();
      if (cached) {
        await mkdir(cacheDir, { recursive: true });
        await writeFile(cached, JSON.stringify(json));
      }
      return json;
    }
    process.stderr.write(`  ${level.id}: ${response.status}, reintento ${attempt}\n`);
    await new Promise((r) => setTimeout(r, 20000));
  }
  throw new Error(`Overpass no responde para ${level.id}`);
}

async function bake(level, cacheDir) {
  const data = await overpass(level, cacheDir);
  const widest = Number.isFinite(level.maxExtent) ? level.maxExtent : 70000;
  const tol = tolerance(level, widest);
  // below this a shape is smaller than a pixel at the widest window
  const floor = tol * 3;
  const decimals = widest < 1000 ? 1 : 0;

  let rawNodes = 0;
  const shapes = [];
  const points = [];
  for (const element of data.elements) {
    // Trees are nodes: a position is measured, a canopy is not.
    if (element.type === "node") {
      const [[x, y]] = project([element]);
      if (Math.abs(x) <= level.keep && Math.abs(y) <= level.keep) {
        points.push([round(x, decimals), round(y, decimals)]);
      }
      continue;
    }
    if (!element.geometry || element.geometry.length < 2) continue;
    const kept0 = project(element.geometry);
    rawNodes += kept0.length;
    const kept = simplify(kept0, tol);
    const xs = kept.map((p) => p[0]);
    const ys = kept.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (Math.max(x1 - x0, y1 - y0) < floor) continue;
    // a level stores only the ground it is drawn over, not the whole fetch
    if (Math.min(Math.abs(x0), Math.abs(x1)) > level.keep) continue;
    if (Math.min(Math.abs(y0), Math.abs(y1)) > level.keep) continue;
    shapes.push(relativePath(kept, decimals, level.closed));
  }
  const nodes = shapes.reduce((n, s) => n + (s.split(" ").length + 1) / 2, 0);
  process.stderr.write(
    `  ${level.id.padEnd(20)} ${String(shapes.length).padStart(6)} formas  ` +
    `${String(rawNodes).padStart(7)} → ${String(nodes).padStart(6)} nodos  ` +
    `${String(points.length).padStart(5)} puntos  tol ${tol.toFixed(2)} m\n`);
  return {
    id: level.id,
    maxExtent: level.maxExtent,
    closed: level.closed,
    overlay: Boolean(level.overlay),
    shapes,
    points,
  };
}

const cacheIndex = process.argv.indexOf("--cache");
const cacheDir = cacheIndex === -1 ? null : process.argv[cacheIndex + 1];

process.stderr.write("Horneando el mapa:\n");
const layers = [];
for (const level of LEVELS) layers.push(await bake(level, cacheDir));

const body = layers.map((layer) => `  {
    id: ${JSON.stringify(layer.id)},
    maxExtent: ${Number.isFinite(layer.maxExtent) ? layer.maxExtent : "Infinity"},
    closed: ${layer.closed},
    overlay: ${layer.overlay},
    shapes: [
${layer.shapes.map((d) => `      ${JSON.stringify(d)},`).join("\n")}
    ],
    points: [${layer.points.map(([x, y]) => `[${x}, ${y}]`).join(", ")}],
  },`).join("\n");

const out = `/**
 * Barcelona in metres east and south of Dreta de l'Eixample, at several levels
 * of detail.
 *
 * Generated — do not edit by hand. Rebuild with:
 *   node scripts/bake-city-map.mjs
 *
 * Map data © OpenStreetMap contributors, ODbL.
 */
export const ASPECT = ${ASPECT};

export interface CityLayer {
  id: string;
  /** The widest window this level is drawn at, metres. */
  maxExtent: number;
  closed: boolean;
  /** Drawn on top of the level below rather than in place of it. */
  overlay: boolean;
  /** Path data, metres from the centre: \`M x y l dx dy dx dy …\`. */
  shapes: string[];
  /** Street trees. Their position is measured; their canopy is not. */
  points: [number, number][];
}

export const CITY_LAYERS: CityLayer[] = [
${body}
];
`;

const target = path.join(process.cwd(), "lib", "city-map.ts");
await writeFile(target, out);
process.stderr.write(`\n${target} · ${(out.length / 1024).toFixed(0)} KB\n`);
