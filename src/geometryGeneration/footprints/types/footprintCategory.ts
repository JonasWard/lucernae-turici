export enum FootprintCategory {
  Square,
  SquareGrid,
  TriangleGrid,
  HexGrid,
  Cylinder,
  MalculmiusOne,
}

export type GridFootprintCategory = FootprintCategory.SquareGrid | FootprintCategory.TriangleGrid | FootprintCategory.HexGrid;
