import { parserObjects } from '../../geometryGeneration/versions/parserObjects';
import { DataType } from '../enums/dataTypes';
import { getVariableStrings, parseDownNestedDataDescription } from '../objectmap/versionReading';
import { getDefaultObject, updateDataEntry } from '../objectmap/versionUpdate';
import { dataEntryCorrecting } from '../parsers/parsers';
import { DataEntry, DataEntryArray } from '../types/dataEntry';
import { SemanticlyNestedDataEntry } from '../types/semanticlyNestedDataEntry';

/**
 * helper method to interpolate a data entry at a given t parameter
 * @param dataEntry - DataEntry to interpolate
 * @param t - number between 0 and 1
 * @returns updated data entry
 */
const interpolateEntryAt = (dataEntry: DataEntry, t: number) => {
  const localT = Math.max(Math.min(1, t), 0);
  const cosT = Math.cos(localT * 2 * Math.PI) * 0.5 + 0.5;

  switch (dataEntry.type) {
    case DataType.BOOLEAN:
      return { ...dataEntry, value: Boolean(Math.round(localT)) };
    case DataType.VERSION:
      return { ...dataEntry, value: Math.floor(localT * (dataEntry.bits ** 2 - 0.001)) };
    case DataType.ENUM:
      return { ...dataEntry, value: Math.floor(localT * (dataEntry.max + 0.999)) };
    case DataType.INT:
      return { ...dataEntry, value: dataEntry.min + Math.floor(cosT * (dataEntry.max - dataEntry.min + 0.999)) };
    case DataType.FLOAT:
      const v = dataEntry.min + cosT * (dataEntry.max - dataEntry.min);
      return dataEntryCorrecting({ ...dataEntry, value: Math.min(dataEntry.max, Math.max(v, dataEntry.min)) });
  }
};

/**
 * Method to lerp a data entry at a t parameter
 * @param t - number between 0 and 1
 * @param baseDataArray - key data entry array
 * @param keyStrings - key strings that should be considered
 * @param versionNumber - version number
 * @returns - SemanticlyNestedDataEntry
 */
export const lerpData = (t: number, baseDataArray: DataEntryArray, keyStrings: string[], versionNumber: number): SemanticlyNestedDataEntry => {
  const lerpedEntries = baseDataArray.map((d) => interpolateEntryAt(d, t));

  let virginObject = getDefaultObject(parserObjects, versionNumber);

  lerpedEntries.forEach((d) => (virginObject = updateDataEntry(virginObject, d, parserObjects)));

  const parsedDownArrayObject: DataEntryArray = [];

  (parseDownNestedDataDescription(virginObject) as DataEntryArray).forEach(
    (d) => !keyStrings.includes(d.name) && d.type !== DataType.VERSION && parsedDownArrayObject.push(interpolateEntryAt(d, t))
  );

  parsedDownArrayObject.forEach((d) => (virginObject = updateDataEntry(virginObject, d, parserObjects)));

  return virginObject;
};

/**
 * Method to get the data to lerp a given version number
 * @param versionNumber - number of the version
 * @returns { baseDataArray: DataEntryArray; keyStrings: string[] } - version data
 */
export const getVersionDataForLerping = (versionNumber: number): { baseDataArray: DataEntryArray; keyStrings: string[] } => {
  const firstObject = getDefaultObject(parserObjects, versionNumber);
  const parserObject = parserObjects[versionNumber];

  const dataEntryArray = parseDownNestedDataDescription(firstObject) as DataEntryArray;
  const dataEntryArrayWithoutVersion = dataEntryArray.filter((d) => d.type !== DataType.VERSION);

  const keyStrings = getVariableStrings(parserObject.objectGeneratorParameters);
  const keyDataEntries: DataEntry[] = [];

  dataEntryArrayWithoutVersion.forEach((d) => keyStrings.includes(d.name) && keyDataEntries.push(d));
  const baseDataArray = [...keyDataEntries];

  return { baseDataArray, keyStrings };
};

/**
 * Method to render a global lerp object
 * @param count - amount of steps to lerp for visualization
 * @returns SemanticlyNestedDataEntry[]
 */
export const globalLerp = (count: number) => {
  const versionNumber: number = 1;
  const { baseDataArray, keyStrings } = getVersionDataForLerping(versionNumber);

  const semanticNested: SemanticlyNestedDataEntry[] = [];
  const tDelta = 1 / count;

  for (let i = 0; i < count + 1; i++) semanticNested.push(lerpData(i * tDelta, baseDataArray, keyStrings, versionNumber));

  return semanticNested;
};
