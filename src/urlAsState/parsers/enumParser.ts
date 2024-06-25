import { EnumData } from '../types/enumData';
import { rawValueParser as rawIntParser, rawIntStringifier } from './intParser';

export const getBitsCount = (versionData: EnumData) => versionData.bits;

export const rawParser = (rawString: string, versionData: EnumData): number => rawIntParser(rawString, versionData.bits);

export const rawStringifier = (value: number, versionData: EnumData): string => {
  if (value > versionData.max) throw new Error('Version exceeds max');
  return rawIntStringifier(value, versionData.bits);
};
