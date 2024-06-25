import { ExtrusionProfileType } from '../baseGeometry';
import { FootprintGeometryTypes } from '../footprintgeometrytypes';
import { ProcessingMethodType } from '../geometry';
import { DataEntryFactory } from '../../urlAsState/factory/factory';
import { DefinitionArrayObject, ParserForVersion, VersionDefinitionGeneratorParameters } from '../../urlAsState/types/versionParser';
import { VersionParameterNames } from './parameterNames';
import { DataEntry } from '../../urlAsState/types/dataEntry';

const extrusionTypeParser = (extrusionDataEntry: DataEntry): DefinitionArrayObject => {
  switch (extrusionDataEntry.value) {
    case ExtrusionProfileType.Square:
      return [
        extrusionDataEntry,
        DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetTop),
        DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetBottom),
        DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetSides),
      ];
    case ExtrusionProfileType.Arc:
    case ExtrusionProfileType.Ellipse:
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
      return [footprintDataEntry, DataEntryFactory.createFloat(3, 2, 20, 2, VersionParameterNames.size)];
    case FootprintGeometryTypes.SquareGrid:
    case FootprintGeometryTypes.TriangleGrid:
    case FootprintGeometryTypes.HexGrid:
      return [
        footprintDataEntry,
        DataEntryFactory.createFloat(3, 2, 20, 1, VersionParameterNames.size),
        DataEntryFactory.createInt(3, 1, 20, VersionParameterNames.xCount),
        DataEntryFactory.createInt(3, 1, 20, VersionParameterNames.yCount),
      ];
    case FootprintGeometryTypes.Cylinder:
      return [
        footprintDataEntry,
        DataEntryFactory.createFloat(0.5, 0, 5, 2, VersionParameterNames.bufferInside),
        DataEntryFactory.createFloat(2.5, 2, 20, 2, VersionParameterNames.radius0),
        DataEntryFactory.createFloat(4, 2, 20, 2, VersionParameterNames.radius1),
        DataEntryFactory.createFloat(2.5, 2, 20, 2, VersionParameterNames.radius2),
        DataEntryFactory.createFloat(0.5, 0, 5, 2, VersionParameterNames.bufferOutside),
        DataEntryFactory.createInt(5, 3, 50, VersionParameterNames.segments),
      ];

    case FootprintGeometryTypes.MalculmiusOne:
      return [
        footprintDataEntry,
        DataEntryFactory.createFloat(3.5, 2, 20, 2, VersionParameterNames.circleRadius),
        DataEntryFactory.createInt(5, 3, 30, VersionParameterNames.circleDivisions),
        DataEntryFactory.createFloat(0.5, 0.01, 0.99, 2, VersionParameterNames.angleSplit),
        DataEntryFactory.createFloat(0, -5, 5, 2, VersionParameterNames.offsetA),
        DataEntryFactory.createFloat(0, -5, 5, 2, VersionParameterNames.offsetB),
        DataEntryFactory.createFloat(1, 0.5, 10, 2, VersionParameterNames.innerRadius),
      ];
    default:
      throw new Error('Footprint type not found');
  }
};

const heightMethodTypeParser = (heightMethodDataEntry: DataEntry): DefinitionArrayObject => [
  DataEntryFactory.createFloat(3, 0.5, 20, 1, VersionParameterNames.baseHeight),
  DataEntryFactory.createInt(7, 2, 20, VersionParameterNames.storyCount),
  [
    VersionParameterNames.heightProcessingMethod,
    heightMethodDataEntry,
    (heightMethodDataEntry: DataEntry): DefinitionArrayObject => {
      switch (heightMethodDataEntry.value) {
        case ProcessingMethodType.IncrementalMethod:
          return [
            heightMethodDataEntry,
            DataEntryFactory.createFloat(3, 2, 20, 2, VersionParameterNames.total),
            DataEntryFactory.createFloat(5, 0, 15, 2, VersionParameterNames.linearTwist),
          ];
        case ProcessingMethodType.Sin:
          return [
            heightMethodDataEntry,
            DataEntryFactory.createFloat(4, 0, 15, 1, VersionParameterNames.maxAmplitude),
            DataEntryFactory.createFloat(1, 0, 5, 2, VersionParameterNames.minAmplitude),
            DataEntryFactory.createFloat(1, 0.2, 20, 2, VersionParameterNames.period),
            DataEntryFactory.createFloat(4, 0, 90, 1, VersionParameterNames.phaseShift),
          ];
        case ProcessingMethodType.None:
          return [heightMethodDataEntry];
        default:
          throw new Error('Height processing method not found');
      }
    },
  ],
];

const version0objectGenerationDescriptor: VersionDefinitionGeneratorParameters = [
  DataEntryFactory.createVersion(0, 8, VersionParameterNames.version, 0),
  [
    VersionParameterNames.extrusion,
    DataEntryFactory.createVersion(ExtrusionProfileType.Square, 4, VersionParameterNames.extrusionType, 1),
    extrusionTypeParser,
  ],
  [
    VersionParameterNames.footprint,
    DataEntryFactory.createVersion(FootprintGeometryTypes.MalculmiusOne, 4, VersionParameterNames.footprintType, 2),
    footprintTypeParser,
  ],
  [
    VersionParameterNames.heights,
    DataEntryFactory.createVersion(ProcessingMethodType.IncrementalMethod, 4, VersionParameterNames.processingMethodType, 3),
    heightMethodTypeParser,
  ],
];

export const parserVersion0: ParserForVersion = {
  version: 0,
  versionName: 'alpha',
  versionEnumSemantics: {
    [VersionParameterNames.extrusionType]: [
      { value: ExtrusionProfileType.Square, label: 'Square Extrusion' },
      { value: ExtrusionProfileType.Arc, label: 'Arc Extrusion' },
      { value: ExtrusionProfileType.Ellipse, label: 'Ellipse Extrusion' },
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
    [VersionParameterNames.version]: [{ value: 0, label: 'alpha' }],
  },
  versionValueAttributeMapper: {},
  objectGeneratorParameters: version0objectGenerationDescriptor,
};
