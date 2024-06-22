import { InputNumber } from 'antd';
import { FloatDescriptionWithValueType } from '../../../../urlAsState/types/dataEntry';
import { IconRenderer } from '../IconRenderer';
import React from 'react';
import { SliderWrapper } from '../../helpers/SliderWrapperComponent';

export interface IFloatDataEntryRendererProps {
  float: FloatDescriptionWithValueType;
  onChange: (newValue: FloatDescriptionWithValueType) => void;
  customMin?: number;
  customMax?: number;
  asSlider?: boolean;
}

export const FloatDataEntryRenderer: React.FC<IFloatDataEntryRendererProps> = ({ asSlider, float, onChange, customMax, customMin }) =>
  asSlider ? (
    <SliderWrapper
      icon={<IconRenderer name={float.name} type={float.type} size={20} />}
      step={10 ** -float.precision}
      value={float.value}
      onChange={(value) => onChange({ ...float, value })}
      min={customMin ?? float.min}
      max={customMax ?? float.max}
      precision={float.precision}
    />
  ) : (
    <InputNumber
      addonBefore={<IconRenderer name={float.name} type={float.type} size={20} />}
      value={float.value}
      min={customMin ?? float.min}
      max={customMax ?? float.max}
      step={5 * 10 ** -float.precision}
      onChange={(value) => value !== null && onChange({ ...float, value })}
      precision={float.precision}
      status={float.value < float.min || float.value > float.max ? 'error' : float.value === float.min || float.value === float.max ? 'warning' : undefined}
    />
  );
