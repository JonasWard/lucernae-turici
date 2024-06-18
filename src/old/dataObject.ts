// version 0.1

import { DataToURLFactory, DataValues, SemanticBoundsObjects, SemanticValues, VersionMapGenerator, VersionObject } from './dataStringParsing';
import {
  getVersion0_1VersionObject,
  version0_1BaseData,
  version0_1DeconstructObject,
  version0_1ConstructObject,
  version0_1Update,
  version0_1ConstructDomainObject,
} from './versions/version0.1';

export const DataDefinition: VersionMapGenerator = {
  0: {
    generatorMethod: getVersion0_1VersionObject,
    baseDefinitions: version0_1BaseData,
    constructObject: version0_1ConstructObject as unknown as (dataValues: DataValues, versionObject: VersionObject) => SemanticValues,
    getBoundsObject: version0_1ConstructDomainObject as unknown as (dataObject: SemanticValues, versionObject: VersionObject) => SemanticBoundsObjects,
    deconstructObject: version0_1DeconstructObject as unknown as (dataObject: SemanticValues, versionObject: VersionObject) => DataValues,
    getVersionObjectFromDataObject: version0_1Update as unknown as (vs: SemanticValues) => VersionObject,
  },
};

export const CreateDefaultURL = (version: 0): string => {
  const versionObject = DataDefinition[version].generatorMethod();
  return DataToURLFactory.createUrl(versionObject.defaultValues, versionObject.dataPattern);
};

const createURLFromValues = (versionObject: VersionObject, dataValues: DataValues): string => DataToURLFactory.createUrl(dataValues, versionObject.dataPattern);

export const getVersionObjectFromDataObject = (dataObject: SemanticValues): VersionObject =>
  DataDefinition[dataObject.version].getVersionObjectFromDataObject(dataObject);

export const getBoundsObjectFromDataObject = (dataObject: SemanticValues, versionObject: VersionObject): SemanticBoundsObjects =>
  DataDefinition[dataObject.version].getBoundsObject(dataObject, versionObject);

export const CreateURL = (dataObject: SemanticValues) => {
  const versionDataParser = DataDefinition[dataObject.version as number];
  const updatedVersion = versionDataParser.getVersionObjectFromDataObject(dataObject);

  return DataToURLFactory.createUrl(versionDataParser.deconstructObject(dataObject, updatedVersion), updatedVersion.dataPattern);
};

export const ParseURLData = (url: string): [VersionObject, SemanticValues] => {
  // getting the version number
  const versionNumber = DataToURLFactory.deconstructUrl(url, [DataToURLFactory.createVersion()])[0] as number;
  const basicDataDefinition = DataDefinition[versionNumber].baseDefinitions;
  const settingDataValues = DataToURLFactory.deconstructUrl(url, basicDataDefinition).slice(1);
  const versionObject = DataDefinition[versionNumber].generatorMethod(...settingDataValues);
  const parsedValues = DataToURLFactory.deconstructUrl(url, versionObject.dataPattern);
  const getGenerationObject = DataDefinition[versionNumber].constructObject(parsedValues, versionObject);
  return [versionObject, getGenerationObject];
};
