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
import { NestedExtrusionProfileType } from './types/nested';

export const getExtrusionProfile = (profile: NestedExtrusionProfileType): [V2[], V2[]] => {
  const arc = [{ u: 1, v: 0 }, ...getBaseArcForPointedness(profile.divisionCount, profile.pointedness), { u: 0, v: 1 }];

  const nestedArcUVs = [];
  const nestedProfileBaseUVs = getBaseArcForPointedness(profile.divisionResolution, profile.divisionPointedness);

  for (let i = 0; i < arc.length - 1; i++) {
    const v01 = arc[i];
    const v10 = arc[i + 1];

    const v11 = { u: v01.u, v: v10.v };
    const v00 = { u: v10.u, v: v01.v };

    nestedArcUVs.push(v01);
    nestedArcUVs.push(...mapUVsToQuad(nestedProfileBaseUVs, v00, v01, v11, v10));
    if (i === arc.length - 2) nestedArcUVs.push(v10);
  }

  return [
    [getBottomRightUV(profile), getBottomLeftUV(profile)],
    mapUVsToQuad(nestedArcUVs, getCenterArcUV(profile), getSideArcUV(profile), getTopLeftUV(profile), getTopRightUV(profile)),
  ];
};
