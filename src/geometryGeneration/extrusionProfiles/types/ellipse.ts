import { ExtrusionCategory } from './extrusionCategory';

export type EllipseExtrusionProfileType = {
  type: ExtrusionCategory.Ellipse;
  radiusTop: number; // realtive value
  insetTop: number; // realtive value
  insetBottom: number; // realtive value
  insetSides: number; // realtive value
};
