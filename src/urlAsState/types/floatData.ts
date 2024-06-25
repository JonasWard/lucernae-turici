// floating points are interpreted as base 10 numbers
// either by the precision or from the min max range of a float, an exponent is derived
// from that, the radix is turned into an integer which, just like with the Int data type, can have a maximum delta between min and max of 1024
// the input component rounds accordingly!

import { DataType } from '../enums/dataTypes';

export type PrecisionRangeType = -3 | -2 | -1 | 0 | 1 | 2 | 3;
export type SignificandBitsType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface FloatData {
  type: DataType.FLOAT;
  min: number;
  max: number;
  precision: PrecisionRangeType;
  significand: SignificandBitsType;
}
