export enum FootprintGeometryTypes {
  Square,
  SquareGrid,
  TriangleGrid,
  HexGrid,
  Cylinder,
  MalculmiusOne,
}

export interface SquareFootprint {
  type: FootprintGeometryTypes.Square;
  size: number;
}

export interface SquareGridFootprint {
  type: FootprintGeometryTypes.SquareGrid;
  size: number;
  xCount: number;
  yCount: number;
}

export interface TriangleGridFootprint {
  type: FootprintGeometryTypes.TriangleGrid;
  size: number;
  xCount: number;
  yCount: number;
}

export interface HexGridFootprint {
  type: FootprintGeometryTypes.HexGrid;
  size: number;
  xCount: number;
  yCount: number;
}

export interface CylinderFootprint {
  type: FootprintGeometryTypes.Cylinder;
  bufferInside: number;
  radius0: number;
  radius1: number;
  radius2: number;
  bufferOutside: number;
  segments: number;
}

export interface MalculmiusOneFootprint {
  type: FootprintGeometryTypes.MalculmiusOne;
  size: number;
  circleRadius: number;
  circleDivisions: number;
  angleSplit: number;
  offsetA: number;
  offsetB: number;
  innerRadius: number;
}

export type FloorplanType = SquareFootprint | SquareGridFootprint | TriangleGridFootprint | HexGridFootprint | CylinderFootprint | MalculmiusOneFootprint;
