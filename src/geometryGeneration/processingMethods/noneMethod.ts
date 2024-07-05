import { V3 } from '../v3';
import { NoneMethod } from './types/noneMethod';

export const getAngle = (none: NoneMethod) => (v: V3) => v.z;
