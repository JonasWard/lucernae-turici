import { InputNumber } from 'antd';
import { IntDescriptionWithValueType } from '../../../urlAsState/types/dataEntry';
import { IconRenderer } from '../IconRenderer';
import React from 'react';

export interface IIntDataEntryRendererProps {
  int: IntDescriptionWithValueType;
  onChange: (newValue: IntDescriptionWithValueType) => void;
  customMin?: number;
  customMax?: number;
}

export const IntDataEntryRenderer: React.FC<IIntDataEntryRendererProps> = ({ int, onChange, customMax, customMin }) => (
  <InputNumber
    addonBefore={<IconRenderer name={int.name} type={int.type} size={20} />}
    value={int.value}
    min={customMin ?? int.min}
    max={customMax ?? int.max}
    onChange={(value) => value && onChange({ ...int, value })}
    precision={0}
  />
);
