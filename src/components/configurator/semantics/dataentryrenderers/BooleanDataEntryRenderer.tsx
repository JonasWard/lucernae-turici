import { BooleanDescriptionWithValueType } from '../../../../urlAsState/types/dataEntry';
import { IconRenderer } from '../IconRenderer';
import React from 'react';
import Checkbox from 'antd/es/checkbox/Checkbox';

export interface IBooleanDataEntryRendererProps {
  bool: BooleanDescriptionWithValueType;
  onChange: (newValue: BooleanDescriptionWithValueType) => void;
}

export const BooleanDataEntryRenderer: React.FC<IBooleanDataEntryRendererProps> = ({ bool, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    <Checkbox style={{ marginRight: 8 }} checked={bool.value} onChange={() => onChange({ ...bool, value: !bool.value })} />
    <IconRenderer name={bool.name} type={bool.type} size={20} />
  </div>
);
