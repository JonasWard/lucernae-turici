import { V2 } from '../v2';
import {
  getBottomRightUV,
  getBottomLeftUV,
  getTopLeftUV,
  getTopRightUV,
  getBaseArcForPointedness,
  getCenterArcUV,
  getSideArcUV,
  mapUVsToQuad,
} from './basemethods';
import { ArcExtrusionProfileType } from './types/arc';

export const getExtrusionProfile = (profile: ArcExtrusionProfileType, divisions = 8): [V2[], V2[]] => [
  [getBottomRightUV(profile), getBottomLeftUV(profile)],
  [
    getSideArcUV(profile),
    ...mapUVsToQuad(getBaseArcForPointedness(divisions), getCenterArcUV(profile), getSideArcUV(profile), getTopLeftUV(profile), getTopRightUV(profile)),
    getTopRightUV(profile),
  ],
];
