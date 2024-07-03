import { V2 } from '../v2';
import { getBottomRightUV, getBottomLeftUV, getTopLeftUV, getTopRightUV } from './basemethods';
import { SquareExtrusionProfileType } from './types/square';

export const getExtrusionProfile = (profile: SquareExtrusionProfileType): [V2[], V2[]] => [
  [getBottomRightUV(profile), getBottomLeftUV(profile)],
  [getTopLeftUV(profile), getTopRightUV(profile)],
];
