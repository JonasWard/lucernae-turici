import { V3 } from '../v3';
import { IncrementalMethod } from './types/incrementalMethod';

export const getTransformedVertex = (incremental: IncrementalMethod) => (v: V3) => {
  const angle = (incremental.angle * v.z) / incremental.total;
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z };
};
