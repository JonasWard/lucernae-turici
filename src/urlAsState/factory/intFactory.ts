import { DataType } from '../enums/dataTypes';
import { IntData, IntegerBitRangeType } from '../types/intData';

export const getBitsForIntegerNumber = (number: number): IntegerBitRangeType => Math.ceil(Math.log2(number)) as IntegerBitRangeType;

export const create = (min: number, max: number): IntData => {
  if (!Number.isInteger(min) || !Number.isInteger(max)) throw new Error('min and max must be integers');
  if (max - min < 1) throw new Error('max must be at least one');
  if (Math.abs(max - min) > 1023) throw new Error('max - min must be less than 1024');
  const bits = getBitsForIntegerNumber(max - min + 1);
  return { type: DataType.INT, min, max, bits };
};
