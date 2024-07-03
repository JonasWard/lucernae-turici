import { ArcExtrusionProfileType } from './arc';
import { SquareExtrusionProfileType } from './square';
import { EllipseExtrusionProfileType } from './ellipse';
import { GothicExtrusionProfileType } from './gothic';
import { NestedExtrusionProfileType } from './nested';

export type ExtrusionProfileType =
  | SquareExtrusionProfileType
  | ArcExtrusionProfileType
  | EllipseExtrusionProfileType
  | GothicExtrusionProfileType
  | NestedExtrusionProfileType;

export type ArcLikeExtrusionProfileType = ArcExtrusionProfileType | EllipseExtrusionProfileType | GothicExtrusionProfileType | NestedExtrusionProfileType;
