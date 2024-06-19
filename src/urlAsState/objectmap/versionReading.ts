import { DataDescriptionFactory } from '../factory/factory';
import { dataArrayStringifier, dataBitsStringifier, stringToDataArray } from '../parsers/parsers';
import { DataDescription, DataEntry, DataEntryArray, VersionDescriptionWithValueType } from '../types/dataEntry';
import { SemanticlyNestedDataDescription, SemanticlyNestedDataEntry } from '../types/semanticlyNestedDataEntry';
import { ParserForVersion } from '../types/versionParser';

// the main version of an object is always assumed to be the first 8 bits of the object - meaning that there are 256 possible base versions
const readingVersion = (url: string) => stringToDataArray(url, [DataDescriptionFactory.createVersion(8)])[0] as VersionDescriptionWithValueType;

// flattening an nested data discription object, can be used for all semantically nested data types (though a bit type hacky)
export const parseDownNestedDataDescription = (nestedDataDescription: SemanticlyNestedDataDescription): DataDescription[] => {
  const dataDescriptions: DataDescription[] = [];
  Object.values(nestedDataDescription).forEach((value) => {
    if (value.hasOwnProperty('type')) dataDescriptions.push(value as DataDescription);
    else dataDescriptions.push(...parseDownNestedDataDescription(value as SemanticlyNestedDataDescription));
  });

  return dataDescriptions.sort((a, b) => a.index - b.index);
};

const addValuesToNestedDataArray = (nestedDataDescription: SemanticlyNestedDataDescription, values: DataEntryArray): SemanticlyNestedDataEntry =>
  Object.fromEntries(
    Object.entries(nestedDataDescription).map(([key, value]) =>
      value.hasOwnProperty('type')
        ? [key, { ...value, value: (values.find((v) => v.index === value.index) as DataEntry).value } as DataEntry]
        : [key, addValuesToNestedDataArray(value as SemanticlyNestedDataDescription, values)]
    )
  );

// method for reading in an url based on a given set of version objects
export const readingUrlAsDataObject = (url: string, versionObjects: ParserForVersion[]) => {
  const version = readingVersion(url);

  const versionParser = versionObjects[version.value];

  if (!versionParser) throw new Error(`No parser for version ${version.value}`);

  const basicData = versionParser.objectGenerator(version.value);
  const parsedDownAllParameterObject = parseDownNestedDataDescription(basicData) as DataEntryArray;
  const keyDataDescriptions = stringToDataArray(url, parsedDownAllParameterObject);
  const dataDescriptionObject = versionParser.objectGenerator(...keyDataDescriptions.map((value) => value.value));
  const parsedDownDataEntryObject = parseDownNestedDataDescription(dataDescriptionObject);
  const allValues = stringToDataArray(url, parsedDownDataEntryObject);

  return addValuesToNestedDataArray(dataDescriptionObject, allValues);
};

// parsing a nested data object to an url, no checks are taking place at all
const parsingSemanticlyNestedDataEntryToUrl = (data: SemanticlyNestedDataEntry): string => {
  const dataEntryArray = parseDownNestedDataDescription(data) as DataEntryArray;
  return dataArrayStringifier(dataEntryArray);
};

// public method for parsing a nested data object to an url
export const dataObjectAsUrl = (data: SemanticlyNestedDataEntry, versionObjects: ParserForVersion[]): string => {
  const version = data.version as VersionDescriptionWithValueType;
  const versionParser = versionObjects[version.value];

  if (!versionParser) throw new Error(`No parser for version ${version.value}`);

  const dataEntryArray = parseDownNestedDataDescription(data) as DataEntryArray;
  const defaultDataEntryObject = versionParser.objectGenerator(version.value);
  const parsedDownAllParameterObject = parseDownNestedDataDescription(defaultDataEntryObject);
  const semanticDataEntryObjects = versionParser.objectGenerator(
    ...parsedDownAllParameterObject.map((value) => dataEntryArray.find((v) => v.name === value.name)).map((value) => value!.value)
  );
  const allObjectsParsedDown = parseDownNestedDataDescription(semanticDataEntryObjects);

  const mappedData = allObjectsParsedDown.map((value) => {
    const result = dataEntryArray.find((v) => v.index === value.index);
    if (!result) {
      console.error(`Data for index ${value.index} with identifier '${value.name}' is not found in the give data`);
      return value;
    }
    return result;
  }) as DataEntryArray;

  return dataArrayStringifier(mappedData);
};

// get default object for a given version
export const getDefaultObject = (versionParser: ParserForVersion, versionNumber: number): SemanticlyNestedDataEntry => {
  const keyDataDescriptions = versionParser.objectGenerator(versionNumber);
  const parsedDownKeyDataDescriptions = parseDownNestedDataDescription(keyDataDescriptions) as DataEntryArray;
  return versionParser.objectGenerator(...parsedDownKeyDataDescriptions.map((value) => value.value));
};

// helper method to read out the bit data and see no weird mistakes were made anywhere
export const getTestStringValues = (data: SemanticlyNestedDataEntry) => {
  const dataEntryArray = parseDownNestedDataDescription(data) as DataEntryArray;
  const url = dataArrayStringifier(dataEntryArray);

  const dataValueStrings = dataEntryArray.map((dataEntry) => dataBitsStringifier(dataEntry));
  const singleString = dataValueStrings.join('');

  const base64bitStringArray = singleString.match(/.{1,6}/g)?.map((c) => c.padEnd(6, '0')) ?? [];
  const base64valueArray = url.split('').map((c) => c.padStart(6, '_'));

  const raw = JSON.stringify(getValueObjectFrom(data));

  return {
    bitsString: dataValueStrings.join('-'),
    base64BitString: base64bitStringArray.join('-'),
    base64SplitString: base64valueArray.join('-'),
    base64String: url,
    raw,
  };
};

type NestedValue = { [key: string]: number | boolean | NestedValue };

// extract value map
export const getValueObjectFrom = (nestedDataEntry: SemanticlyNestedDataEntry, attributeMapper?: { [key: string]: string }): NestedValue =>
  Object.fromEntries(
    Object.entries(nestedDataEntry).map(([key, value]) => [
      attributeMapper?.hasOwnProperty(key) ? attributeMapper[key] : key,
      value.hasOwnProperty('type') ? (value as DataEntry).value : getValueObjectFrom(value as SemanticlyNestedDataEntry, attributeMapper),
    ])
  );
