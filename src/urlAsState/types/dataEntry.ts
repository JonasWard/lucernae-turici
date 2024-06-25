import { BooleanData } from './booleanData';
import { EnumData } from './enumData';
import { FloatData } from './floatData';
import { IntData } from './intData';
import { VersionData } from './versionData';

export type Prettify<T> = {
  [K in keyof T]: T[K];
};

export type DataRangeDescription = VersionData | BooleanData | IntData | EnumData | FloatData;

interface DataNamingDescription {
  name: string; // only used to make things more legible
  index: number; // value doesn't need to be continuos
}

export type BooleanDiscriptionType = Prettify<BooleanData & DataNamingDescription>;
export type IntDiscriptionType = Prettify<IntData & DataNamingDescription>;
export type EnumDiscriptionType = Prettify<EnumData & DataNamingDescription>;
export type FloatDiscriptionType = Prettify<FloatData & DataNamingDescription>;
export type VersionDiscriptionType = Prettify<VersionData & DataNamingDescription>;

export type DataDescription = BooleanDiscriptionType | IntDiscriptionType | EnumDiscriptionType | FloatDiscriptionType | VersionDiscriptionType;

interface DataEntryDescriptionBoolean {
  value: boolean;
}

interface DataEntryDescriptionNumeric {
  value: number;
}

export type BooleanDescriptionWithValueType = Prettify<BooleanData & DataNamingDescription & DataEntryDescriptionBoolean>;
export type IntDescriptionWithValueType = Prettify<IntData & DataNamingDescription & DataEntryDescriptionNumeric>;
export type EnumDescriptionWithValueType = Prettify<EnumData & DataNamingDescription & DataEntryDescriptionNumeric>;
export type FloatDescriptionWithValueType = Prettify<FloatData & DataNamingDescription & DataEntryDescriptionNumeric>;
export type VersionDescriptionWithValueType = Prettify<VersionData & DataNamingDescription & DataEntryDescriptionNumeric>;

export type DataEntry =
  | BooleanDescriptionWithValueType
  | IntDescriptionWithValueType
  | EnumDescriptionWithValueType
  | FloatDescriptionWithValueType
  | VersionDescriptionWithValueType;

export type DataEntryArray = DataEntry[];
