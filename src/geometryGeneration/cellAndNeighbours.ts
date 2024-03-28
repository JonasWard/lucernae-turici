import { Vector3 } from '@babylonjs/core';
import { Face } from './baseGeometry';

// this is a simple cell class
// a cell has n+2 faces
// n-side faces (in practice minimum 3)
// and a top and bottom face
// the face-list is structured sp that the first entry is the "bottom" face, the second one is the "top" face (so not to use length -1)
// and the rest are the side faces
// a cell has an index,
// a second face list exists which contains a map of the cell neighbouring and the corresponding face

type Cell = {
  id: string;
  vertices: Vector3[];
  faces: Face[];
  neighbourMap: Map<number, [string, number]>;
};
