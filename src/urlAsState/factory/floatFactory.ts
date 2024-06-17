import { DataType } from '../enums/dataTypes';
import { FloatData, PrecisionRangeType, SignificandBitsType } from '../types/floatData';
import { getBitsForIntegerNumber } from './intFactory';

export const create = (min: number, max: number, precision: PrecisionRangeType): FloatData => {
  const precisionMultiplier = 10 ** precision;

  const roundedMin = Math.floor(min * precisionMultiplier);
  const roundedMax = Math.ceil(max * precisionMultiplier);
  const delta = roundedMax - roundedMin;

  const significand = Math.max(1, getBitsForIntegerNumber(delta)) as SignificandBitsType;

  return {
    type: DataType.FLOAT,
    min: roundedMin / precisionMultiplier,
    max: roundedMax / precisionMultiplier,
    precision,
    significand,
  };
};
