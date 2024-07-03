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
import { EllipseExtrusionProfileType } from './types/ellipse';

export const getExtrusionProfile = (profile: EllipseExtrusionProfileType, divisions = 8): [V2[], V2[]] => [
  [
    getBottomRightUV(profile),
    ...mapUVsToQuad(
      getBaseArcForPointedness(divisions),
      getCenterArcUV(profile),
      getSideArcUV(profile),
      getBottomLeftUV(profile),
      getBottomRightUV(profile)
    ).reverse(),
  ],
  [
    getSideArcUV(profile),
    ...mapUVsToQuad(getBaseArcForPointedness(divisions), getCenterArcUV(profile), getSideArcUV(profile), getTopLeftUV(profile), getTopRightUV(profile)),
    getTopRightUV(profile),
  ],
];
