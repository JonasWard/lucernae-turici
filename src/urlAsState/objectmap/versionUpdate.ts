import { DataEntry, DataEntryArray, VersionDescriptionWithValueType } from '../types/dataEntry';
import { SemanticlyNestedDataEntry } from '../types/semanticlyNestedDataEntry';
import { DefinitionArrayObject, ParserForVersion } from '../types/versionParser';
import { nestedDataEntryArrayToObject, parseDownNestedDataDescription } from './versionReading';

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
export const updateDataEntry = (data: SemanticlyNestedDataEntry, newDataEntry: DataEntry, versionObjects: ParserForVersion[]) => {
  const version = data.version as VersionDescriptionWithValueType;
  const versionParser = versionObjects[version.value];
  if (!versionParser) throw new Error(`No parser for version ${version.value}`);

  // if not just replace the value in the object
  const keyDataDescriptionIndex = versionParser.objectGeneratorParameters.findIndex((p) => Array.isArray(p) && p[1].name === newDataEntry.name);
  if (keyDataDescriptionIndex === -1) return { ...updateValuesInDataEntryObject(data, newDataEntry) }; // making sure a new object is created

  // if yes, create a new virgin object but replace the keyDataDescription with the new value
  const dataEntryArray = parseDownNestedDataDescription(data) as DataEntryArray;

  const updatedGeneratorParameters = versionParser.objectGeneratorParameters.map((p) => {
    if (Array.isArray(p)) {
      if (p[1].name === newDataEntry.name) return [p[0], newDataEntry, p[2]];
      else return [p[0], dataEntryArray.find((d) => d.name === p[1].name) as DataEntry, p[2]];
    }
    return p;
  });

  const virginObject = nestedDataEntryArrayToObject(updatedGeneratorParameters as DefinitionArrayObject, 0) as SemanticlyNestedDataEntry;

  dataEntryArray.forEach((value) => value.name !== newDataEntry.name && updateValuesInDataEntryObject(virginObject, value));
  return virginObject;
};
