import { DataType } from '../enums/dataTypes';
import { BooleanData } from '../types/booleanData';

export const create = (): BooleanData => ({ type: DataType.BOOLEAN });
