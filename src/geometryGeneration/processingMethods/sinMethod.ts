import { V3 } from '../v3';
import { SinMethod } from './types/sinMethod';

export const getAngle =
  (sinMethod: SinMethod, min = 0, delta = 1) =>
  (v: V3) =>
    min + delta * Math.PI * 2 * (v.z / sinMethod.period + sinMethod.phaseShift + 0.25);
