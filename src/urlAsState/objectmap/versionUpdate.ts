import { DataEntry, DataEntryArray, VersionDescriptionWithValueType } from '../types/dataEntry';
import { SemanticlyNestedDataEntry } from '../types/semanticlyNestedDataEntry';
import { ParserForVersion } from '../types/versionParser';
import { parseDownNestedDataDescription } from './versionReading';

const updateValuesInDataEntryObject = (dataEntry: SemanticlyNestedDataEntry, newDataEntry: DataEntry) => {
  Object.values(dataEntry).forEach((value) => {
    if (value.hasOwnProperty('type')) {
      if (value.name === newDataEntry.name) {
        value.value = newDataEntry.value;
      }
    } else {
      updateValuesInDataEntryObject(value as SemanticlyNestedDataEntry, newDataEntry);
    }
  });
};

export const updateDataEntry = (data: SemanticlyNestedDataEntry, newDataEntry: DataEntry, versionObjects: ParserForVersion[]) => {
  const version = data.version as VersionDescriptionWithValueType;
  const versionParser = versionObjects[version.value];

  if (!versionParser) throw new Error(`No parser for version ${version.value}`);

  updateValuesInDataEntryObject(data, newDataEntry);
  const dataEntryArray = parseDownNestedDataDescription(data) as DataEntryArray;

  const keyDataDescriptions = versionParser.objectGenerator(version.value);
  const parsedDownKeyDataDescriptions = parseDownNestedDataDescription(keyDataDescriptions).map((d) =>
    dataEntryArray.find((v) => v.name === d.name)
  ) as DataEntryArray;
  const baseObjectDataEntryObject = versionParser.objectGenerator(...parsedDownKeyDataDescriptions.map((value) => value.value));

  dataEntryArray.forEach((value) => updateValuesInDataEntryObject(baseObjectDataEntryObject, value));

  return baseObjectDataEntryObject;
};
