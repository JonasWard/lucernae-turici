import { Form, Select } from 'antd';
import { ExtrusionProfileType, ExtrusionProfile } from '../../geometryGeneration/baseGeometry';
import { SliderWrapper } from '../helpers/SliderWrapperComponent';
import { DEFAULT_PROFILE_TYPES } from './GeometryParentComponent';

interface IExtrusionProfileInputProps {
  extrusionProfile: ExtrusionProfile;
  setExtrusionProfile: (profile: ExtrusionProfile) => void;
}

const UpdateExtrusionTypeComponent: React.FC<{ type: ExtrusionProfileType; updateType: (type: ExtrusionProfileType) => void }> = ({ type, updateType }) => (
  <Select onChange={updateType} style={{ width: '100%' }} value={type}>
    {[ExtrusionProfileType.Arc, ExtrusionProfileType.Ellipse, ExtrusionProfileType.Square].map((v) => (
      <Select.Option key={v} value={v}>
        {v}
      </Select.Option>
    ))}
  </Select>
);

export const defaultInsetBottom = { min: 1, max: 40, int: false, step: 1 };
export const defaultInsetTop = { min: 1, max: 40, int: false, step: 1 };
export const defaultInsetSides = { min: 1, max: 40, int: false, step: 1 };
export const defaultRadiusTop = { min: 1, max: 40, int: false, step: 1 };
export const defaultRadius = { min: 1, max: 40, int: false, step: 1 };

export const ExtrusionRenderer: React.FC<IExtrusionProfileInputProps> = ({ extrusionProfile, setExtrusionProfile }) => {
  const setInsetBottom = (value: number) => setExtrusionProfile({ ...extrusionProfile, insetBottom: value });
  const setInsetTop = (value: number) => setExtrusionProfile({ ...extrusionProfile, insetTop: value });
  const setInsetSides = (value: number) => setExtrusionProfile({ ...extrusionProfile, insetSides: value });
  const updateType = (type: ExtrusionProfileType) => setExtrusionProfile({ ...DEFAULT_PROFILE_TYPES[type], ...extrusionProfile, type } as ExtrusionProfile);

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
