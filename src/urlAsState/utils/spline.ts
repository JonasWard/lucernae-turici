import { parserObjects } from '../../geometryGeneration/versions/parserObjects';
import { DataType } from '../enums/dataTypes';
import { DataEntryFactory } from '../factory/factory';
import { parseDownNestedDataDescription } from '../objectmap/versionReading';
import { getDefaultObject, updateDataEntry } from '../objectmap/versionUpdate';
import { dataEntryCorrecting } from '../parsers/parsers';
import { DataEntry, DataEntryArray } from '../types/dataEntry';
import { SemanticlyNestedDataEntry } from '../types/semanticlyNestedDataEntry';
import { getRelativeValue } from './relativeValue';

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

  dataEntryArrayWithoutVersion.forEach((d) => {
    if (keyStrings.includes(d.name)) keyDataEntries.push(d);
  });

  const baseDataArray = [...keyDataEntries];

  DataEntryFactory.createFloat(0.5, 0, 1, 2);
  const floatValue = DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2);
  const vs = [];

  for (let i = 0; i < count + 1; i++) {
    const t = i * tDelta;

    const lerpedEntries = baseDataArray.map((d) => interpolateEntryAt(d, t));

    let virginObject = getDefaultObject(parserObjects, 0);

    lerpedEntries.forEach((d) => {
      virginObject = updateDataEntry(virginObject, d, parserObjects);
    });

    const parsedDownArrayObject: DataEntryArray = [];

    (parseDownNestedDataDescription(virginObject) as DataEntryArray).forEach((d) => {
      if (!keyStrings.includes(d.name)) parsedDownArrayObject.push(interpolateEntryAt(d, t));
    });

    parsedDownArrayObject.forEach((d) => {
      virginObject = updateDataEntry(virginObject, d, parserObjects);
    });

    vs.push(interpolateEntryAt(floatValue, t));

    semanticNested.push(virginObject);
  }

  return semanticNested;
};
