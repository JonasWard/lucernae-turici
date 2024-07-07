import { V2 } from '../../v2';
/**
 * Interface that defines the parameters of an extrusion profile
 * the uvs define the extrusion profile into more detail
 * the inset values are seen in relationship to the actual geometry of the frame
 */
export interface VoxelComplexExtrusionParameters {
  bottomUVs: V2[]; //bottomUVs of the hole extrusion profile
  topUVs: V2[]; // topUVs of the hole extrusion profile
  uvs: V2[]; // uvs of the hole extrusion profile
  insetTop: number; // relative value, should only consider the delta in z direction
  insetBottom: number; // relative value, should only consider the delta in z direction
  insetSides: number; // can consider the whole line segment
}
