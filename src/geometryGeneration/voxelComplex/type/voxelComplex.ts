// this is a simple cell class
// a cell has n*2 vertices
// and a cell has n+2 faces
// all side faces are quads
// the top and bottom faces are of order n
// face with index 0 is the top face
// face with index 1 is the bottom face
// the others go clockwise around the axis defined by the center point of the top and bottom face during construction
// the neighbourmap is the map that gives for every face i the neighbouring cell id and the corresponding face on the other cell or null (no neighbour)

import { V3 } from '../../v3';
import { VoxelState } from './voxelState';

export interface Voxel {
  id: string;
  vertices: string[];
  n: number;
  neighbourMap: { [k: number]: [string, number] | null };
  state: VoxelState;
}

export type VoxelComplex = {
  voxels: { [id: string]: Voxel };
  vertices: { [id: string]: V3 };
};
