import { create as createFloat } from './floatFactory';
import { create as createInt } from './intFactory';
import { create as createBoolean } from './booleanFactory';
import { create as createVersion } from './versionFactory';
import { create as createEnum } from './enumFactory';

import {
  BooleanDescriptionWithValueType,
  IntDescriptionWithValueType,
  FloatDescriptionWithValueType,
  VersionDescriptionWithValueType,
  FloatDiscriptionType,
  BooleanDiscriptionType,
  VersionDiscriptionType,
  IntDiscriptionType,
  EnumDiscriptionType,
  EnumDescriptionWithValueType,
} from '../types/dataEntry';
import { PrecisionRangeType } from '../types/floatData';
import { VersionRangeType } from '../types/versionData';

export class DataRangeDescriptionFactory {
  public static createFloat = createFloat;
  public static createInt = createInt;
  public static createEnum = createEnum;
  public static createBoolean = createBoolean;
  public static createVersion = createVersion;
}

export class DataDescriptionFactory {
  public static createFloat = (
    min: number = 0,
    max: number = 1,
    precision: PrecisionRangeType = 2,
    name: string = '',
    index: number = 0
  ): FloatDiscriptionType => ({
    ...createFloat(min, max, precision),
    name,
    index,
  });
  public static createInt = (min: number = 0, max: number = 10, name: string = '', index: number = 0): IntDiscriptionType => ({
    ...createInt(min, max),
    name,
    index,
  });
  public static createEnum = (max: number = 10, name: string = '', index: number = 0): EnumDiscriptionType => ({
    ...createEnum(max),
    name,
    index,
  });
  public static createBoolean = (name: string = '', index: number = 0): BooleanDiscriptionType => ({
    ...createBoolean(),
    name,
    index,
  });
  public static createVersion = (bits: VersionRangeType = 8, name: string = '', index: number = 0): VersionDiscriptionType => ({
    ...createVersion(bits),
    name,
    index,
  });
}

export class DataEntryFactory {
  public static createFloat = (
    value: number,
    min: number = 0,
    max: number = 1,
    precision: PrecisionRangeType = 2,
    name: string = '',
    index: number = 0
  ): FloatDescriptionWithValueType => ({
    ...createFloat(min, max, precision),
    value,
    name,
    index,
  });
  public static createInt = (value: number, min: number = 0, max: number = 10, name: string = '', index: number = 0): IntDescriptionWithValueType => ({
    ...createInt(min, max),
    value,
    name,
    index,
  });
  public static createEnum = (value: number, max: number = 10, name: string = '', index: number = 0): EnumDescriptionWithValueType => ({
    ...createEnum(max),
    value,
    name,
    index,
  });
  public static createBoolean = (value: boolean, name: string = '', index: number = 0): BooleanDescriptionWithValueType => ({
    ...createBoolean(),
    value,
    name,
    index,
  });
  public static createVersion = (value: number, bits: VersionRangeType = 8, name: string = '', index: number = 0): VersionDescriptionWithValueType => ({
    ...createVersion(bits),
    value,
    name,
    index,
  });
}
