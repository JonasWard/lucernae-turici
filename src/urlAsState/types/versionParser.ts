import { ObjectGenerationOutputStatus } from '../enums/objectGenerationTypes';
import { SemanticlyNestedDataEntry } from './semanticlyNestedDataEntry';
import { GlobalVersion } from './versionData';

/**
 * A method that generates a nested object based on a set of values
 * @param v - The values to be used to generate the object, can be either a valid value for a dataentry, a bitstring (only 0 or 1 chars) or undefined (default value)
 * @returns [The generated object, the generation status, the index end bit of the bit url (-1 if)]
 */
export type ObjectGeneratorMethod = (...v: (number | boolean | string | undefined)[]) => [SemanticlyNestedDataEntry, ObjectGenerationOutputStatus, number];

export type VersionEnumSemantics = {
  [key: string]: { value: number; label: string }[];
};

export type ParserForVersion = {
  version: number;
  versionName: string;
  versionEnumSemantics?: VersionEnumSemantics;
  versionValueAttributeMapper?: { [key: string]: string };
  objectGenerator: ObjectGeneratorMethod[];
};

export type VersionParsers = {
  versionRange: GlobalVersion;
  versionParsers: ParserForVersion[];
};
