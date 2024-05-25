import {
  ArcExtrusionProfile,
  EllipseExtrusionProfile,
  ExtrusionProfile,
  ExtrusionProfileType,
  SquareExtrusionProfile,
} from '../../geometryGeneration/baseGeometry';
import { DEFAULT_PROCESSING_METHODS, HeightGenerator, MalculmiusGeometry, Malculmiuses, ProcessingMethodType } from '../../geometryGeneration/geometry';
import { useState } from 'react';
import { Button, Switch } from 'antd';
import { defaultInsetBottom, defaultInsetTop, defaultInsetSides, defaultRadiusTop, defaultRadius } from './GeometryExtrusionSettings';
import { InputDrawer, inputButtonStyle } from './GeometryInputDrawer';
import React from 'react';

export const DEFAULT_PROFILE_TYPES = {
  [ExtrusionProfileType.Arc]: {
    type: ExtrusionProfileType.Arc,
    radiusTop: 0.35,
    insetTop: 0.1,
    insetBottom: 0.1,
    insetSides: 0.1,
  } as ArcExtrusionProfile,
  [ExtrusionProfileType.Ellipse]: {
    type: ExtrusionProfileType.Ellipse,
    radiusTop: 0.35,
    insetTop: 0.1,
    insetBottom: 0.1,
    insetSides: 0.1,
  } as EllipseExtrusionProfile,
  [ExtrusionProfileType.Square]: {
    type: ExtrusionProfileType.Square,
    insetTop: 0.1,
    insetBottom: 0.1,
    insetSides: 0.1,
  } as SquareExtrusionProfile,
};

export const DEFAULT_GEOMETRY_TYPES = {
  [Malculmiuses.One]: {
    type: Malculmiuses.One,
    circleRadius: 250,
    circleDivisions: 5,
    angleSplit: 0.5,
    offsetA: 10,
    offsetB: -10,
    innerRadius: 20,
    heights: {
      storyCount: 6,
      baseHeight: 100,
      method: {
        type: ProcessingMethodType.None,
      },
    } as HeightGenerator,
    postProcessing: {
      twist: DEFAULT_PROCESSING_METHODS[ProcessingMethodType.Sin],
      skew: DEFAULT_PROCESSING_METHODS[ProcessingMethodType.IncrementalMethod],
    },
  },
};

const updateType = (extrusionProfile: ExtrusionProfile): ExtrusionProfile => {
  const newValues = DEFAULT_PROFILE_TYPES[Math.floor(Object.keys(DEFAULT_PROFILE_TYPES).length * Math.random()) as 0 | 1 | 2] as ExtrusionProfile;
  return { ...newValues, ...extrusionProfile } as ExtrusionProfile;
};

const helperMethodUpdateValues = (limits: { min: number; max: number; int: boolean }): number => {
  const value = Math.random() * (limits.max - limits.min) + limits.min;
  return limits.int ? Math.floor(value) : value;
};

const RandomNumberGenerator: React.FC<IInputProps> = ({ extrusionProfile, malcolmiusGeometry, setExtrusionProfile, setMalcolmiusGeometry }) => {
  const generateAndSetWithRandomNumber = () => {
    // get a random number
    let extrusionProfileCopy = { ...extrusionProfile };
    extrusionProfileCopy = updateType(extrusionProfileCopy);
    extrusionProfile.insetBottom = helperMethodUpdateValues(defaultInsetBottom);
    extrusionProfile.insetTop = helperMethodUpdateValues(defaultInsetTop);
    extrusionProfile.insetSides = helperMethodUpdateValues(defaultInsetSides);
    if (extrusionProfile.type === ExtrusionProfileType.Arc) {
      extrusionProfile.radiusTop = helperMethodUpdateValues(defaultRadiusTop);
    } else if (extrusionProfile.type === ExtrusionProfileType.Ellipse) {
      extrusionProfile.radiusTop = helperMethodUpdateValues(defaultRadius);
    }

    setExtrusionProfile(extrusionProfileCopy);
  };
  // return null; // random generation doesn't work properly right now
  return (
    <Button style={inputButtonStyle} onClick={generateAndSetWithRandomNumber}>
      Generate
    </Button>
  );
};

export interface IInputProps {
  extrusionProfile: ExtrusionProfile;
  malcolmiusGeometry: MalculmiusGeometry;
  setExtrusionProfile: (e: ExtrusionProfile) => void;
  setMalcolmiusGeometry: (m: MalculmiusGeometry) => void;
}

export const InputRenderer: React.FC<IInputProps> = (props) => {
  const [fullControl, activateFullControl] = useState<boolean>(true);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);

  return (
    <>
      <Switch style={{ position: 'fixed', left: 10, top: 10 }} value={fullControl} onChange={() => activateFullControl(!fullControl)} />
      {fullControl ? <Button onClick={() => setShowDrawer(!showDrawer)}>Toggle Drawer</Button> : <RandomNumberGenerator {...props} />}
      {fullControl ? <InputDrawer {...props} /> : null}
    </>
  );
};
