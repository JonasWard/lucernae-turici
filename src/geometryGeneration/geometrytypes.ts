import { V3 } from './v3';
import { VoxelState } from './voxelComplex/types/voxelState';

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

export interface VCFaceMetaData {
  originVoxelId?: string;
  voxelState?: VoxelState;
}
