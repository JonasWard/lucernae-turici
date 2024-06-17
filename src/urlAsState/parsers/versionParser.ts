import { VersionData } from '../types/versionData';
import { rawValueParser as rawIntParser, rawIntStringifier } from './intParser';

export const getBitsCount = (versionData: VersionData) => versionData.bits;

export const rawParser = (rawString: string, versionData: VersionData): number => rawIntParser(rawString, versionData.bits);

export const rawStringifier = (value: number, versionData: VersionData): string => {
  if (value > 2 ** versionData.bits - 1) throw new Error('Version exceeds max');
  return rawIntStringifier(value, versionData.bits);
};
