import { Form } from 'antd';
import { MalculmiusGeometryType, MalculmiusGeometry, HeightGenerator, ProcessingMethods, Malculmiuses } from '../../geometryGeneration/voxelComplex';
import { DEFAULT_GEOMETRY_TYPES } from './GeometryParentComponent';
import { SliderWrapper } from '../helpers/SliderWrapperComponent';
import { UpdateGeometryTypeComponent } from './GeometryTypeInput';
import { HeightsRenderer } from './GeometryHeightsInput';
import { PostProcessingRenderer } from './GeometryPostProcessing';

const defaultCircleRadius = { min: 50, max: 250, int: false, step: 1 };
const defaultCircleDivisions = { min: 3, max: 10, int: true, step: 1 };
const defaultAngleSplit = { min: 0, max: 1, int: false, step: 0.01 };
const defaultOffsetA = { min: -100, max: 100, int: false, step: 1 };
const defaultOffsetB = { min: -100, max: 100, int: false, step: 1 };
const defaultInnerRadius = { min: 0, max: 100, int: false, step: 1 };

interface IGeometryInputProps {
  malcolmiusGeometry: MalculmiusGeometry;
  setMalcolmiusGeometry: (m: MalculmiusGeometry) => void;
}

export const GeometryRenderer: React.FC<IGeometryInputProps> = ({ malcolmiusGeometry, setMalcolmiusGeometry }) => {
  const setCircleRadius = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, circleRadius: value });
  const setCircleDivisions = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, circleDivisions: value });
  const setAngleSplit = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, angleSplit: value });
  const setOffsetA = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, offsetA: value ?? 0 });
  const setOffsetB = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, offsetB: value ?? 0 });
  const setInnerRadius = (value: number) => setMalcolmiusGeometry({ ...malcolmiusGeometry, innerRadius: value });

  const updateType = (type: MalculmiusGeometryType) =>
    setMalcolmiusGeometry({ ...DEFAULT_GEOMETRY_TYPES[type], ...malcolmiusGeometry, type } as MalculmiusGeometry);

  const updateHeights = (heights: HeightGenerator) => setMalcolmiusGeometry({ ...malcolmiusGeometry, heights });
  const updatePostProcessing = (postProcessing: { twist: ProcessingMethods; skew: ProcessingMethods }) =>
    setMalcolmiusGeometry({ ...malcolmiusGeometry, postProcessing });

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
          <HeightsRenderer heights={malcolmiusGeometry.heights} setHeights={updateHeights} />
          <PostProcessingRenderer postProcessing={malcolmiusGeometry.postProcessing} setPostProcessing={updatePostProcessing} />
        </Form>
      );
  }
};
