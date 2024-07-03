import { FootprintCategory } from './footprintCategory';

export interface PolygonGridSimpleFootprint {
  type: FootprintCategory.HexGrid | FootprintCategory.SquareGrid | FootprintCategory.TriangleGrid;
  size: number;
  xCount: number;
  yCount: number;
}
