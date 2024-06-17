import { BooleanDescriptionWithValueType } from '../../../urlAsState/types/dataEntry';
import { IconRenderer } from '../IconRenderer';
import React from 'react';
import Checkbox from 'antd/es/checkbox/Checkbox';

export interface IBooleanDataEntryRendererProps {
  bool: BooleanDescriptionWithValueType;
  onChange: (newValue: BooleanDescriptionWithValueType) => void;
}

export const BooleanDataEntryRenderer: React.FC<IBooleanDataEntryRendererProps> = ({ bool, onChange }) => (
  <span>
    <IconRenderer name={bool.name} type={bool.type} size={0} />
    <Checkbox value={bool.value} onChange={() => onChange({ ...bool, value: !bool.value })} />
  </span>
);
