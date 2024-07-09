import { HalfEdgeMeshFactory } from '../halfEdge/halfedge.factory';
import { HalfEdgeModifier } from '../halfEdge/halfedge.modifier';
import { VoxelState } from '../voxelComplex/types/voxelState';
import { createFootprintMesh as createSimpleGridFootprintMesh } from './polygonGridSimple';
import { FootprintCategory } from './types/footprintCategory';
import { SquareFootprint } from './types/square';

export const createFootprintMesh = (square: SquareFootprint) =>
  createSimpleGridFootprintMesh({ type: FootprintCategory.SquareGrid, size: square.size, xCount: 1, yCount: 1 });

export const createFootprintHalfedgeMesh = (square: SquareFootprint) =>
  HalfEdgeModifier.createBufferedHalfEdgeMesh(HalfEdgeMeshFactory.createHalfEdgeMeshFromMesh(createFootprintMesh(square)), VoxelState.OPEN, 80);
