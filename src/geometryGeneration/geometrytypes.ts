import { V3 } from './v3';
import { VoxelState } from './voxelComplex.type';

export interface BaseFrame {
  o: V3;
  x: V3;
  y: V3;
  z: V3;
}

export type TransformationMatrix = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export interface HalfEdgeMesh {
  faces: { [k: string]: HalfEdgeFace };
  halfEdges: { [k: string]: HalfEdge };
  vertices: { [k: string]: V3 };
}

export interface HalfEdge {
  id: string; // unique id
  vertex: string; // index of the vector in the global vertex map
  next: string; // next half edge id
  previous: string; // previoys hald edge id
  neighbour?: string; // neigbour id
  face: string; // face id
}

export interface VCFaceMetaData {
  originVoxelId?: string;
  voxelState?: VoxelState;
}

export interface HalfEdgeFace {
  id: string; // unique id
  edge: string; // the id of one of the edges that is part of this face
  metaData?: VCFaceMetaData;
}
