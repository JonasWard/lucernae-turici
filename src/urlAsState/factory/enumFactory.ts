import { DataType } from '../enums/dataTypes';
import { EnumData } from '../types/enumData';
import { getBitsForIntegerNumber } from './intFactory';

export const create = (max: number): EnumData => {
  if (!Number.isInteger(max)) throw new Error('min and max must be integers');
  if (max < 1) throw new Error('max must be at least one');
  if (max > 1023) throw new Error('max - min must be less than 1024');
  const bits = getBitsForIntegerNumber(max + 1);
  return { type: DataType.ENUM, max, bits };
};
