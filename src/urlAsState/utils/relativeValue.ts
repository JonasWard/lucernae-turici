import { DataType } from '../enums/dataTypes';
import { DataEntry } from '../types/dataEntry';

export const getRelativeValue = (dataEntry: DataEntry): number => {
  switch (dataEntry.type) {
    case DataType.BOOLEAN:
      return Number(dataEntry.value);
    case DataType.INT:
    case DataType.FLOAT:
      return (dataEntry.value - dataEntry.min) / (dataEntry.max - dataEntry.min);
    case DataType.VERSION:
      return dataEntry.value / (2 ** dataEntry.bits - 1);
    case DataType.ENUM:
      return dataEntry.value / dataEntry.max;
  }
};
