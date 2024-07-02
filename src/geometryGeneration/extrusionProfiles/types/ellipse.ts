import { ExtrusionCategory } from './extrusionTypes';

export type EllipseExtrusionProfileType = {
  type: ExtrusionCategory.Ellipse;
  radiusTop: number; // realtive value
  insetTop: number; // realtive value
  insetBottom: number; // realtive value
  insetSides: number; // realtive value
  pointedness?: number; // relative value
};
