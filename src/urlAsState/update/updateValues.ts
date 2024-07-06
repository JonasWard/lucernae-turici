import * as floatUpdate from './floatUpdate';
import * as intUpdate from './intUpdate';
import * as enumUpdate from './enumUpdate';
import * as versionUpdate from './versionUpdate';
import * as booleanUpdate from './booleanUpdate';
import {
  BooleanDescriptionWithValueType,
  DataEntry,
  EnumDescriptionWithValueType,
  FloatDescriptionWithValueType,
  IntDescriptionWithValueType,
  VersionDescriptionWithValueType,
} from '../types/dataEntry';
import { DataType } from '../enums/dataTypes';

export const updateValue = (original: DataEntry, update: DataEntry): DataEntry => {
  if (original.type !== update.type) throw new Error('Types do not match');
  switch (original.type) {
    case DataType.FLOAT:
      return floatUpdate.updateValue(original, update as FloatDescriptionWithValueType);
    case DataType.INT:
      return intUpdate.updateValue(original, update as IntDescriptionWithValueType);
    case DataType.ENUM:
      return enumUpdate.updateValue(original, update as EnumDescriptionWithValueType);
    case DataType.VERSION:
      return versionUpdate.updateValue(original, update as VersionDescriptionWithValueType);
    case DataType.BOOLEAN:
      return booleanUpdate.updateValue(original, update as BooleanDescriptionWithValueType);
  }
};
