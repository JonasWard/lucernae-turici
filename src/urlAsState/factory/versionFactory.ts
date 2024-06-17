import { DataType } from '../enums/dataTypes';
import { VersionRangeType, VersionData } from '../types/versionData';

export const create = (bits: VersionRangeType): VersionData => ({
  type: DataType.VERSION,
  bits,
});
