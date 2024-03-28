export interface V2 {
  u: number;
  v: number;
}

export interface V3 {
  x: number;
  y: number;
  z: number;
}

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
  face?: string; // face id
}

export interface HalfEdgeFace {
  id: string; // unique id
  edge: string; // the id of one of the edges that is part of this face
}
