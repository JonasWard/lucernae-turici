import { dataEntryCorrecting } from '../parsers/parsers';
import { DataEntry, DataEntryArray, VersionDescriptionWithValueType } from '../types/dataEntry';
import { SemanticlyNestedDataEntry } from '../types/semanticlyNestedDataEntry';
import { DefinitionArrayObject, DefinitionNestedArray, DefinitionNestedGenerationObject, ParserForVersion } from '../types/versionParser';
import { updateValue } from '../update/updateValues';
import { nestedDataEntryArrayToObject, parseDownNestedDataDescription } from './versionReading';

/**
 * Method that handles a single dataEntry object in an DefinitionArrayObject
 * @param dataEntry - DataEntry
 * @param dataEntryArray - DataEntryArray
 */
const dataEntryUpdating = (dataEntry: DataEntry, dataEntryArray: DataEntryArray): [string, DataEntry] => {
  const existingDataEntry = dataEntryArray.find((d) => d.name === dataEntry.name);
  if (!existingDataEntry) return [dataEntry.name, dataEntry];
  return [dataEntry.name, updateValue(dataEntry, existingDataEntry)];
};

/**
 * Method that handles the updating of a nested DefinitionArrayObject
 * @param definitionNestedArrray - DefinitionNestedArray
 * @param dataEntryArray - DataEntryArray
 */
const nestedDataEntryArrayUpdating = (definitionNestedArrray: DefinitionNestedArray, dataEntryArray: DataEntryArray): [string, SemanticlyNestedDataEntry] => {
  const [keyString, nestedDefinitionArray] = definitionNestedArrray;
  return [keyString, updateDataEntryObject(nestedDefinitionArray, dataEntryArray)];
};

/**
 * Method that handles the updating of of a DefinitionGenerationObject
 * @param definitionArrayObject - DefinitionNestedGenerationObject
 * @param dataEntryArray - DataEntryArray
 */
const generationObjectUpdating = (
  definitionArrayObject: DefinitionNestedGenerationObject,
  dataEntryArray: DataEntryArray
): [string, SemanticlyNestedDataEntry] => {
  const [keyString, keyDataEntry, methodGenerator] = definitionArrayObject;
  const foundKeyDataEntry = dataEntryArray.find((d) => d.name === keyDataEntry.name);
  const newKeyData = foundKeyDataEntry ? updateValue(keyDataEntry, foundKeyDataEntry) : keyDataEntry;
  return [keyString, updateDataEntryObject(methodGenerator(newKeyData), dataEntryArray)];
};

/**
 * Method to parse a definitionArrayObject according to a given dataArray
 * @param definitionArrayObject
 * @param dataArray
 * @returns - new SemanticlyNestedDataEntry
 */
export const updateDataEntryObject = (definitionArrayObject: DefinitionArrayObject, dataArray: DataEntryArray): SemanticlyNestedDataEntry => {
  const newNestedObject: SemanticlyNestedDataEntry = {};
  definitionArrayObject.forEach((value) => {
    if (Array.isArray(value)) {
      if (value.length === 2) {
        const [keyString, nestedDataEntry] = nestedDataEntryArrayUpdating(value, dataArray);
        newNestedObject[keyString] = nestedDataEntry;
      } else {
        const [keyString, nestedDataEntry] = generationObjectUpdating(value, dataArray);
        newNestedObject[keyString] = nestedDataEntry;
      }
    } else {
      const [key, dataEntry] = dataEntryUpdating(value, dataArray);
      newNestedObject[key] = dataEntry;
    }
  });
  return newNestedObject;
};

/**
 * Method to update the values in a SemanticlyNestedDataEntry object in place
 * @param data SemanticlyNestedDataEntry, gets mutated in place
 * @param newDataEntry DataEntry to update
 * @returns same data object
 */
const updateValuesInDataEntryObject = (data: SemanticlyNestedDataEntry, newDataEntry: DataEntry) => {
  Object.values(data).forEach((value) => {
    if (value.hasOwnProperty('type')) {
      if (value.name === newDataEntry.name) value.value = newDataEntry.value;
    } else updateValuesInDataEntryObject(value as SemanticlyNestedDataEntry, newDataEntry);
  });

  return data;
};

export const getDefaultObject = (versionObjects: ParserForVersion[], versionindex: number) => {
  const versionParser = versionObjects[versionindex];
  if (!versionParser) throw new Error(`No parser for version ${versionindex} index`);

  return nestedDataEntryArrayToObject(versionParser.objectGeneratorParameters as DefinitionArrayObject, 0) as SemanticlyNestedDataEntry;
};

/**
 * Method that handles the updating of a single value in a SemanticlyNestedDataEntry object
 * @param data SemanticlyNestedDataEntry
 * @param newDataEntry updated DataEntry
 * @param versionObjects version object
 * @returns a newly created object in case of a key data description, otherwise the same object with just the new Data Entry value updated
 */
export const updateDataEntry = (data: SemanticlyNestedDataEntry, newDataEntry: DataEntry, versionObjects: ParserForVersion[]): SemanticlyNestedDataEntry => {
  const version = data.version as VersionDescriptionWithValueType;
  const versionParser = versionObjects[version.value];
  if (!versionParser) throw new Error(`No parser for version ${version.value}`);

  const correctedDataEntry = dataEntryCorrecting(newDataEntry);

  // create a new virgin object but replace the keyDataDescription with the new value
  const dataEntryArray = parseDownNestedDataDescription(data) as DataEntryArray;
  // adding the newly entered dataEntry to the start of the array, will always be found first
  const virginDataEntryArray = [correctedDataEntry, ...dataEntryArray];

  return updateDataEntryObject(versionParser.objectGeneratorParameters, virginDataEntryArray);
};
