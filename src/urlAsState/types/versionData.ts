import { DataType } from '../enums/dataTypes';

export type VersionRangeType = 4 | 6 | 8 | 10;

export interface VersionData {
  type: DataType.VERSION;
  bits: VersionRangeType;
}

export interface GlobalVersion {
  type: DataType.VERSION;
  bits: 8;
}
