import { HalfEdgeMeshFactory } from '../halfEdge/halfedge.factory';
import { createFootprintMesh as createSimpleGridFootprintMesh } from './polygonGridSimple';
import { FootprintCategory } from './types/footprintCategory';
import { SquareFootprint } from './types/square';

export const createFootprintMesh = (square: SquareFootprint) =>
  createSimpleGridFootprintMesh({ type: FootprintCategory.SquareGrid, size: square.size, xCount: 1, yCount: 1 });

export const createFootprintHalfedgeMesh = (square: SquareFootprint) => HalfEdgeMeshFactory.createHalfEdgeMeshFromMesh(createFootprintMesh(square));
