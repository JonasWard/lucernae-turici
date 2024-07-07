// currently all extrusion profiles are based on a quad input
// they each have their own parametrics and return a list of UVs
// the uvs for a given extrusion profile are always coming from the bottom right, going clockwise (bottom left, top left, top right)

import { V2 } from '../v2';
import { ArcLikeExtrusionProfileType, ExtrusionProfileType } from './types/extrusionProfileType';

// // helper methods for the key positions of a quad
// export const getBottomRightUV = (extrusionProfile: ExtrusionProfileType): V2 => ({ u: 0, v: extrusionProfile.insetBottom });
// export const getBottomLeftUV = (extrusionProfile: ExtrusionProfileType): V2 => ({ u: 1 - extrusionProfile.insetSides, v: extrusionProfile.insetBottom });
// export const getTopLeftUV = (extrusionProfile: ExtrusionProfileType): V2 => ({ u: 1 - extrusionProfile.insetSides, v: 1 - extrusionProfile.insetTop });
// export const getTopRightUV = (extrusionProfile: ExtrusionProfileType): V2 => ({ u: 0, v: 1 - extrusionProfile.insetTop });

// insets not applied
export const getBottomRightUV = (extrusionProfile: ExtrusionProfileType): V2 => ({ u: 0, v: 0 });
export const getBottomLeftUV = (extrusionProfile: ExtrusionProfileType): V2 => ({ u: 1, v: 0 });
export const getTopLeftUV = (extrusionProfile: ExtrusionProfileType): V2 => ({ u: 1, v: 1 });
export const getTopRightUV = (extrusionProfile: ExtrusionProfileType): V2 => ({ u: 0, v: 1 });

const getArcStartV = (arcExtrusionProfile: ArcLikeExtrusionProfileType): number => 1 - arcExtrusionProfile.radiusTop;
export const getCenterArcUV = (arcExtrusionProfile: ArcLikeExtrusionProfileType): V2 => ({
  u: 0,
  v: getArcStartV(arcExtrusionProfile),
});
export const getSideArcUV = (arcLike: ArcLikeExtrusionProfileType): V2 => ({
  u: 1,
  v: getArcStartV(arcLike),
});

/**
 * Method that returns all the inner arc positions for an arch definition (excluding the extreme ones, which are already given)
 * @param divisions - amount of segments the arc is constructed from
 * @param pointedness - the sharpness of the arch, defined by the percentage of a quarter circle is used. If less than .05, instead of a circle segment a straight line is used
 */
export const getBaseArcForPointedness = (divisions: number, pointedness: number = 1): V2[] => {
  const uvs: V2[] = [];
  if (pointedness < 0.05) {
    const scale = 1 / divisions;
    for (let i = 1; i < divisions; i++) uvs.push({ u: scale * i, v: scale * i });
  } else {
    const alfaDelta = (Math.PI * 0.5 * pointedness) / divisions;
    const baseU = Math.cos(Math.PI * 0.5 * pointedness);
    const scaleU = 1 / (1 - Math.cos(Math.PI * 0.5 * pointedness));
    const scaleV = 1 / Math.sin(Math.PI * 0.5 * pointedness);

    for (let i = 1; i < divisions; i++) uvs.push({ u: (Math.cos(alfaDelta * i) - baseU) * scaleU, v: Math.sin(alfaDelta * i) * scaleV });
  }

  return uvs;
};

const mapUVToQuad = (uv: V2, v00: V2, v01: V2, v11: V2, v10: V2): V2 =>
  V2.add(V2.mul(v00, (1 - uv.u) * (1 - uv.v)), V2.mul(v01, uv.u * (1 - uv.v)), V2.mul(v10, (1 - uv.u) * uv.v), V2.mul(v11, uv.u * uv.v));

/**
 * Method for mapping uvs to a quad
 * @param uvs - V2[] uvs to map
 * @param v00 - V2 bottom left
 * @param v01 - V2 bottom right
 * @param v11 - V2 top right
 * @param v10 - V2 top left
 */
export const mapUVsToQuad = (uvs: V2[], v00: V2, v01: V2, v11: V2, v10: V2): V2[] => uvs.map((uv) => mapUVToQuad(uv, v00, v01, v11, v10));
