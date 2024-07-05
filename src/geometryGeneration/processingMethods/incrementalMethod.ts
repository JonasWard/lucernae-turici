import { V3 } from '../v3';
import { IncrementalMethod } from './types/incrementalMethod';

export const getAngle =
  (incremental: IncrementalMethod) =>
  (v: V3): number =>
    (incremental.angle * v.z) / incremental.total;
