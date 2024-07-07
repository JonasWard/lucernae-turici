import * as cylinder from './cylinder';
import * as square from './square';
import * as polygonGridShell from './polygonGridShell';
import * as polygonGridSimple from './polygonGridSimple';
import * as malcolmiusOne from './malcolmiusOne';
import { FootprintType } from './types/footprintgeometrytypes';
import { FootprintCategory } from './types/footprintCategory';
import { PolygonGridShellFootprint } from './types/polygonGridShell';
import { Mesh } from '../v3';
import { HalfEdgeMesh } from '../halfEdge/types/HalfEdgeMesh';

export class FootprintFactory {
  public static createFootprintMesh(footprint: FootprintType): Mesh {
    switch (footprint.type) {
      case FootprintCategory.Square:
        return square.createFootprintMesh(footprint);
      case FootprintCategory.HexGrid:
      case FootprintCategory.TriangleGrid:
      case FootprintCategory.SquareGrid:
        if (footprint.hasOwnProperty('shellThickness')) return polygonGridShell.createFootprintMesh(footprint as PolygonGridShellFootprint);
        return polygonGridSimple.createFootprintMesh(footprint);
      case FootprintCategory.Cylinder:
        return cylinder.createFootprintMesh(footprint);
      case FootprintCategory.MalculmiusOne:
        return malcolmiusOne.createFootprintMesh(footprint);
    }
  }

  public static createFootprintHalfedgeMesh(footprint: FootprintType): HalfEdgeMesh {
    switch (footprint.type) {
      case FootprintCategory.Square:
        return square.createFootprintHalfedgeMesh(footprint);
      case FootprintCategory.HexGrid:
      case FootprintCategory.TriangleGrid:
      case FootprintCategory.SquareGrid:
        if (footprint.hasOwnProperty('shellThickness')) return polygonGridShell.createFootprintHalfedgeMesh(footprint as PolygonGridShellFootprint);
        return polygonGridSimple.createFootprintHalfedgeMesh(footprint);
      case FootprintCategory.Cylinder:
        return cylinder.createFootprintHalfedgeMesh(footprint);
      case FootprintCategory.MalculmiusOne:
        return malcolmiusOne.createFootprintHalfedgeMesh(footprint);
    }
  }
}
