import { BooleanData } from './booleanData';
import { FloatData } from './floatData';
import { IntData } from './intData';
import { VersionData } from './versionData';

export type Prettify<T> = {
  [K in keyof T]: T[K];
};

export type DataRangeDescription = VersionData | BooleanData | IntData | FloatData;

interface DataNamingDescription {
  name: string; // only used to make things more legible
  index: number; // value doesn't need to be continuos
}

export type BooleanDiscriptionType = Prettify<BooleanData & DataNamingDescription>;
export type IntDiscriptionType = Prettify<IntData & DataNamingDescription>;
export type FloatDiscriptionType = Prettify<FloatData & DataNamingDescription>;
export type VersionDiscriptionType = Prettify<VersionData & DataNamingDescription>;

export type DataDescription = BooleanDiscriptionType | IntDiscriptionType | FloatDiscriptionType | VersionDiscriptionType;

interface DataEntryDescriptionBoolean {
  value: boolean;
}

interface DataEntryDescriptionNumeric {
  value: number;
}

export type BooleanDescriptionWithValueType = Prettify<BooleanData & DataNamingDescription & DataEntryDescriptionBoolean>;
export type IntDescriptionWithValueType = Prettify<IntData & DataNamingDescription & DataEntryDescriptionNumeric>;
export type FloatDescriptionWithValueType = Prettify<FloatData & DataNamingDescription & DataEntryDescriptionNumeric>;
export type VersionDescriptionWithValueType = Prettify<VersionData & DataNamingDescription & DataEntryDescriptionNumeric>;

export type DataEntry = BooleanDescriptionWithValueType | IntDescriptionWithValueType | FloatDescriptionWithValueType | VersionDescriptionWithValueType;

export type DataEntryArray = DataEntry[];
