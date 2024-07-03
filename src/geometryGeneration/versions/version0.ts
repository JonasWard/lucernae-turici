import { FootprintGeometryTypes } from '../footprintgeometrytypes';
import { ExtrusionCategory } from '../extrusionProfiles/types/extrusionCategory';
import { ProcessingMethodType } from '../geometry';
import { DataEntryFactory } from '../../urlAsState/factory/factory';
import { DefinitionArrayObject, ParserForVersion, VersionDefinitionGeneratorParameters } from '../../urlAsState/types/versionParser';
import { VersionParameterNames } from './parameterNames';
import { DataEntry } from '../../urlAsState/types/dataEntry';
import { Versions } from './versions';

const version0EnumSemantics = {
  [VersionParameterNames.extrusionType]: [
    { value: ExtrusionCategory.Square, label: 'Square Extrusion' },
    { value: ExtrusionCategory.Arc, label: 'Arc Extrusion' },
    { value: ExtrusionCategory.Ellipse, label: 'Ellipse Extrusion' },
  ],
  [VersionParameterNames.footprintType]: [
    { value: FootprintGeometryTypes.Square, label: 'Square Footprint' },
    { value: FootprintGeometryTypes.SquareGrid, label: 'Square Grid Footprint' },
    { value: FootprintGeometryTypes.TriangleGrid, label: 'Triangle Grid Footprint' },
    { value: FootprintGeometryTypes.HexGrid, label: 'Hex Grid Footprint' },
    { value: FootprintGeometryTypes.Cylinder, label: 'Cylinder Footprint' },
    { value: FootprintGeometryTypes.MalculmiusOne, label: 'Malculmius One Footprint' },
  ],
  [VersionParameterNames.processingMethodType]: [
    { value: ProcessingMethodType.IncrementalMethod, label: 'Incremental Method' },
    { value: ProcessingMethodType.Sin, label: 'Sin Method' },
    { value: ProcessingMethodType.None, label: 'None Method' },
  ],
  [VersionParameterNames.shapePostProcessingprocessingMethodType]: [
    { value: ProcessingMethodType.IncrementalMethod, label: 'Incremental Method' },
    { value: ProcessingMethodType.Sin, label: 'Sin Method' },
    { value: ProcessingMethodType.None, label: 'None Method' },
  ],
  [VersionParameterNames.version]: Versions,
};

const extrusionTypeParser = (extrusionDataEntry: DataEntry): DefinitionArrayObject => {
  switch (extrusionDataEntry.value) {
    case ExtrusionCategory.Square:
      return [
        extrusionDataEntry,
        DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetTop),
        DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetBottom),
        DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetSides),
      ];
    case ExtrusionCategory.Arc:
    case ExtrusionCategory.Ellipse:
      return [
        extrusionDataEntry,
        DataEntryFactory.createFloat(0.35, 0.1, 0.5, 2, VersionParameterNames.radiusTop),
        DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetTop),
        DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetBottom),
        DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetSides),
      ];
    default:
      throw new Error('Extrusion type not found');
  }
};

const footprintTypeParser = (footprintDataEntry: DataEntry): DefinitionArrayObject => {
  switch (footprintDataEntry.value) {
    case FootprintGeometryTypes.Square:
      return [footprintDataEntry, DataEntryFactory.createFloat(50, 40, 120, 0, VersionParameterNames.size)];
    case FootprintGeometryTypes.SquareGrid:
    case FootprintGeometryTypes.TriangleGrid:
    case FootprintGeometryTypes.HexGrid:
      return [
        footprintDataEntry,
        DataEntryFactory.createFloat(20, 8, 120, 0, VersionParameterNames.size),
        DataEntryFactory.createInt(3, 1, 20, VersionParameterNames.xCount),
        DataEntryFactory.createInt(3, 1, 20, VersionParameterNames.yCount),
      ];
    case FootprintGeometryTypes.Cylinder:
      return [
        footprintDataEntry,
        DataEntryFactory.createFloat(2, 0, 10, 1, VersionParameterNames.bufferInside),
        DataEntryFactory.createFloat(12, 8, 40, 1, VersionParameterNames.radius0),
        DataEntryFactory.createFloat(12, 0, 40, 1, VersionParameterNames.radius1),
        DataEntryFactory.createFloat(12, 0, 40, 1, VersionParameterNames.radius2),
        DataEntryFactory.createFloat(2, 0, 10, 1, VersionParameterNames.bufferOutside),
        DataEntryFactory.createInt(5, 3, 50, VersionParameterNames.segments),
      ];

    case FootprintGeometryTypes.MalculmiusOne:
      return [
        footprintDataEntry,
        DataEntryFactory.createFloat(35, 10, 80, 1, VersionParameterNames.circleRadius),
        DataEntryFactory.createInt(5, 3, 30, VersionParameterNames.circleDivisions),
        DataEntryFactory.createFloat(0.5, 0.01, 0.99, 2, VersionParameterNames.angleSplit),
        DataEntryFactory.createFloat(0, -50, 50, 1, VersionParameterNames.offsetA),
        DataEntryFactory.createFloat(0, -50, 50, 1, VersionParameterNames.offsetB),
        DataEntryFactory.createFloat(5, 4, 40, 1, VersionParameterNames.innerRadius),
      ];
    default:
      throw new Error('Footprint type not found');
  }
};

const heightMethodTypeParser = (heightMethodDataEntry: DataEntry): DefinitionArrayObject => [
  DataEntryFactory.createFloat(15, 12, 200, 0, VersionParameterNames.baseHeight),
  DataEntryFactory.createInt(7, 2, 20, VersionParameterNames.storyCount),
  [
    VersionParameterNames.heightProcessingMethod,
    heightMethodDataEntry,
    (heightMethodDataEntry: DataEntry): DefinitionArrayObject => {
      switch (heightMethodDataEntry.value) {
        case ProcessingMethodType.IncrementalMethod:
          return [
            heightMethodDataEntry,
            DataEntryFactory.createFloat(20, 10, 200, -1, VersionParameterNames.total),
            DataEntryFactory.createFloat(5, 0, 15, 2, VersionParameterNames.linearTwist),
          ];
        case ProcessingMethodType.Sin:
          return [
            heightMethodDataEntry,
            DataEntryFactory.createFloat(4, 0, 15, 1, VersionParameterNames.maxAmplitude),
            DataEntryFactory.createFloat(1, 0, 5, 2, VersionParameterNames.minAmplitude),
            DataEntryFactory.createFloat(1, 0.2, 200, 1, VersionParameterNames.period),
            DataEntryFactory.createFloat(0, 0, 360, 0, VersionParameterNames.phaseShift),
          ];
        case ProcessingMethodType.None:
          return [heightMethodDataEntry];
        default:
          throw new Error('Height processing method not found');
      }
    },
  ],
];

const baseMethodParser = (baseDataEntry: DataEntry): DefinitionArrayObject => [
  DataEntryFactory.createFloat(20, 10, 200, 0, VersionParameterNames.sideHeight),
  DataEntryFactory.createFloat(5, 0, 40, 1, VersionParameterNames.sideInnerRadius),
];

const shapePostProcessingMethodParser = (shapePostProcessingDataEntry: DataEntry): DefinitionArrayObject => {
  switch (shapePostProcessingDataEntry.value) {
    case ProcessingMethodType.IncrementalMethod:
      return [
        shapePostProcessingDataEntry,
        DataEntryFactory.createFloat(20, 10, 200, -1, VersionParameterNames.shapePostProcessingtotal),
        DataEntryFactory.createFloat(5, 0, 15, 2, VersionParameterNames.shapePostProcessinglinearTwist),
      ];
    case ProcessingMethodType.Sin:
      return [
        shapePostProcessingDataEntry,
        DataEntryFactory.createFloat(4, 0, 15, 1, VersionParameterNames.shapePostProcessingmaxAmplitude),
        DataEntryFactory.createFloat(1, 0, 5, 2, VersionParameterNames.shapePostProcessingminAmplitude),
        DataEntryFactory.createFloat(1, 0.2, 200, 1, VersionParameterNames.shapePostProcessingperiod),
        DataEntryFactory.createFloat(4, 0, 90, 1, VersionParameterNames.shapePostProcessingphaseShift),
      ];
    case ProcessingMethodType.None:
      return [shapePostProcessingDataEntry];
    default:
      throw new Error('Height processing method not found');
  }
};

const getMax = (
  v:
    | VersionParameterNames.extrusionType
    | VersionParameterNames.footprintType
    | VersionParameterNames.processingMethodType
    | VersionParameterNames.shapePostProcessingprocessingMethodType
) => (version0EnumSemantics.hasOwnProperty(v) ? Math.max(...version0EnumSemantics[v].map(({ value }) => value)) : 3);

const version0objectGenerationDescriptor: VersionDefinitionGeneratorParameters = [
  DataEntryFactory.createVersion(0, 8, VersionParameterNames.version, 0),
  [
    VersionParameterNames.extrusion,
    DataEntryFactory.createEnum(ExtrusionCategory.Square, getMax(VersionParameterNames.extrusionType), VersionParameterNames.extrusionType),
    extrusionTypeParser,
  ],
  [
    VersionParameterNames.footprint,
    DataEntryFactory.createEnum(FootprintGeometryTypes.MalculmiusOne, getMax(VersionParameterNames.footprintType), VersionParameterNames.footprintType),
    footprintTypeParser,
  ],
  [
    VersionParameterNames.heights,
    DataEntryFactory.createEnum(
      ProcessingMethodType.IncrementalMethod,
      getMax(VersionParameterNames.processingMethodType),
      VersionParameterNames.processingMethodType
    ),
    heightMethodTypeParser,
  ],
  [VersionParameterNames.base, DataEntryFactory.createEnum(0, 1, 'irrelevant'), baseMethodParser],
  [
    VersionParameterNames.shapePostProcessing,
    DataEntryFactory.createEnum(
      ProcessingMethodType.IncrementalMethod,
      getMax(VersionParameterNames.shapePostProcessingprocessingMethodType),
      VersionParameterNames.shapePostProcessingprocessingMethodType
    ),
    shapePostProcessingMethodParser,
  ],
];

export const parserVersion0: ParserForVersion = {
  version: 0,
  versionName: 'alpha',
  versionEnumSemantics: version0EnumSemantics,
  objectGeneratorParameters: version0objectGenerationDescriptor,
};
