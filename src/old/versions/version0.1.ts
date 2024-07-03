import { ExtrusionProfileType } from '../../geometryGeneration/extrusionProfiles/types/extrusionProfileType';
import { FloorplanType, FootprintGeometryTypes } from '../../geometryGeneration/footprintgeometrytypes';
import { ExtrusionCategory } from '../../geometryGeneration/extrusionProfiles/types/extrusionCategory';
import { HeightGenerator, ProcessingMethodType, ProcessingMethods } from '../../geometryGeneration/geometry';
import { DataDefinition } from '../dataObject';
import { SemanticValueString } from '../dataSemanticsEnums';
import {
  DataEntry,
  DataValues,
  DataToURLFactory,
  NestedBoundsObject,
  VersionObject,
  SemanticBoundsObjects,
  SemanticValues,
  DataValue,
} from '../dataStringParsing';

export interface Version0_1Object {
  version: number;
  extrusionTypeParameters: ExtrusionProfileType;
  floorTypeParameters: FloorplanType;
  heightMethodParameters: HeightGenerator;
}

// 0: Version
// 1: ExtrusionType - int (0 - 2)
// 2: FloorplanType - int (0 - 10)
// 3: ExtrusionType parameters - float[] (0 - 4, 1 - 3, 2 - 3, 3)

const extrusionMap = (extrusionType: ExtrusionProfileType, offset: number): [DataEntry[], { [key: string]: number }, DataValues] => {
  switch (extrusionType) {
    case ExtrusionProfileType.Square:
      return [
        [DataToURLFactory.createFloat(0, 1, 2), DataToURLFactory.createFloat(0, 1, 2), DataToURLFactory.createFloat(0, 1, 2)],
        {
          type: 1,
          insetSides: offset,
          insetTop: offset + 1,
          insetBottom: offset + 2,
        },
        [0.1, 0.1, 0.1],
      ];
    case ExtrusionProfileType.Arc:
    case ExtrusionProfileType.Ellipse:
      return [
        [
          DataToURLFactory.createFloat(0, 1, 2),
          DataToURLFactory.createFloat(0, 1, 2),
          DataToURLFactory.createFloat(0, 1, 2),
          DataToURLFactory.createFloat(0, 1, 2),
        ],
        {
          type: 1,
          insetSides: offset,
          insetTop: offset + 1,
          insetBottom: offset + 2,
          radiusTop: offset + 3,
        },
        [0.1, 0.1, 0.1, 35],
      ];
    default:
      console.log(extrusionType);
      throw new Error('Extrusion type not found');
  }
};

const floorMap = (floorType: FootprintGeometryTypes, offset: number): [DataEntry[], { [key: string]: number }, DataValues] => {
  switch (floorType) {
    case FootprintGeometryTypes.Square:
      return [
        [DataToURLFactory.createInt(200, 600)],
        {
          type: 2,
          size: offset,
        },
        [400],
      ];
    case FootprintGeometryTypes.SquareGrid:
      return [
        [DataToURLFactory.createInt(200, 600), DataToURLFactory.createInt(1, 16), DataToURLFactory.createInt(1, 16)],
        {
          type: 2,
          size: offset,
          xCount: offset + 1,
          yCount: offset + 2,
        },
        [400, 4, 4],
      ];
    case FootprintGeometryTypes.TriangleGrid:
      return [
        [DataToURLFactory.createInt(200, 600), DataToURLFactory.createInt(1, 16), DataToURLFactory.createInt(1, 16)],
        {
          type: 2,
          size: offset,
          xCount: offset + 1,
          yCount: offset + 2,
        },
        [400, 4, 4],
      ];
    case FootprintGeometryTypes.HexGrid:
      return [
        [DataToURLFactory.createInt(200, 600), DataToURLFactory.createInt(1, 16), DataToURLFactory.createInt(1, 16)],
        {
          type: 2,
          size: offset,
          xCount: offset + 1,
          yCount: offset + 2,
        },
        [400, 4, 4],
      ];
    case FootprintGeometryTypes.Cylinder:
      return [
        [
          DataToURLFactory.createInt(10, 100),
          DataToURLFactory.createInt(100, 350),
          DataToURLFactory.createInt(0, 600),
          DataToURLFactory.createInt(0, 350),
          DataToURLFactory.createInt(10, 100),
          DataToURLFactory.createInt(3, 34),
        ],
        {
          type: 2,
          bufferInside: offset,
          radius0: offset + 1,
          radius1: offset + 2,
          radius2: offset + 3,
          bufferOutside: offset + 4,
          segments: offset + 5,
        },
        [50, 200, 300, 150, 50, 20],
      ];
    case FootprintGeometryTypes.MalculmiusOne:
      return [
        [
          DataToURLFactory.createInt(400, 800),
          DataToURLFactory.createInt(300, 800),
          DataToURLFactory.createInt(3, 34),
          DataToURLFactory.createFloat(0, 1, 3),
          DataToURLFactory.createInt(-150, 150),
          DataToURLFactory.createInt(-150, 150),
          DataToURLFactory.createInt(50, 350),
        ],
        {
          type: 2,
          size: offset,
          circleRadius: offset + 1,
          circleDivisions: offset + 2,
          angleSplit: offset + 3,
          offsetA: offset + 4,
          offsetB: offset + 5,
          innerRadius: offset + 6,
        },
        [600, 400, 10, 0.5, 0, 0, 200],
      ];
  }
};

const heightMap = (heightProcessingMethod: ProcessingMethodType, offset: number): [DataEntry[], { [key: string]: number }, DataValues] => {
  switch (heightProcessingMethod) {
    case ProcessingMethodType.IncrementalMethod:
      return [
        [DataToURLFactory.createBoolean(), DataToURLFactory.createFloat(-3, 3, 1), DataToURLFactory.createInt(150, 350), DataToURLFactory.createInt(1, 10)],
        {
          type: 3,
          total: offset,
          angle: offset + 1,
          baseHeight: offset + 2,
          storyCount: offset + 3,
        },
        [false, 0, 200, 2],
      ];
    case ProcessingMethodType.Sin:
      return [
        [
          DataToURLFactory.createFloat(-3, 3, 2),
          DataToURLFactory.createFloat(-3, 3, 2),
          DataToURLFactory.createFloat(-3, 3, 1),
          DataToURLFactory.createFloat(0, 10, 2),
          DataToURLFactory.createInt(150, 350),
          DataToURLFactory.createInt(1, 10),
        ],
        {
          type: 3,
          max: offset,
          min: offset + 1,
          period: offset + 2,
          phaseShift: offset + 3,
          baseHeight: offset + 4,
          storyCount: offset + 5,
        },
        [1.5, 0.5, 2, 3, 200, 2],
      ];
    case ProcessingMethodType.None:
      return [
        [DataToURLFactory.createInt(150, 350), DataToURLFactory.createInt(1, 10)],
        {
          type: 3,
          baseHeight: offset,
          storyCount: offset + 1,
        },
        [false, 0, 200, 2],
      ];
  }
};

export const version0_1BaseData: DataEntry[] = [
  DataToURLFactory.createVersion(),
  DataToURLFactory.createInt(0, 2),
  DataToURLFactory.createInt(0, 10),
  DataToURLFactory.createInt(1, 2),
];

const parseMethod = (dataValues: DataValues, methodObject: { [key: string]: any }): ProcessingMethods => {
  switch (dataValues[methodObject.heightProcessingMethod]) {
    case ProcessingMethodType.IncrementalMethod:
      return {
        type: ProcessingMethodType.IncrementalMethod,
        total: dataValues[methodObject.total] as boolean,
        angle: dataValues[methodObject.angle] as number,
      };
    case ProcessingMethodType.Sin:
      return {
        type: ProcessingMethodType.Sin,
        max: dataValues[methodObject.max] as number,
        min: dataValues[methodObject.min] as number,
        period: dataValues[methodObject.period] as number,
        phaseShift: dataValues[methodObject.phaseShift] as number,
      };
    case ProcessingMethodType.None:
    default:
      return {
        type: ProcessingMethodType.None,
      };
  }
};

const parseMethodBounds = (methodObject: { [key: string]: any }, dataEntries: DataEntry[], methodType: ProcessingMethodType): NestedBoundsObject => {
  switch (methodType) {
    case ProcessingMethodType.IncrementalMethod:
      return {
        type: dataEntries[methodObject.heightProcessingMethod],
        total: dataEntries[methodObject.total],
        angle: dataEntries[methodObject.angle],
      };
    case ProcessingMethodType.Sin:
      return {
        type: dataEntries[methodObject.heightProcessingMethod],
        max: dataEntries[methodObject.max],
        min: dataEntries[methodObject.min],
        period: dataEntries[methodObject.period],
        phaseShift: dataEntries[methodObject.phaseShift],
      };
    case ProcessingMethodType.None:
    default:
      return {
        type: dataEntries[methodObject.heightProcessingMethod],
      };
  }
};

const parseHeightMethod = (dataValues: DataValues, heightObject: { [key: string]: any }): HeightGenerator => {
  return {
    baseHeight: dataValues[heightObject.baseHeight] as number,
    storyCount: dataValues[heightObject.storyCount] as number,
    method: parseMethod(dataValues, heightObject),
  };
};

const parseHeightMethodBounds = (dataObject: Version0_1Object, heightObject: { [key: string]: any }, dataEntries: DataEntry[]): NestedBoundsObject => {
  return {
    baseHeight: dataEntries[heightObject.baseHeight],
    storyCount: dataEntries[heightObject.storyCount],
    method: parseMethodBounds(dataEntries, dataEntries, dataObject.heightMethodParameters.method.type),
  };
};

export const version0_1Update = (dataObject: Version0_1Object): VersionObject =>
  getVersion0_1VersionObject(dataObject.extrusionTypeParameters.type, dataObject.floorTypeParameters.type, dataObject.heightMethodParameters.method.type);

export const version0_1ConstructDomainObject = (dataObject: Version0_1Object, versionObject: VersionObject): SemanticBoundsObjects => {
  console.log(dataObject);
  console.log(dataObject.extrusionTypeParameters);
  console.log(extrusionMap(dataObject.extrusionTypeParameters.type as ExtrusionProfileType, 0));

  return {
    [SemanticValueString.version]: versionObject.dataPattern[0],
    [SemanticValueString.extrusionTypeParameters]: Object.fromEntries(
      Object.entries(extrusionMap(dataObject.extrusionTypeParameters.type as ExtrusionProfileType, 0)[1]).map(([k, i]) => [k, versionObject.dataPattern[i]])
    ),
    [SemanticValueString.floorTypeParameters]: Object.fromEntries(
      Object.entries(floorMap(dataObject.floorTypeParameters.type as FootprintGeometryTypes, 0)[1]).map(([k, i]) => [k, versionObject.dataPattern[i]])
    ),
    [SemanticValueString.heightMethodParameters]: parseHeightMethodBounds(dataObject, versionObject.namesMap, versionObject.dataPattern),
  };
};

export const version0_1ConstructObject = (values: DataValues, versionObject: VersionObject): Version0_1Object => {
  return {
    version: values[versionObject.namesMap.version as any] as number,
    extrusionTypeParameters: Object.fromEntries(
      Object.entries(extrusionMap(values[versionObject.namesMap.extrusionType] as ExtrusionProfileType, 0)[1]).map(([k]) => [
        k,
        values[versionObject.namesMap[k]],
      ])
    ) as ExtrusionProfileType,
    floorTypeParameters: Object.fromEntries(
      Object.entries(floorMap(values[versionObject.namesMap.floorType] as FootprintGeometryTypes, 0)[1]).map(([k]) => [k, values[versionObject.namesMap[k]]])
    ) as unknown as FloorplanType,
    heightMethodParameters: parseHeightMethod(values, versionObject.namesMap),
  };
};

export const version0_1DeconstructObject = (dataObject: Version0_1Object): DataValues => {
  const updatedVersionObject = DataDefinition[dataObject.version].getVersionObjectFromDataObject(dataObject as unknown as SemanticValues);

  // mapping into the flat named map
  const flatObject: { [k: string]: DataValue } = {
    version: dataObject.version,
  };

  // writing in the flat object into a named array
  Object.entries(dataObject.extrusionTypeParameters).forEach(([k, v]) => {
    if (k === 'type') flatObject.extrusionType = v;
    else flatObject[k] = v;
  });
  Object.entries(dataObject.floorTypeParameters).forEach(([k, v]) => {
    if (k === 'type') flatObject.floorType = v;
    else flatObject[k] = v;
  });
  Object.entries(dataObject.heightMethodParameters).forEach(([k, v]) => {
    if (k === 'method') {
      Object.entries(v as ProcessingMethodType).forEach(([k, v]) => {
        if (k === 'type') flatObject.heightProcessingMethod = v;
        else flatObject[k] = v;
      });
    } else flatObject[k] = v as number;
  });

  const sortedKeys = Object.entries(updatedVersionObject.namesMap)
    .sort(([, a], [, b]) => a - b)
    .map(([k]) => k);

  return sortedKeys.map((k) => flatObject[k]);
};

export const getVersion0_1VersionObject = (
  extrusionType: ExtrusionProfileType = ExtrusionProfileType.Arc,
  floorType: FootprintGeometryTypes = FootprintGeometryTypes.Cylinder,
  heightMethod: ProcessingMethodType = ProcessingMethodType.IncrementalMethod
): VersionObject => {
  const [extrusionData, extrusionNamedValues, extrusionDefaultValues] = extrusionMap(extrusionType, version0_1BaseData.length);
  const [floorData, floorNamedValues, floorDefaultValues] = floorMap(floorType, version0_1BaseData.length + extrusionData.length);
  const [heightData, heightNamedValues, heightDefaultValues] = heightMap(heightMethod, version0_1BaseData.length + extrusionData.length + floorData.length);

  return {
    versionName: '0.1',
    dataPattern: [...version0_1BaseData, ...extrusionData, ...floorData, ...heightData],
    namesMap: {
      version: 0,
      extrusionType: 1,
      floorType: 2,
      heightProcessingMethod: 3,
      ...extrusionNamedValues,
      ...floorNamedValues,
      ...heightNamedValues,
    },
    defaultValues: [0, extrusionType, floorType, heightMethod, ...extrusionDefaultValues, ...floorDefaultValues, ...heightDefaultValues],
  };
};
