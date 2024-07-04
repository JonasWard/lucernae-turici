import { V3 } from '../v3';
import { getCenterOfVoxel } from './voxelComplex';
import { Voxel, VoxelComplex } from './type/voxelComplex';
import { VoxelInternalFaceState } from './type/voxelInternalFaceState';
import { VoxelState } from './type/voxelState';

const numberAsVoxelState = (n: number) => {
  if (n < 1) return VoxelState.NONE;
  if (n < 2) return VoxelState.OPEN;
  else return VoxelState.MASSIVE;
};

const getInternalVoxelFaceState = (vState: VoxelState, oVState?: VoxelState): VoxelInternalFaceState => {
  if (vState === VoxelState.NONE || vState === VoxelState.MASSIVE) return VoxelInternalFaceState.NONE;
  else if (oVState === VoxelState.MASSIVE) return VoxelInternalFaceState.CLOSED;
  return VoxelInternalFaceState.OPEN;
};

export const getNeighbourState = (v: Voxel, vX: VoxelComplex, idx: number): VoxelState =>
  v.neighbourMap[idx] !== null ? vX.voxels[v.neighbourMap[idx]![0]].state : VoxelState.NONE;

export const isFaceClosed = (vState: VoxelState, oVState: VoxelState): boolean => (vState !== VoxelState.NONE ? oVState === VoxelState.NONE : false);

// simple method that goes through a voxel complex and based on the position of its voxels activates / deactivates the voxel
export const setVoxelComplexState = (vX: VoxelComplex, sdfMethod: (v: V3) => number) =>
  Object.values(vX.voxels).forEach((v) => (v.state = numberAsVoxelState(sdfMethod(getCenterOfVoxel(v, vX)))));

const getStateIndexes = Object.values(VoxelState).slice(Object.values(VoxelState).length / 2) as number[];
export const maxStateSize = Math.max(...getStateIndexes);
