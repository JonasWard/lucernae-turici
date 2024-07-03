export interface V2 {
  u: number;
  v: number;
}

export class V2 {
  private static zeroTolerance = 1e-3;
  private static zeroToleranceSquared = V2.zeroTolerance ** 2;
  private static massAdd = (vertices: V2[]): V2 => vertices.reduce((a, b) => ({ u: a.u + b.u, v: a.v + b.v }), { u: 0, v: 0 });
  public static add = (...vertices: V2[]): V2 => V2.massAdd(vertices);
  public static sub = (v1: V2, v2: V2): V2 => ({ u: v1.u - v2.u, v: v1.v - v2.v });
  public static mul = (v: V2, s: number): V2 => ({ u: v.u * s, v: v.v * s });
  public static dot = (v1: V2, v2: V2): number => v1.u * v2.u + v1.v * v2.v;
  public static cross = (v1: V2, v2: V2): number => v1.u * v2.v - v1.v * v2.u;
  public static getCenter = (vs: V2[]): V2 => V2.mul(V2.massAdd(vs), 1 / vs.length);
  public static getLengthSquared = (v: V2): number => v.u ** 2 + v.v ** 2;
  public static getLength = (v: V2): number => (v.u ** 2 + v.v ** 2) ** 0.5;
  public static getUnit = (v: V2): V2 => (V2.getLengthSquared(v) > V2.zeroToleranceSquared ? V2.mul(v, 1 / V2.getLength(v)) : V2.Origin);
  public static getHash = (v: V2) => `${v.u.toFixed(2).replace('-0.00', '0.00')}_${v.v.toFixed(2).replace('-0.00', '0.00')}}`;
  public static get UAxis() {
    return { u: 1, v: 0 };
  }
  public static get VAxis() {
    return { u: 0, v: 1 };
  }
  public static get Origin() {
    return { u: 0, v: 0 };
  }
}
