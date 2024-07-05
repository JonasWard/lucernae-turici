import { V3 } from '../v3';
import { SinMethod } from './types/sinMethod';

export const getAngle = (sinMethod: SinMethod) => (v: V3) => (v.z * Math.PI * 2) / sinMethod.period + sinMethod.phaseShift;
