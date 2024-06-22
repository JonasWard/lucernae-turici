import { InputNumber } from 'antd';
import { IntDescriptionWithValueType } from '../../../../urlAsState/types/dataEntry';
import { IconRenderer } from '../IconRenderer';
import React from 'react';
import { SliderWrapper } from '../../helpers/SliderWrapperComponent';

export interface IIntDataEntryRendererProps {
  int: IntDescriptionWithValueType;
  onChange: (newValue: IntDescriptionWithValueType) => void;
  customMin?: number;
  customMax?: number;
  asSlider?: boolean;
}

export const IntDataEntryRenderer: React.FC<IIntDataEntryRendererProps> = ({ int, onChange, customMax, customMin, asSlider }) =>
  asSlider ? (
    <SliderWrapper
      icon={<IconRenderer name={int.name} type={int.type} size={20} />}
      step={1}
      value={int.value}
      onChange={(value) => onChange({ ...int, value })}
      min={customMin ?? int.min}
      max={customMax ?? int.max}
      precision={0}
    />
  ) : (
    <InputNumber
      addonBefore={<IconRenderer name={int.name} type={int.type} size={20} />}
      value={int.value}
      min={customMin ?? int.min}
      max={customMax ?? int.max}
      onChange={(value) => value !== null && onChange({ ...int, value })}
      precision={0}
    />
  );
