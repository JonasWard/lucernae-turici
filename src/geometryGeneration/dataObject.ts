// version 0.1

import { DataToURLFactory, DataValues, VersionMapGenerator, VersionObject } from './dataStringParsing';
import { getVersion0_1DataMap, version0_1BaseData, version0_1DeconstructObject, version0_1ConstructObject } from './versions/version0.1';

const dataDefinition: VersionMapGenerator = {
  0: {
    generatorMethod: getVersion0_1DataMap,
    baseDefinitions: version0_1BaseData,
    constructObject: version0_1ConstructObject,
    deconstructObject: version0_1DeconstructObject as (dataObject: Object, versionObject: VersionObject) => DataValues,
  },
};

export const CreateDefaultURL = (version: 0): string => {
  const versionObject = dataDefinition[version].generatorMethod();
  return DataToURLFactory.createUrl(versionObject.defaultValues, versionObject.dataPattern);
};

export const CreateURL = (versionObject: VersionObject, dataValues: DataValues): string => DataToURLFactory.createUrl(dataValues, versionObject.dataPattern);

export const ParseURLData = (url: string) => {
  // getting the version number
  const versionNumber = DataToURLFactory.deconstructUrl(url, [DataToURLFactory.createVersion()])[0] as number;
  const basicDataDefinition = dataDefinition[versionNumber].baseDefinitions;
  const settingDataValues = DataToURLFactory.deconstructUrl(url, basicDataDefinition).slice(1);
  const versionObject = dataDefinition[versionNumber].generatorMethod(...settingDataValues);
  const parsedValues = DataToURLFactory.deconstructUrl(url, versionObject.dataPattern);
  const getGenerationObject = dataDefinition[versionNumber].constructObject(parsedValues, versionObject);
  return [versionObject, DataToURLFactory.deconstructUrl(url, versionObject.dataPattern), getGenerationObject];
};
