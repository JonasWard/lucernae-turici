import { ExtrusionCategory } from './extrusionTypes';

export type SquareExtrusionProfileType = {
  type: ExtrusionCategory.Square;
  insetTop: number; // relative value
  insetBottom: number; // relative value
  insetSides: number; // relative value
};
