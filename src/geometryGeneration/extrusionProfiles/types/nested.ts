import { ExtrusionCategory } from './extrusionCategory';

export type NestedExtrusionProfileType = {
  type: ExtrusionCategory.Nested;
  radiusTop: number; // relative value
  insetTop: number; // relative value
  insetBottom: number; // relative value
  insetSides: number; // relative value
  pointedness: number; // relative value
  divisionPointedness: number; // relative value
  divisionCount: number; // integer
  divisionResolution: number; // integer
};
