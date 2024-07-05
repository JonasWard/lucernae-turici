import { V3 } from '../v3';

export const getTwist = (getAngle: (v: V3) => number) => (v: V3) => {
  const angle = getAngle(v);
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z };
};

export const getWarp =
  (getAngle: (v: V3) => number, abolute: boolean = false) =>
  (v: V3) => {
    const angle = getAngle(v);
    const s = 0.5 * Math.sin(angle) + 0.5 + (abolute ? 1 : 0);

    return { x: v.x * s, y: v.y * s, z: v.z };
  };
