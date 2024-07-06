import { ObjectGenerationOutputStatus } from '../enums/objectGenerationTypes';
import { DataEntry } from './dataEntry';
import { SemanticlyNestedDataEntry } from './semanticlyNestedDataEntry';
import { GlobalVersion } from './versionData';

/**
 * A method that generates a nested object based on a set of values
 * @param s - url bit string (optional)
 * @param v - The values to be used to generate the object, can be either a valid value for a dataentry, a bitstring (only 0 or 1 chars) or undefined (default value)
 * @returns [The generated object, the generation status, the index end bit of the bit url (-1 if)]
 */
export type ObjectGeneratorMethod = (s?: string, ...v: (DataEntry | undefined)[]) => [SemanticlyNestedDataEntry, ObjectGenerationOutputStatus, number];

export type DefinitionGenerationObject = (v: DataEntry) => DefinitionArrayObject;
export type DefinitionNestedArray = [string, DefinitionArrayObject];
export type DefinitionNestedGenerationObject = [string, DataEntry, DefinitionGenerationObject];
export type DefinitionArrayObject = (DataEntry | DefinitionNestedArray | DefinitionNestedGenerationObject)[];

export type VersionEnumSemantics = {
  [key: string]: { value: number; label: string }[];
};

export type ParserForVersion = {
  version: number;
  versionName: string;
  versionEnumSemantics?: VersionEnumSemantics;
  objectGeneratorParameters: DefinitionArrayObject;
};

export type VersionParsers = {
  versionRange: GlobalVersion;
  versionParsers: ParserForVersion[];
};
