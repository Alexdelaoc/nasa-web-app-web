/** Picks a detail level from the baked city map and crops it to a window. */
import { ASPECT, CITY_LAYERS, type CityLayer } from "./city-map";

export { ASPECT };

type Box = [x0: number, y0: number, x1: number, y1: number];

const bounds = new WeakMap<CityLayer, Box[]>();

/**
 * Bounding box of every shape in a layer, computed once and memoised.
 *
 * Shapes are stored as `M x y l dx dy …`, so the walk below accumulates the
 * deltas rather than reading absolute coordinates.
 */
function boundsOf(layer: CityLayer): Box[] {
  const cached = bounds.get(layer);
  if (cached) return cached;

  const boxes = layer.shapes.map((shape): Box => {
    const cut = shape.indexOf("l");
    const [sx, sy] = shape.slice(1, cut).split(" ").map(Number);
    let x = sx;
    let y = sy;
    let x0 = x, y0 = y, x1 = x, y1 = y;

    const deltas = shape.slice(cut + 1).replace("Z", "").split(" ");
    for (let i = 0; i + 1 < deltas.length; i += 2) {
      x += Number(deltas[i]);
      y += Number(deltas[i + 1]);
      if (x < x0) x0 = x; else if (x > x1) x1 = x;
      if (y < y0) y0 = y; else if (y > y1) y1 = y;
    }
    return [x0, y0, x1, y1];
  });

  bounds.set(layer, boxes);
  return boxes;
}

/** The coarsest level whose detail still holds up at this window width. */
export function layerFor(extent: number): CityLayer {
  const ground = CITY_LAYERS.filter((layer) => !layer.overlay);
  return (
    ground.find((layer) => extent <= layer.maxExtent) ?? ground[ground.length - 1]
  );
}

export interface CityGroup {
  id: string;
  closed: boolean;
  shapes: string[];
}

export interface CityView {
  /** Ground level first, then any overlay drawn on top of it. */
  groups: CityGroup[];
  /** Positions of street trees; they carry no measured size. */
  trees: [number, number][];
}

function crop(layer: CityLayer, halfW: number, halfH: number): CityGroup {
  const boxes = boundsOf(layer);
  return {
    id: layer.id,
    closed: layer.closed,
    shapes: layer.shapes.filter((_, index) => {
      const [x0, y0, x1, y1] = boxes[index];
      return x1 >= -halfW && x0 <= halfW && y1 >= -halfH && y0 <= halfH;
    }),
  };
}

/** The shapes that fall inside a window `extent` metres wide, and no others. */
export function cityView(extent: number): CityView {
  const halfW = extent / 2;
  const halfH = (extent * ASPECT) / 2;

  const groups = [crop(layerFor(extent), halfW, halfH)];
  const trees: [number, number][] = [];

  for (const layer of CITY_LAYERS) {
    if (!layer.overlay || extent > layer.maxExtent) continue;
    groups.push(crop(layer, halfW, halfH));
    for (const [x, y] of layer.points) {
      if (Math.abs(x) <= halfW && Math.abs(y) <= halfH) trees.push([x, y]);
    }
  }

  return { groups, trees };
}
