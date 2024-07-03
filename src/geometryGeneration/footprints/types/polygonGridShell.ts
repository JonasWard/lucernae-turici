import { FootprintCategory } from './footprintCategory';

export interface PolygonGridShellFootprint {
  type: FootprintCategory.HexGrid | FootprintCategory.SquareGrid | FootprintCategory.TriangleGrid;
  size: number;
  xCount: number;
  yCount: number;
  shellThickness: number;
  bufferInside: number;
  bufferOutside: number;
}
