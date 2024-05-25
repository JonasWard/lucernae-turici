export enum FootprintGeometryTypes {
  Square,
  SquareGrid,
  TriangleGrid,
  HexGrid,
  Cylinder,
  MalculmiusOne,
}

export interface SquareFootprint {
  floorType: FootprintGeometryTypes.Square;
  size: number;
}

export interface SquareGridFootprint {
  floorType: FootprintGeometryTypes.SquareGrid;
  size: number;
  xCount: number;
  yCount: number;
}

export interface TriangleGridFootprint {
  floorType: FootprintGeometryTypes.TriangleGrid;
  size: number;
  xCount: number;
  yCount: number;
}

export interface HexGridFootprint {
  floorType: FootprintGeometryTypes.HexGrid;
  size: number;
  xCount: number;
  yCount: number;
}

export interface CylinderFootprint {
  floorType: FootprintGeometryTypes.Cylinder;
  bufferInside: number;
  radius0: number;
  radius1: number;
  radius2: number;
  bufferOutside: number;
  segments: number;
}

export interface MalculmiusOneFootprint {
  floorType: FootprintGeometryTypes.MalculmiusOne;
  size: number;
  circleRadius: number;
  circleDivisions: number;
  angleSplit: number;
  offsetA: number;
  offsetB: number;
  innerRadius: number;
}

export type FloorplanType = SquareFootprint | SquareGridFootprint | TriangleGridFootprint | HexGridFootprint | CylinderFootprint | MalculmiusOneFootprint;
