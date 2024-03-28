import { Form, Select, Switch } from 'antd';
import { ProcessingMethods, ProcessingMethodType, DEFAULT_PROCESSING_METHODS } from '../../geometryGeneration/voxelComplex';
import { SliderWrapper } from '../helpers/SliderWrapperComponent';

const defaulttotal = { min: 0, max: 20, step: 0.1, int: false };
const defaultmax = { min: 0.1, max: 3, step: 0.01, int: false };
const defaultmin = { min: 0.1, max: 2, step: 0.01, int: false };
const defaultperiod = { min: 0.1, max: 10, step: 0.1, int: false };
const defaultphaseShift = { min: 10, max: 100, step: 0.1, int: false };

const UpdateProcessingMethodTypeComponent: React.FC<{ type: ProcessingMethodType; updateType: (type: ProcessingMethodType) => void }> = ({
  type,
  updateType,
}) => (
  <Select onChange={updateType} style={{ width: '100%' }} value={type}>
    {[ProcessingMethodType.None, ProcessingMethodType.IncrementalMethod, ProcessingMethodType.Sin].map((v) => (
      <Select.Option key={v} value={v}>
        {v}
      </Select.Option>
    ))}
  </Select>
);

export const ProcessingMethodRenderer: React.FC<{ method: ProcessingMethods; updateMethod: (newMethod: ProcessingMethods) => void }> = ({
  method,
  updateMethod,
}) => {
  const updateType = (type: ProcessingMethodType) => updateMethod({ ...method, ...DEFAULT_PROCESSING_METHODS[type] } as ProcessingMethods);

  switch (method.type) {
    case ProcessingMethodType.None:
      return <UpdateProcessingMethodTypeComponent type={method.type} updateType={updateType} />;
    case ProcessingMethodType.IncrementalMethod:
      const setTotal = () => updateMethod({ ...method, total: !method.total });
      const setAngle = (value: number) => updateMethod({ ...method, angle: value });

      return (
        <Form>
          <div key='incrementMethod'>
            <UpdateProcessingMethodTypeComponent type={method.type} updateType={updateType} />
            <span>Total Height</span>
            <Switch value={method.total} onChange={setTotal} />
            <span>Angle</span>
            <SliderWrapper value={method.angle} onChange={setAngle} min={defaulttotal.min} max={defaulttotal.max} step={defaulttotal.step} />
          </div>
        </Form>
      );
    case ProcessingMethodType.Sin:
      const setmax = (value: number) => updateMethod({ ...method, max: value });
      const setmin = (value: number) => updateMethod({ ...method, min: value });
      const setperiod = (value: number) => updateMethod({ ...method, period: value });
      const setphaseShift = (value: number) => updateMethod({ ...method, phaseShift: value });

      return (
        <Form>
          <div key='incrementMethod'>
            <UpdateProcessingMethodTypeComponent type={method.type} updateType={updateType} />
            <SliderWrapper value={method.max} onChange={setmax} min={defaultmax.min} max={defaultmax.max} step={defaultmax.step} />
            <span>Min</span>
            <SliderWrapper value={method.min} onChange={setmin} min={defaultmin.min} max={defaultmin.max} step={defaultmin.step} />
            <span>Period</span>
            <SliderWrapper value={method.period} onChange={setperiod} min={defaultperiod.min} max={defaultperiod.max} step={defaultperiod.step} />
            <span>Phase Shift</span>
            <SliderWrapper
              value={method.phaseShift}
              onChange={setphaseShift}
              min={defaultphaseShift.min}
              max={defaultphaseShift.max}
              step={defaultphaseShift.step}
            />
          </div>
        </Form>
      );
  }
};
