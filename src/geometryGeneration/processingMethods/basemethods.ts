import { V3 } from '../v3';

export const getTwist =
  (getAngle: (v: V3) => number, min = 0, delta = 1) =>
  (v: V3) => {
    const angle = getAngle(v);
    const c = Math.cos(min + delta * angle);
    const s = Math.sin(min + delta * angle);

    return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z };
  };

export const getWarp =
  (getAngle: (v: V3) => number, abolute: boolean = false, min = 0, delta = 1) =>
  (v: V3) => {
    const angle = getAngle(v);
    const baseFactor = delta * 0.5 * Math.sin(angle) + 0.5 + (abolute ? 1 : 0); // element of domain [0, 1]
    const s = min + baseFactor * delta;

    return { x: v.x * s, y: v.y * s, z: v.z };
  };
