import { ExtrusionCategory } from './extrusionTypes';

export type GothicExtrusionProfileType = {
  type: ExtrusionCategory.Gothic;
  radiusTop: number; // relative value
  insetTop: number; // relative value
  insetBottom: number; // relative value
  insetSides: number; // relative value
  pointedness: number; // relative value
};
