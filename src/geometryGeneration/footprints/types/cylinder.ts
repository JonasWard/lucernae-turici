import { FootprintCategory } from './footprintCategory';

export interface CylinderFootprint {
  type: FootprintCategory.Cylinder;
  bufferInside: number;
  radius0: number;
  radius1: number;
  radius2: number;
  bufferOutside: number;
  segments: number;
}
