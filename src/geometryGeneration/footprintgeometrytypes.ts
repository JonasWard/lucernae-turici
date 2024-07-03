import { FootprintCategory } from './footprints/types/footprintCategory';

export interface SquareFootprint {
  type: FootprintCategory.Square;
  size: number;
}

export interface SquareGridFootprint {
  type: FootprintCategory.SquareGrid;
  size: number;
  xCount: number;
  yCount: number;
}

export interface TriangleGridFootprint {
  type: FootprintCategory.TriangleGrid;
  size: number;
  xCount: number;
  yCount: number;
}

export interface HexGridFootprint {
  type: FootprintCategory.HexGrid;
  size: number;
  xCount: number;
  yCount: number;
}

export interface CylinderFootprint {
  type: FootprintCategory.Cylinder;
  bufferInside: number;
  radius0: number;
  radius1: number;
  radius2: number;
  bufferOutside: number;
  segments: number;
}

export interface MalculmiusOneFootprint {
  type: FootprintCategory.MalculmiusOne;
  circleRadius: number;
  circleDivisions: number;
  angleSplit: number;
  offsetA: number;
  offsetB: number;
  innerRadius: number;
}

export type FloorplanType = SquareFootprint | SquareGridFootprint | TriangleGridFootprint | HexGridFootprint | CylinderFootprint | MalculmiusOneFootprint;
