import shapes from "@/lib/district-shapes.json";

type Bounds = [number, number, number, number];
type Geometry = { type: "MultiPolygon"; coordinates: number[][][][] };

type Entry = { bounds: Bounds; geometry: Geometry };

const districts = shapes.districts as unknown as Record<string, Entry>;

export const HONG_KONG_BOUNDS = shapes.hongKong as unknown as Bounds;

export function districtShape(id: string) {
  return districts[id];
}
