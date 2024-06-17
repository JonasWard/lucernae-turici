import { SemanticlyNestedDataEntry } from './semanticlyNestedDataEntry';
import { GlobalVersion } from './versionData';

export type ObjectGeneratorMethod = (...v: (number | boolean | undefined)[]) => SemanticlyNestedDataEntry;

export type VersionEnumSemantics = {
  [key: string]: { value: number; label: string }[];
};

export type ParserForVersion = {
  version: number;
  versionName: string;
  versionEnumSemantics?: VersionEnumSemantics;
  versionValueAttributeMapper?: { [key: string]: string };
  objectGenerator: ObjectGeneratorMethod;
};

export type VersionParsers = {
  versionRange: GlobalVersion;
  versionParsers: ParserForVersion[];
};
