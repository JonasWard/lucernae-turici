import { V3 } from '../v3';
import { SinMethod } from './types/sinMethod';

export const getTransformedVertex = (sinMethod: SinMethod) => (v: V3) => {
  const angle = (v.z * Math.PI * 2) / sinMethod.period + sinMethod.phaseShift;
  const s = 0.5 + Math.cos(angle) * 0.5;

  return { x: v.x * s, y: v.y * s, z: v.z };
};
