import { Vector3 } from '@babylonjs/core';
import { V3 } from './v3';
import { MalculmiusOneFootprint } from './footprints/types/malcolmiusOne';

export enum Malculmiuses {
  One = 5,
}

export enum ProcessingMethodType {
  None,
  IncrementalMethod,
  Sin,
}

export type NoneMethod = {
  type: ProcessingMethodType.None;
};

export type IncrementalMethod = {
  type: ProcessingMethodType.IncrementalMethod;
  total: boolean;
  angle: number;
};

export type SinMethod = {
  type: ProcessingMethodType.Sin;
  max: number;
  min: number;
  period: number;
  phaseShift: number;
};

export type ProcessingMethods = NoneMethod | IncrementalMethod | SinMethod;

export type PostProcessingMethods = {
  twist: ProcessingMethods;
  skew: ProcessingMethods;
};

export type RelativeHeightGenerator = {
  storyCount: number;
  totalHeight: number;
  method: ProcessingMethods;
};

export type AbsoluteHeightGenerator = {
  storyCount: number;
  baseHeight: number;
  method: ProcessingMethods;
};

export type HeightGenerator = AbsoluteHeightGenerator | RelativeHeightGenerator;

export const DEFAULT_PROCESSING_METHODS = {
  [ProcessingMethodType.None]: {
    type: ProcessingMethodType.None,
  } as NoneMethod,
  [ProcessingMethodType.IncrementalMethod]: {
    type: ProcessingMethodType.IncrementalMethod,
    total: false,
    angle: 1.3,
  } as IncrementalMethod,
  [ProcessingMethodType.Sin]: {
    type: ProcessingMethodType.Sin,
    max: 0.5,
    min: 1.5,
    period: 2,
    phaseShift: 3,
  } as SinMethod,
};

export const DEFAULT_HEIGHT_GENERATORS = {
  [ProcessingMethodType.None]: {
    storyCount: 4,
    baseHeight: 100,
    method: DEFAULT_PROCESSING_METHODS[ProcessingMethodType.None],
  },
  [ProcessingMethodType.IncrementalMethod]: {
    storyCount: 0,
    baseHeight: 0,
    method: DEFAULT_PROCESSING_METHODS[ProcessingMethodType.None],
  },
  [ProcessingMethodType.Sin]: {
    storyCount: 0,
    baseHeight: 0,
    method: DEFAULT_PROCESSING_METHODS[ProcessingMethodType.None],
  },
};

const getSineMethod =
  (sineSettings: SinMethod) =>
  (angle: number): number => {
    return (
      sineSettings.min + (sineSettings.max - sineSettings.min) * (Math.sin(sineSettings.period * angle + (sineSettings.phaseShift * Math.PI) / 180) * 0.5 + 0.5)
    );
  };

const getIncrementalMethod =
  (incrementalSettings: IncrementalMethod, total?: number) =>
  (angle: number): number => {
    return incrementalSettings.total && total ? 1 + angle * incrementalSettings.angle * total : 1 + angle * incrementalSettings.angle;
  };

export const getHeights = (heightGenerator: HeightGenerator): number[] => {
  const heights: number[] = [];

  const hasBaseHeight = heightGenerator.hasOwnProperty('baseHeight');

  const baseHeight = hasBaseHeight ? (heightGenerator as AbsoluteHeightGenerator).baseHeight : 1;

  switch (heightGenerator.method.type) {
    case ProcessingMethodType.None:
      heights.push(...Array.from({ length: heightGenerator.storyCount }, () => baseHeight));
      break;
    case ProcessingMethodType.IncrementalMethod:
      const incrementalMethod = getIncrementalMethod(heightGenerator.method);
      heights.push(...Array.from({ length: heightGenerator.storyCount }, (_, i) => incrementalMethod(i) + baseHeight));
      break;
    case ProcessingMethodType.Sin:
      const sineMethod = getSineMethod(heightGenerator.method);
      heights.push(...Array.from({ length: heightGenerator.storyCount }, (_, i) => sineMethod(i) * baseHeight));
      break;
  }

  let height = 0;
  const incrementalHeights = [0];

  heights.forEach((h) => {
    height += h;
    incrementalHeights.push(height);
  });

  if (hasBaseHeight) return incrementalHeights;
  const scaleValue = (heightGenerator as RelativeHeightGenerator).totalHeight / incrementalHeights[incrementalHeights.length - 1];
  return incrementalHeights.map((h) => h * scaleValue);
};

export type MalculmiusGeometryType = Malculmiuses.One;

export const twistAndSkewVertex = (v: Vector3, twistMethod: (angle: number) => number, skewMethod: (angle: number) => number, angle: number): Vector3 => {
  const twistAngle = twistMethod(v.z * 0.001);
  const skew = 0.5 + skewMethod(v.z * 0.001) * 0.5;

  const cos = Math.cos(twistAngle) * skew;
  const sin = Math.sin(twistAngle) * skew;

  return new Vector3(v.x * cos - v.y * sin, v.x * sin + v.y * cos, v.z);
};

export const twistAndSkewVertexV3 = (v: V3, twistMethod: (angle: number) => number, skewMethod: (angle: number) => number, angle: number): V3 => {
  const twistAngle = twistMethod(v.z * 0.001);
  const skew = 0.5 + skewMethod(v.z * 0.001) * 0.5;

  const cos = Math.cos(twistAngle) * skew;
  const sin = Math.sin(twistAngle) * skew;

  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos, z: v.z };
};
