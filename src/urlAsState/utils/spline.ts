import { parserObjects } from '../../geometryGeneration/versions/parserObjects';
import { DataType } from '../enums/dataTypes';
import { parseDownNestedDataDescription } from '../objectmap/versionReading';
import { getDefaultObject, updateDataEntry } from '../objectmap/versionUpdate';
import { dataEntryCorrecting } from '../parsers/parsers';
import { DataEntry, DataEntryArray } from '../types/dataEntry';
import { SemanticlyNestedDataEntry } from '../types/semanticlyNestedDataEntry';

const interpolateEntryAt = (dataEntry: DataEntry, t: number) => {
  const localT = Math.max(Math.min(1, t), 0);

  switch (dataEntry.type) {
    case DataType.BOOLEAN:
      return { ...dataEntry, value: Boolean(Math.round(localT)) };
    case DataType.VERSION:
      return { ...dataEntry, value: Math.ceil(t * (dataEntry.bits ** 2 - 1)) };
    case DataType.ENUM:
      return { ...dataEntry, value: Math.floor(t * (dataEntry.max + 0.999)) };
    case DataType.INT:
      return { ...dataEntry, value: dataEntry.min + Math.round(t * (dataEntry.max - dataEntry.min)) };
    case DataType.FLOAT:
      const v = dataEntry.min + t * (dataEntry.max - dataEntry.min);
      return dataEntryCorrecting({ ...dataEntry, value: Math.min(dataEntry.max, Math.max(v, dataEntry.min)) });
  }
};

export const globalLerp = (count: number) => {
  const versionNumber: number = 0;
  const firstObject = getDefaultObject(parserObjects, versionNumber);

  const parserObject = parserObjects[versionNumber];

  const dataEntryArray = parseDownNestedDataDescription(firstObject) as DataEntryArray;

  const semanticNested: SemanticlyNestedDataEntry[] = [];

  let tDelta = 1.0 / count;

  const dataEntryArrayWithoutVersion = dataEntryArray.filter((d) => d.type !== DataType.VERSION);
  // sort out key values first

  const keyStrings = parserObject.objectGeneratorParameters.map((d) => (Array.isArray(d) ? d[1].name : 'version'));

  const keyDataEntries: DataEntry[] = [];
  const otherDataEntries: DataEntry[] = [];

  dataEntryArrayWithoutVersion.forEach((d) => {
    if (keyStrings.includes(d.name)) keyDataEntries.push(d);
    else otherDataEntries.push(d);
  });

  const baseDataArray = [...keyDataEntries, ...otherDataEntries];

  for (let i = 0; i < count + 1; i++) {
    const t = i * tDelta;

    const lerpedEntries = baseDataArray.map((d) => interpolateEntryAt(d, t));

    let virginObject = getDefaultObject(parserObjects, 0);

    lerpedEntries.forEach((d) => {
      virginObject = updateDataEntry(virginObject, d, parserObjects);
    });

    semanticNested.push(virginObject);
  }

  return semanticNested;
};
