import { DataEntry } from '../../urlAsState/types/dataEntry';
import { SemanticlyNestedDataEntry } from '../../urlAsState/types/semanticlyNestedDataEntry';
import { VersionParameterNames } from './parameterNames';

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
  [VersionParameterNames.base]: 'base',
  [VersionParameterNames.sideHeight]: 'sideHeight',
  [VersionParameterNames.sideInnerRadius]: 'sideInnerRadius',
  [VersionParameterNames.shapePostProcessing]: 'method',
  [VersionParameterNames.shapePostProcessingprocessingMethodType]: 'type',
  [VersionParameterNames.shapePostProcessingtotal]: 'total',
  [VersionParameterNames.shapePostProcessinglinearTwist]: 'angle',
  [VersionParameterNames.shapePostProcessingmaxAmplitude]: 'max',
  [VersionParameterNames.shapePostProcessingminAmplitude]: 'min',
  [VersionParameterNames.shapePostProcessingperiod]: 'period',
  [VersionParameterNames.shapePostProcessingphaseShift]: 'phaseShift',
};

type NestedValue = { [key: string]: number | boolean | NestedValue };

// extract value map
export const getValueObjectFrom = (nestedDataEntry: SemanticlyNestedDataEntry, attributeMapper?: { [key: string]: string }): NestedValue =>
  Object.fromEntries(
    Object.entries(nestedDataEntry).map(([key, value]) => [
      attributeMapper?.hasOwnProperty(key) ? attributeMapper[key] : key,
      value.hasOwnProperty('type') ? (value as DataEntry).value : getValueObjectFrom(value as SemanticlyNestedDataEntry, attributeMapper),
    ])
  );
