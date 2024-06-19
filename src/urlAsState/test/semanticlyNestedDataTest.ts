import { ExtrusionProfileType } from '../../geometryGeneration/baseGeometry';
import { FootprintGeometryTypes } from '../../geometryGeneration/footprintgeometrytypes';
import { ProcessingMethodType } from '../../geometryGeneration/geometry';
import { DataEntryFactory } from '../factory/factory';
import { dataObjectAsUrl } from '../objectmap/versionReading';
import { ObjectGeneratorMethod, ParserForVersion } from '../types/versionParser';

enum VersionParameterNames {
  version = 'version',
  extrusion = 'extrusion',
  extrusionType = 'extrusionType',
  radiusTop = 'radiusTop',
  insetTop = 'insetTop',
  insetBottom = 'insetBottom',
  insetSides = 'insetSides',
  footprint = 'footprint',
  footprintType = 'footprintType',
  size = 'size',
  xCount = 'xCount',
  yCount = 'yCount',
  bufferInside = 'bufferInside',
  radius0 = 'radius0',
  radius1 = 'radius1',
  radius2 = 'radius2',
  bufferOutside = 'bufferOutside',
  segments = 'segments',
  circleRadius = 'circleRadius',
  circleDivisions = 'circleDivisions',
  angleSplit = 'angleSplit',
  offsetA = 'offsetA',
  offsetB = 'offsetB',
  innerRadius = 'innerRadius',
  heights = 'heights',
  heightProcessingMethod = 'heightProcessingMethod',
  baseHeight = 'baseHeight',
  storyCount = 'storyCount',
  processingMethodType = 'processingMethodType',
  total = 'total',
  linearTwist = 'linearTwist',
  maxAmplitude = 'maxAmplitude',
  minAmplitude = 'minAmplitude',
  period = 'period',
  phaseShift = 'phaseShift',
}

export const globalDataAttributeMapper: Record<VersionParameterNames, string> = {
  [VersionParameterNames.version]: 'version',
  [VersionParameterNames.extrusion]: 'extrusion',
  [VersionParameterNames.extrusionType]: 'type',
  [VersionParameterNames.radiusTop]: 'radiusTop',
  [VersionParameterNames.insetTop]: 'insetTop',
  [VersionParameterNames.insetBottom]: 'insetBottom',
  [VersionParameterNames.insetSides]: 'insetSides',
  [VersionParameterNames.footprint]: 'footprint',
  [VersionParameterNames.footprintType]: 'type',
  [VersionParameterNames.size]: 'size',
  [VersionParameterNames.xCount]: 'xCount',
  [VersionParameterNames.yCount]: 'yCount',
  [VersionParameterNames.bufferInside]: 'bufferInside',
  [VersionParameterNames.radius0]: 'radius0',
  [VersionParameterNames.radius1]: 'radius1',
  [VersionParameterNames.radius2]: 'radius2',
  [VersionParameterNames.bufferOutside]: 'bufferOutside',
  [VersionParameterNames.segments]: 'segments',
  [VersionParameterNames.circleRadius]: 'circleRadius',
  [VersionParameterNames.circleDivisions]: 'circleDivisions',
  [VersionParameterNames.angleSplit]: 'angleSplit',
  [VersionParameterNames.offsetA]: 'offsetA',
  [VersionParameterNames.offsetB]: 'offsetB',
  [VersionParameterNames.innerRadius]: 'innerRadius',
  [VersionParameterNames.heights]: 'heights',
  [VersionParameterNames.heightProcessingMethod]: 'method',
  [VersionParameterNames.baseHeight]: 'baseHeight',
  [VersionParameterNames.storyCount]: 'storyCount',
  [VersionParameterNames.processingMethodType]: 'type',
  [VersionParameterNames.total]: 'total',
  [VersionParameterNames.linearTwist]: 'angle',
  [VersionParameterNames.maxAmplitude]: 'max',
  [VersionParameterNames.minAmplitude]: 'min',
  [VersionParameterNames.period]: 'period',
  [VersionParameterNames.phaseShift]: 'phaseShift',
};

const parameterOffset = 100;

const extrusionTypeParser = (extrusionType: ExtrusionProfileType, startIndex = 1) => {
  const baseIndexOtherParameters = startIndex * parameterOffset;

  switch (extrusionType) {
    case ExtrusionProfileType.Square:
      return {
        [VersionParameterNames.extrusionType]: DataEntryFactory.createVersion(extrusionType, 4, VersionParameterNames.extrusionType, startIndex),
        [VersionParameterNames.insetTop]: DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetTop, baseIndexOtherParameters + 1),
        [VersionParameterNames.insetBottom]: DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetBottom, baseIndexOtherParameters + 2),
        [VersionParameterNames.insetSides]: DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetSides, baseIndexOtherParameters + 3),
      };
    case ExtrusionProfileType.Arc:
    case ExtrusionProfileType.Ellipse:
      return {
        [VersionParameterNames.extrusionType]: DataEntryFactory.createVersion(extrusionType, 4, VersionParameterNames.extrusionType, startIndex),
        [VersionParameterNames.radiusTop]: DataEntryFactory.createFloat(0.35, 0.1, 0.5, 2, VersionParameterNames.radiusTop, baseIndexOtherParameters + 1),
        [VersionParameterNames.insetTop]: DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetTop, baseIndexOtherParameters + 2),
        [VersionParameterNames.insetBottom]: DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetBottom, baseIndexOtherParameters + 3),
        [VersionParameterNames.insetSides]: DataEntryFactory.createFloat(0.25, 0.1, 0.5, 2, VersionParameterNames.insetSides, baseIndexOtherParameters + 4),
      };
    default:
      throw new Error('Extrusion type not found');
  }
};

const footprintTypeParser = (footprintType: FootprintGeometryTypes, startIndex = 2) => {
  const baseIndexOtherParameters = startIndex * parameterOffset;

  switch (footprintType) {
    case FootprintGeometryTypes.Square:
      return {
        [VersionParameterNames.footprintType]: DataEntryFactory.createVersion(footprintType, 4, VersionParameterNames.footprintType, startIndex),
        [VersionParameterNames.size]: DataEntryFactory.createFloat(3, 2, 20, 2, VersionParameterNames.size, baseIndexOtherParameters + 1),
      };
    case FootprintGeometryTypes.SquareGrid:
    case FootprintGeometryTypes.TriangleGrid:
    case FootprintGeometryTypes.HexGrid:
      return {
        [VersionParameterNames.footprintType]: DataEntryFactory.createVersion(footprintType, 4, VersionParameterNames.footprintType, startIndex),
        [VersionParameterNames.size]: DataEntryFactory.createFloat(3, 2, 20, 1, VersionParameterNames.size, baseIndexOtherParameters + 1),
        [VersionParameterNames.xCount]: DataEntryFactory.createInt(3, 1, 20, VersionParameterNames.xCount, baseIndexOtherParameters + 2),
        [VersionParameterNames.yCount]: DataEntryFactory.createInt(3, 1, 20, VersionParameterNames.yCount, baseIndexOtherParameters + 3),
      };
    case FootprintGeometryTypes.Cylinder:
      return {
        [VersionParameterNames.footprintType]: DataEntryFactory.createVersion(footprintType, 4, VersionParameterNames.footprintType, startIndex),
        [VersionParameterNames.bufferInside]: DataEntryFactory.createFloat(0.5, 0, 5, 2, VersionParameterNames.bufferInside, baseIndexOtherParameters + 1),
        [VersionParameterNames.radius0]: DataEntryFactory.createFloat(2.5, 2, 20, 2, VersionParameterNames.radius0, baseIndexOtherParameters + 2),
        [VersionParameterNames.radius1]: DataEntryFactory.createFloat(4, 2, 20, 2, VersionParameterNames.radius1, baseIndexOtherParameters + 3),
        [VersionParameterNames.radius2]: DataEntryFactory.createFloat(2.5, 2, 20, 2, VersionParameterNames.radius2, baseIndexOtherParameters + 4),
        [VersionParameterNames.bufferOutside]: DataEntryFactory.createFloat(0.5, 0, 5, 2, VersionParameterNames.bufferOutside, baseIndexOtherParameters + 5),
        [VersionParameterNames.segments]: DataEntryFactory.createInt(5, 3, 50, VersionParameterNames.segments, baseIndexOtherParameters + 6),
      };

    case FootprintGeometryTypes.MalculmiusOne:
      return {
        [VersionParameterNames.footprintType]: DataEntryFactory.createVersion(footprintType, 4, VersionParameterNames.footprintType, startIndex),
        [VersionParameterNames.circleRadius]: DataEntryFactory.createFloat(3.5, 2, 20, 2, VersionParameterNames.circleRadius, baseIndexOtherParameters + 1),
        [VersionParameterNames.circleDivisions]: DataEntryFactory.createInt(5, 3, 30, VersionParameterNames.circleDivisions, baseIndexOtherParameters + 2),
        [VersionParameterNames.angleSplit]: DataEntryFactory.createFloat(0.5, 0.01, 0.99, 2, VersionParameterNames.angleSplit, baseIndexOtherParameters + 3),
        [VersionParameterNames.offsetA]: DataEntryFactory.createFloat(0, -5, 5, 2, VersionParameterNames.offsetA, baseIndexOtherParameters + 4),
        [VersionParameterNames.offsetB]: DataEntryFactory.createFloat(0, -5, 5, 2, VersionParameterNames.offsetB, baseIndexOtherParameters + 5),
        [VersionParameterNames.innerRadius]: DataEntryFactory.createFloat(1, 0.5, 10, 2, VersionParameterNames.innerRadius, baseIndexOtherParameters + 6),
      };
    default:
      throw new Error('Footprint type not found');
  }
};

const heightProcessingMethodParser = (heightMethodType: ProcessingMethodType, startIndex = 3) => {
  const baseIndexOtherParameters = startIndex * parameterOffset;

  return {
    [VersionParameterNames.baseHeight]: DataEntryFactory.createFloat(3, 0.5, 20, 1, VersionParameterNames.baseHeight, baseIndexOtherParameters + 1),
    [VersionParameterNames.storyCount]: DataEntryFactory.createInt(7, 2, 20, VersionParameterNames.storyCount, baseIndexOtherParameters + 2),
    [VersionParameterNames.heightProcessingMethod]: (() => {
      switch (heightMethodType) {
        case ProcessingMethodType.IncrementalMethod:
          return {
            [VersionParameterNames.processingMethodType]: DataEntryFactory.createVersion(
              heightMethodType,
              4,
              VersionParameterNames.processingMethodType,
              startIndex
            ),
            [VersionParameterNames.total]: DataEntryFactory.createFloat(3, 2, 20, 2, VersionParameterNames.total, baseIndexOtherParameters + 3),
            [VersionParameterNames.linearTwist]: DataEntryFactory.createFloat(5, 0, 15, 2, VersionParameterNames.linearTwist, baseIndexOtherParameters + 4),
          };
        case ProcessingMethodType.Sin:
          return {
            [VersionParameterNames.processingMethodType]: DataEntryFactory.createVersion(
              heightMethodType,
              4,
              VersionParameterNames.processingMethodType,
              startIndex
            ),
            [VersionParameterNames.maxAmplitude]: DataEntryFactory.createFloat(4, 0, 15, 1, VersionParameterNames.maxAmplitude, baseIndexOtherParameters + 3),
            [VersionParameterNames.minAmplitude]: DataEntryFactory.createFloat(1, 0, 5, 2, VersionParameterNames.minAmplitude, baseIndexOtherParameters + 4),
            [VersionParameterNames.period]: DataEntryFactory.createFloat(1, 0.2, 20, 2, VersionParameterNames.period, baseIndexOtherParameters + 5),
            [VersionParameterNames.phaseShift]: DataEntryFactory.createFloat(4, 0, 90, 1, VersionParameterNames.phaseShift, baseIndexOtherParameters + 6),
          };
        case ProcessingMethodType.None:
          return {
            [VersionParameterNames.processingMethodType]: DataEntryFactory.createVersion(
              heightMethodType,
              4,
              VersionParameterNames.processingMethodType,
              startIndex
            ),
          };
      }
    })(),
  };
};

const version0DataDescriptionObjectGenerator = (
  version: number,
  extrusionType?: ExtrusionProfileType,
  footprintType?: FootprintGeometryTypes,
  heightMethodType?: ProcessingMethodType
) => {
  if (extrusionType === undefined && footprintType === undefined && heightMethodType === undefined) {
    return {
      [VersionParameterNames.version]: DataEntryFactory.createVersion(version, 8, VersionParameterNames.version, 0),
      [VersionParameterNames.extrusionType]: DataEntryFactory.createVersion(1, 4, VersionParameterNames.extrusionType, 1),
      [VersionParameterNames.footprintType]: DataEntryFactory.createVersion(5, 4, VersionParameterNames.footprintType, 2),
      [VersionParameterNames.processingMethodType]: DataEntryFactory.createVersion(0, 4, VersionParameterNames.processingMethodType, 3),
    };
  } else if (extrusionType === undefined || footprintType === undefined || heightMethodType === undefined) {
    throw new Error('All parameters must be set');
  }

  return {
    version: DataEntryFactory.createVersion(0, 8, 'version', 0),
    extrusion: extrusionTypeParser(extrusionType),
    footprint: footprintTypeParser(footprintType),
    heights: heightProcessingMethodParser(heightMethodType),
  };
};

const parserVersion0: ParserForVersion = {
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
  objectGenerator: version0DataDescriptionObjectGenerator as unknown as ObjectGeneratorMethod,
};

export const parserObjects: ParserForVersion[] = [parserVersion0];

export const testSemanticlyNesting = () => {
  console.log(dataObjectAsUrl(parserVersion0.objectGenerator(0, 0, 0, 0), [parserVersion0]));
};
