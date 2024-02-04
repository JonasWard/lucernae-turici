import {
  ArcExtrusionProfile,
  EllipseExtrusionProfile,
  ExtrusionProfile,
  ExtrusionProfileType,
  SquareExtrusionProfile,
} from '../geometryGeneration/baseGeometry';
import { MalculmiusGeometry, MalculmiusGeometryType, Malculmiuses } from '../geometryGeneration/voxelComplex';
import { useState } from 'react';
import { Drawer, Form, Slider, Select, Button, Switch } from 'antd';

interface IExtrusionProfileInputProps {
  extrusionProfile: ExtrusionProfile;
  setExtrusionProfile: (profile: ExtrusionProfile) => void;
}

interface IGeometryInputProps {
  malcolmiusGeometry: MalculmiusGeometry;
  setMalcolmiusGeometry: (m: MalculmiusGeometry) => void;
}

interface IInputProps {
  extrusionProfile: ExtrusionProfile;
  malcolmiusGeometry: MalculmiusGeometry;
  setExtrusionProfile: (e: ExtrusionProfile) => void;
  setMalcolmiusGeometry: (m: MalculmiusGeometry) => void;
}

export const DEFAULT_PROFILE_TYPES = {
  [ExtrusionProfileType.Arc]: {
    type: ExtrusionProfileType.Arc,
    radiusTop: 10,
    insetTop: 10,
    insetBottom: 10,
    insetSides: 10,
  } as ArcExtrusionProfile,
  [ExtrusionProfileType.Ellipse]: {
    type: ExtrusionProfileType.Ellipse,
    radius: 20,
    insetTop: 10,
    insetBottom: 10,
    insetSides: 10,
  } as EllipseExtrusionProfile,
  [ExtrusionProfileType.Square]: {
    type: ExtrusionProfileType.Square,
    insetTop: 10,
    insetBottom: 10,
    insetSides: 10,
  } as SquareExtrusionProfile,
};

const defaultInsetBottom = { min: 10, max: 500, int: false, step: 1 };
const defaultInsetTop = { min: 10, max: 500, int: false, step: 1 };
const defaultInsetSides = { min: 10, max: 500, int: false, step: 1 };
const defaultRadiusTop = { min: 10, max: 500, int: false, step: 1 };
const defaultRadius = { min: 10, max: 500, int: false, step: 1 };

export const DEFAULT_GEOMETRY_TYPES = {
  [Malculmiuses.One]: {
    type: Malculmiuses.One,
    circleRadius: 100,
    circleDivisions: 5,
    angleSplit: 0.5,
    offsetA: 10,
    offsetB: -10,
    innerRadius: 20,
  },
};

const defaultCircleRadius = { min: 50, max: 250, int: false, step: 1 };
const defaultCircleDivisions = { min: 3, max: 10, int: true, step: 1 };
const defaultAngleSplit = { min: 0, max: 1, int: false, step: 0.01 };
const defaultOffsetA = { min: -100, max: 100, int: false, step: 1 };
const defaultOffsetB = { min: -100, max: 100, int: false, step: 1 };
const defaultInnerRadius = { min: 0, max: 100, int: false, step: 1 };

const inputButtonStyle: React.CSSProperties = { position: 'fixed', left: '47vh', right: '45vh', top: '5vh' };

const UpdateExtrusionTypeComponent: React.FC<{ type: ExtrusionProfileType; updateType: (type: ExtrusionProfileType) => void }> = ({ type, updateType }) => (
  <Select onChange={updateType} style={{ width: '100%' }} value={type}>
    {[ExtrusionProfileType.Arc, ExtrusionProfileType.Ellipse, ExtrusionProfileType.Square].map((v) => (
      <Select.Option key={v} value={v}>
        {v}
      </Select.Option>
    ))}
  </Select>
);

const UpdateGeometryTypeComponent: React.FC<{ type: MalculmiusGeometryType; updateType: (type: MalculmiusGeometryType) => void }> = ({ type, updateType }) => (
  <Select onChange={updateType} style={{ width: '100%' }} value={type}>
    {[Malculmiuses.One].map((v) => (
      <Select.Option key={v} value={v}>
        {v}
      </Select.Option>
    ))}
  </Select>
);

const ExtrusionRenderer: React.FC<IExtrusionProfileInputProps> = ({ extrusionProfile, setExtrusionProfile }) => {
  const setInsetBottom = (value: number) => setExtrusionProfile({ ...extrusionProfile, insetBottom: value });
  const setInsetTop = (value: number) => setExtrusionProfile({ ...extrusionProfile, insetTop: value });
  const setInsetSides = (value: number) => setExtrusionProfile({ ...extrusionProfile, insetSides: value });
  const updateType = (type: ExtrusionProfileType) => setExtrusionProfile({ ...[type], ...extrusionProfile, type } as ExtrusionProfile);

  switch (extrusionProfile.type) {
    case ExtrusionProfileType.Arc:
      const setArcTop = (value: number) => setExtrusionProfile({ ...extrusionProfile, radiusTop: value });

      return (
        <Form>
          <UpdateExtrusionTypeComponent type={extrusionProfile.type} updateType={updateType} />
          <div key='insetBottom'>
            <span>{'Inset Bottom'}</span>
            <SliderWrapper
              value={extrusionProfile.insetBottom}
              onChange={setInsetBottom}
              min={defaultInsetBottom.min}
              max={defaultInsetBottom.max}
              step={defaultInsetBottom.step}
            />
          </div>
          <div key='insetTop'>
            <span>{'Inset Top'}</span>
            <SliderWrapper
              value={extrusionProfile.insetTop}
              onChange={setInsetTop}
              min={defaultInsetTop.min}
              max={defaultInsetTop.max}
              step={defaultInsetTop.step}
            />
          </div>
          <div key='insetSides'>
            <span>{'Inset Sides'}</span>
            <SliderWrapper
              value={extrusionProfile.insetSides}
              onChange={setInsetSides}
              min={defaultInsetSides.min}
              max={defaultInsetSides.max}
              step={defaultInsetSides.step}
            />
          </div>
          <div key='arcTop'>
            <span>{'Arc Top'}</span>
            <SliderWrapper
              value={extrusionProfile.radiusTop}
              onChange={setArcTop}
              min={defaultRadiusTop.min}
              max={defaultRadiusTop.max}
              step={defaultRadiusTop.step}
            />
          </div>
        </Form>
      );
    case ExtrusionProfileType.Square:
      return (
        <Form>
          <UpdateExtrusionTypeComponent type={extrusionProfile.type} updateType={updateType} />
          <div key='insetBottom'>
            <span>{'Inset Bottom'}</span>
            <SliderWrapper
              value={extrusionProfile.insetBottom}
              onChange={setInsetBottom}
              min={defaultInsetBottom.min}
              max={defaultInsetBottom.max}
              step={defaultInsetBottom.step}
            />
          </div>
          <div key='insetTop'>
            <span>{'Inset Top'}</span>
            <SliderWrapper
              value={extrusionProfile.insetTop}
              onChange={setInsetTop}
              min={defaultInsetTop.min}
              max={defaultInsetTop.max}
              step={defaultInsetTop.step}
            />
          </div>
          <div key='insetSides'>
            <span>{'Inset Sides'}</span>
            <SliderWrapper
              value={extrusionProfile.insetSides}
              onChange={setInsetSides}
              min={defaultInsetSides.min}
              max={defaultInsetSides.max}
              step={defaultInsetSides.step}
            />
          </div>
        </Form>
      );
    case ExtrusionProfileType.Ellipse:
      const setArc = (value: number) => setExtrusionProfile({ ...extrusionProfile, radius: value });
      return (
        <Form>
          <UpdateExtrusionTypeComponent type={extrusionProfile.type} updateType={updateType} />
          <div key='insetBottom'>
            <span>{'Inset Bottom'}</span>
            <SliderWrapper
              value={extrusionProfile.insetBottom}
              onChange={setInsetBottom}
              min={defaultInsetBottom.min}
              max={defaultInsetBottom.max}
              step={defaultInsetBottom.step}
            />
          </div>
          <div key='insetTop'>
            <span>{'Inset Top'}</span>
            <SliderWrapper
              value={extrusionProfile.insetTop}
              onChange={setInsetTop}
              min={defaultInsetTop.min}
              max={defaultInsetTop.max}
              step={defaultInsetTop.step}
            />
          </div>
          <div key='insetSides'>
            <span>{'Inset Sides'}</span>
            <SliderWrapper
              value={extrusionProfile.insetSides}
              onChange={setInsetSides}
              min={defaultInsetSides.min}
              max={defaultInsetSides.max}
              step={defaultInsetSides.step}
            />
          </div>
          <div key='arcTop'>
            <span>{'Arc Size'}</span>
            <SliderWrapper onChange={setArc} value={extrusionProfile.radius} min={defaultRadius.min} max={defaultRadius.max} step={defaultRadius.step} />
          </div>
        </Form>
      );
  }
};

const SliderWrapper: React.FC<{ value: number; onChange: (value: number) => void; min: number; max: number; step: number }> = ({
  value,
  onChange,
  min,
  max,
  step,
}) =>
  value || value === 0 ? (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Slider style={{ width: 400 }} value={value} onChange={onChange} min={min} max={max} step={step} />
      {value.toFixed(2)}
    </div>
  ) : (
    <span>Value is not valid</span>
  );

const GeometryRenderer: React.FC<IGeometryInputProps> = ({ malcolmiusGeometry, setMalcolmiusGeometry }) => {
  const setCircleRadius = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, circleRadius: value });
  const setCircleDivisions = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, circleDivisions: value });
  const setAngleSplit = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, angleSplit: value });
  const setOffsetA = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, offsetA: value ?? 0 });
  const setOffsetB = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, offsetB: value ?? 0 });
  const setInnerRadius = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, innerRadius: value });

  const updateType = (type: MalculmiusGeometryType) =>
    setMalcolmiusGeometry({ ...DEFAULT_GEOMETRY_TYPES[type], ...malcolmiusGeometry, type } as MalculmiusGeometry);

  switch (malcolmiusGeometry.type) {
    case Malculmiuses.One:
      return (
        <Form>
          <UpdateGeometryTypeComponent type={malcolmiusGeometry.type} updateType={updateType} />
          <div key='circleRadius'>
            <span>{'Circle Radius'}</span>
            <SliderWrapper
              value={malcolmiusGeometry.circleRadius}
              onChange={setCircleRadius}
              min={defaultCircleRadius.min}
              max={defaultCircleRadius.max}
              step={defaultCircleRadius.step}
            />
          </div>
          <div key='circleDivisions'>
            <span>{'Circle Divisions'}</span>
            <SliderWrapper
              value={malcolmiusGeometry.circleDivisions}
              onChange={setCircleDivisions}
              min={defaultCircleDivisions.min}
              max={defaultCircleDivisions.max}
              step={defaultCircleDivisions.step}
            />
          </div>
          <div key='angleSplit'>
            <span>{'Angle Split'}</span>
            <SliderWrapper
              value={malcolmiusGeometry.angleSplit}
              onChange={setAngleSplit}
              min={defaultAngleSplit.min}
              max={defaultAngleSplit.max}
              step={defaultAngleSplit.step}
            />
          </div>
          <div key='offsetA'>
            <span>{'Offset A'}</span>
            <SliderWrapper
              value={malcolmiusGeometry.offsetA}
              onChange={setOffsetA}
              min={defaultOffsetA.min}
              max={defaultOffsetA.max}
              step={defaultOffsetA.step}
            />
          </div>
          <div key='offsetB'>
            <span>{'Offset B'}</span>
            <SliderWrapper
              value={malcolmiusGeometry.offsetB}
              onChange={setOffsetB}
              min={defaultOffsetB.min}
              max={defaultOffsetB.max}
              step={defaultOffsetB.step}
            />
          </div>
          <div key='innerRadius'>
            <span>{'Inner Radius'}</span>
            <SliderWrapper
              value={malcolmiusGeometry.innerRadius}
              onChange={setInnerRadius}
              min={defaultInnerRadius.min}
              max={defaultInnerRadius.max}
              step={defaultInnerRadius.step}
            />
          </div>
        </Form>
      );
  }
};

const InputDrawer: React.FC<IInputProps> = ({ extrusionProfile, malcolmiusGeometry, setExtrusionProfile, setMalcolmiusGeometry }) => {
  const [showDrawer, setShowDrawer] = useState<boolean>(false);

  return (
    <>
      <Button style={inputButtonStyle} onClick={() => setShowDrawer(!showDrawer)}>
        Toggle Drawer
      </Button>
      <Drawer onClose={() => setShowDrawer(false)} open={showDrawer} placement='left'>
        <ExtrusionRenderer extrusionProfile={extrusionProfile} setExtrusionProfile={setExtrusionProfile} />
        <GeometryRenderer malcolmiusGeometry={malcolmiusGeometry} setMalcolmiusGeometry={setMalcolmiusGeometry} />
      </Drawer>
    </>
  );
};

const updateType = (extrusionProfile: ExtrusionProfile): ExtrusionProfile => {
  const newType = Object.keys(DEFAULT_PROFILE_TYPES)[Object.keys(DEFAULT_PROFILE_TYPES).length * Math.random()] as ExtrusionProfileType;
  return { ...DEFAULT_PROFILE_TYPES[newType], ...extrusionProfile, type: newType } as ExtrusionProfile;
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
      extrusionProfile.radius = helperMethodUpdateValues(defaultRadius);
    }

    setExtrusionProfile(extrusionProfileCopy);
  };

  <Button onClick={generateAndSetWithRandomNumber}>Generate Random Number</Button>;

  return (
    <Button style={inputButtonStyle} onClick={generateAndSetWithRandomNumber}>
      Generate
    </Button>
  );
};

export const InputRenderer: React.FC<IInputProps> = (props) => {
  const [fullControl, activateFullControl] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);

  console.log(props);

  return (
    <>
      <Switch style={{ position: 'fixed', left: 10, top: 10 }} value={fullControl} onChange={() => activateFullControl(!fullControl)} />
      {fullControl ? <Button onClick={() => setShowDrawer(!showDrawer)}>Toggle Drawer</Button> : <RandomNumberGenerator {...props} />}
      {fullControl ? <InputDrawer {...props} /> : null}
    </>
  );
};
