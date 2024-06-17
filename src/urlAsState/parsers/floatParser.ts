import { FloatData, PrecisionRangeType, SignificandBitsType } from '../types/floatData';
import { rawValueParser as rawIntParser, rawIntStringifier } from './intParser';

export const getBitsCount = (floatData: FloatData) => floatData.significand;

export const rawValueParser = (stateString: string, significandBits: SignificandBitsType, precision: PrecisionRangeType): number => {
  if (stateString.length < significandBits) throw new Error(`To few bits for this float bit string (${stateString.length} instead of ${significandBits})`);
  if (stateString.length > significandBits) throw new Error(`To many bits for this float bit string (${stateString.length} instead of ${significandBits})`);

  const significand = rawIntParser(stateString, significandBits);

  return significand * 10 ** -precision;
};

export const rawParser = (stateString: string, floatData: FloatData): number => {
  const v = floatData.min + rawValueParser(stateString, floatData.significand, floatData.precision);
  if (v > floatData.max) throw new Error('Float value exceeds max');
  return v;
};

export const rawStringifier = (value: number, floatData: FloatData): string =>
  rawIntStringifier(Math.round((value - floatData.min) * 10 ** floatData.precision), floatData.significand);
