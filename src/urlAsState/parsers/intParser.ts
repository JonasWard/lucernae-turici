import { IntData } from '../types/intData';

export const getBitsCount = (intData: IntData) => intData.bits;

export const rawValueParser = (stateString: string, bitCount: number) => {
  if (stateString.length < bitCount) throw new Error(`To few bits for this int bit string (${stateString.length} instead of ${bitCount})`);
  if (stateString.length > bitCount) throw new Error(`To many bits for this int bit string (${stateString.length} instead of ${bitCount})`);

  const parsed = parseInt(stateString, 2);
  if (isNaN(parsed)) throw new Error('Invalid int state string');
  return parsed;
};

export const rawParser = (stateString: string, intData: IntData): number => {
  const v = rawValueParser(stateString, intData.bits) + intData.min;
  if (v > intData.max) throw new Error('Value exceeds max');
  return v;
};

export const rawIntStringifier = (value: number, bitCount: number): string => {
  if (Number.isInteger(value) === false) throw new Error('Value is not an integer');
  return value.toString(2).padStart(bitCount, '0');
};

export const rawStringifier = (value: number, intData: IntData): string => {
  if (value < intData.min) throw new Error('Value is below min');
  if (value > intData.max) throw new Error('Value exceeds max');
  return rawIntStringifier(value - intData.min, intData.bits);
};
