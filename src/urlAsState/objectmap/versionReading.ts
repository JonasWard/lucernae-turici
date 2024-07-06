import { ObjectGenerationOutputStatus } from '../enums/objectGenerationTypes';
import { DataDescriptionFactory } from '../factory/factory';
import {
  dataArrayStringifier,
  dataBitsArrayParser,
  dataBitsParser,
  dataBitsStringifier,
  getBitsCount,
  parseBase64ToBits,
  parseBitsToBase64,
} from '../parsers/parsers';
import { DataDescription, DataEntry, DataEntryArray, VersionDescriptionWithValueType } from '../types/dataEntry';
import { SemanticlyNestedDataDescription, SemanticlyNestedDataEntry } from '../types/semanticlyNestedDataEntry';
import { DefinitionArrayObject, ParserForVersion } from '../types/versionParser';

const parameterOffset = 100;

/**
 * Method for finding the names of the variable data entries in the DefinitionArrayObject
 * @param definitionArrayObject - DefinitionArrayObject
 * @returns string[] - the key strings
 */
export const getVariableStrings = (definitionArrayObject: DefinitionArrayObject): string[] => {
  const keys: string[] = [];
  definitionArrayObject.forEach((value) => {
    if (Array.isArray(value)) {
      if (value.length === 2) keys.push(...getVariableStrings(value[1]));
      if (value.length === 3) keys.push(value[1].name);
    }
  });

  return keys;
};

/**
 * Method that translates a DefinitionArrayObject into a SemanticlyNestedDataEntry
 * @param definitionArrayObject [DataEntry | [string, DefinitionArrayObject]]
 * @param startIndex
 * @returns
 */
export const nestedDataEntryArrayToObject = (definitionArrayObject: DefinitionArrayObject, startIndex: number): SemanticlyNestedDataEntry => {
  const baseIndex = startIndex * parameterOffset;

  return Object.fromEntries(
    definitionArrayObject.map((value, i) => {
      if (Array.isArray(value)) {
        if (value.length === 2) return [value[0], nestedDataEntryArrayToObject(value[1], baseIndex + i)];
        else return [value[0], nestedDataEntryArrayToObject(value[2](value[1]), baseIndex + i)];
      }
      return [value.name, { ...value, index: baseIndex + i }];
    })
  );
};

/**
 *
 * @param bitString bitstring
 * @param v key, DefinitionArrayObject pair
 * @param orderIndex
 * @returns
 */
const definitionArrayObjectParser = (
  bitString: string,
  v: [string, DefinitionArrayObject],
  orderIndex: number
): [[string, SemanticlyNestedDataEntry], ObjectGenerationOutputStatus, number] => {
  const [key, values] = v;
  const [nestedSemanticObject, objectGenerationStatus, localEndIndex] = parsingDefinitionArrayObject(bitString, values, orderIndex);
  return [[key, nestedSemanticObject], objectGenerationStatus, localEndIndex];
};

const methodParser = (
  bitString: string,
  v: [string, DataEntry, (v: DataEntry) => DefinitionArrayObject],
  orderIndex: number
): [[string, SemanticlyNestedDataEntry], ObjectGenerationOutputStatus, number] => {
  const [key, keyDataDescription, methodGenerator] = v;
  const [keyDataEntry, status, bitWidth] = dataEntryParser(bitString, keyDataDescription, orderIndex);
  const [result, localStatus, localEndIndex] = definitionArrayObjectParser(bitString, [key, methodGenerator(keyDataEntry)], orderIndex);
  return [result, localStatus !== ObjectGenerationOutputStatus.PARSED ? localStatus : status, localEndIndex];
};

const dataEntryParser = (bitString: string, v: DataEntry, baseOrderIndex: number): [DataEntry, ObjectGenerationOutputStatus, number] => {
  const bitWidth = getBitsCount(v);
  const value = dataBitsParser(bitString.slice(0, bitWidth), v);
  return [{ ...value, index: baseOrderIndex }, ObjectGenerationOutputStatus.PARSED, bitWidth];
};

/**
 * Method to parse DataEntry & DefinitionArrayObjects
 * @param bitString bitstring
 * @param data: DefinitionArrayObject
 * @returns [The generated object, the generation status, the index end bit of the bit url (-1 if not used)]
 */
const parsingDefinitionArrayObject = (
  bitString: string,
  definitionArrayObject: DefinitionArrayObject,
  orderIndex: number
): [SemanticlyNestedDataEntry, ObjectGenerationOutputStatus, number] => {
  const baseOrderIndex = orderIndex * parameterOffset;
  let startIndex = 0;
  let objectGenerationStatus = ObjectGenerationOutputStatus.PARSED;

  return [
    Object.fromEntries(
      definitionArrayObject.map((value, i) => {
        if (Array.isArray(value)) {
          if (value.length === 2) {
            const [[key, nestedSemanticObject], status, localEndIndex] = definitionArrayObjectParser(bitString.slice(startIndex), value, baseOrderIndex + i);
            startIndex += localEndIndex;
            objectGenerationStatus !== ObjectGenerationOutputStatus.PARSED ? objectGenerationStatus : status;
            return [key, nestedSemanticObject];
          } else {
            const [[key, nestedSemanticObject], status, localEndIndex] = methodParser(bitString.slice(startIndex), value, baseOrderIndex + i);
            startIndex += localEndIndex;
            objectGenerationStatus !== ObjectGenerationOutputStatus.PARSED ? objectGenerationStatus : status;
            return [key, nestedSemanticObject];
          }
        } else {
          const [dataEntry, status, localEndIndex] = dataEntryParser(bitString.slice(startIndex), value, baseOrderIndex + i);
          startIndex += localEndIndex;
          objectGenerationStatus !== ObjectGenerationOutputStatus.PARSED ? objectGenerationStatus : status;
          return [dataEntry.name, dataEntry];
        }
      })
    ),
    objectGenerationStatus,
    startIndex,
  ];
};

// the main version of an object is always assumed to be the first 8 bits of the object - meaning that there are 256 possible base versions
const readingVersion = (bitstring: string) => dataBitsArrayParser(bitstring, [DataDescriptionFactory.createVersion(8)])[0] as VersionDescriptionWithValueType;

export const parseUrlMethod = (url: string, parserVersions: ParserForVersion[]) => {
  const bitString = parseBase64ToBits(url);
  const version = readingVersion(bitString);
  const versionParser = parserVersions[version.value];

  if (!versionParser) throw new Error(`No parser for version ${version.value}`);
  return parsingDefinitionArrayObject(bitString, versionParser.objectGeneratorParameters as DefinitionArrayObject, 0)[0];
};

// flattening an nested data discription object, can be used for all semantically nested data types (though a bit type hacky)
export const parseDownNestedDataDescription = (nestedDataDescription: SemanticlyNestedDataDescription): DataDescription[] => {
  const dataDescriptions: DataDescription[] = [];
  Object.values(nestedDataDescription).forEach((value) => {
    if (value.hasOwnProperty('type')) dataDescriptions.push(value as DataDescription);
    else dataDescriptions.push(...parseDownNestedDataDescription(value as SemanticlyNestedDataDescription));
  });

  return dataDescriptions.sort();
};

/**
 * Method to get an URL descriptor from a SemanticlyNestedDataEntry
 * @param data: SemanticlyNestedDataEntry
 * @returns base64 string
 */
export const getURLForData = (data: SemanticlyNestedDataEntry) => {
  const dataEntryArray = parseDownNestedDataDescription(data) as DataEntryArray;
  const bitstring = dataArrayStringifier(dataEntryArray);
  return parseBitsToBase64(bitstring);
};

// helper method to read out the bit data and see no weird mistakes were made anywhere
export const getTestStringValues = (data: SemanticlyNestedDataEntry) => {
  const dataEntryArray = parseDownNestedDataDescription(data) as DataEntryArray;
  const bitstring = dataArrayStringifier(dataEntryArray);
  const url = parseBitsToBase64(bitstring);

  const dataValueStrings = dataEntryArray.map((dataEntry) => dataBitsStringifier(dataEntry));
  const singleString = dataValueStrings.join('');

  const base64bitStringArray = singleString.match(/.{1,6}/g)?.map((c) => c.padEnd(6, '0')) ?? [];
  const base64valueArray = url.split('').map((c) => c.padStart(6, '_'));

  const raw = JSON.stringify(parseDownNestedDataDescription(data), undefined, 1);

  return {
    bitsString: dataValueStrings.join('-'),
    base64BitString: base64bitStringArray.join('-'),
    base64SplitString: base64valueArray.join('-'),
    base64String: url,
    raw,
  };
};
