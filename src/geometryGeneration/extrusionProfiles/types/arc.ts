import { ExtrusionCategory } from './extrusionTypes';

export type ArcExtrusionProfileType = {
  type: ExtrusionCategory.Arc;
  radiusTop: number; // relative value
  insetTop: number; // relative value
  insetBottom: number; // relative value
  insetSides: number; // relative value
  pointedness?: number; // relative value
};
