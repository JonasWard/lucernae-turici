import { TransformationMatrix } from './geometrytypes';

export interface V3 {
  x: number;
  y: number;
  z: number;
}

export class V3 {
  private static massAdd = (vertices: V3[]): V3 => vertices.reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }), { x: 0, y: 0, z: 0 });
  public static add = (...vertices: V3[]): V3 => V3.massAdd(vertices);
  public static sub = (v1: V3, v2: V3): V3 => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z });
  public static mul = (v: V3, s: number): V3 => ({ x: v.x * s, y: v.y * s, z: v.z * s });
  public static getCenter = (vs: V3[]): V3 => V3.mul(V3.massAdd(vs), 1 / vs.length);
  public static getHash = (v: V3) =>
    `${v.x.toFixed(3).replace('-0.000', '0.000')}_${v.y.toFixed(3).replace('-0.000', '0.000')}_${v.z.toFixed(3).replace('-0.000', '0.000')}`;
  public static transform = (v: V3, m: TransformationMatrix): V3 => ({
    x: m[0] * v.x + m[1] * v.y + m[2] * v.z + m[3],
    y: m[4] * v.x + m[5] * v.y + m[6] * v.z + m[7],
    z: m[8] * v.x + m[9] * v.y + m[10] * v.z + m[11],
  });
  public static XAxis = { x: 1, y: 0, z: 0 };
  public static YAxis = { x: 0, y: 1, z: 0 };
  public static ZAxis = { x: 0, y: 0, z: 1 };
  public static Origin = { x: 0, y: 0, z: 0 };
}
