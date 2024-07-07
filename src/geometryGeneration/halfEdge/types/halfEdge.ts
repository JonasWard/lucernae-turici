export interface HalfEdge {
  id: string; // unique id
  vertex: string; // index of the vector in the global vertex map
  next: string; // next half edge id
  previous: string; // previoys hald edge id
  neighbour?: string; // neigbour id
  face: string; // face id
}
