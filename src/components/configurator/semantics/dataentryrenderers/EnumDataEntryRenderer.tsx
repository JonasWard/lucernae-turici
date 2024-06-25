import { Select } from 'antd';
import { EnumDescriptionWithValueType } from '../../../../urlAsState/types/dataEntry';
import React from 'react';
import { VersionEnumSemantics } from '../../../../urlAsState/types/versionParser';
import { IconRenderer } from '../IconRenderer';

export interface IEnumDataEntryRendererProps {
  enumValue: EnumDescriptionWithValueType;
  onChange: (newValue: EnumDescriptionWithValueType) => void;
  versionEnumSemantics?: VersionEnumSemantics;
}

const defaultSelectorValues = (max: number, key: string) => [...Array(max).keys()].map((i) => ({ value: i, label: `${key} ${i}` }));

export const EnumDataEntryRenderer: React.FC<IEnumDataEntryRendererProps> = ({ enumValue, onChange, versionEnumSemantics }) => {
  const options = ((versionEnumSemantics && versionEnumSemantics[enumValue.name]) ?? defaultSelectorValues(enumValue.max, enumValue.name)).map((v) => ({
    ...v,
    label: <IconRenderer name={v.label} />,
  }));

  return <Select style={{ width: '100%' }} options={options} value={enumValue.value} onSelect={(value) => onChange({ ...enumValue, value })} />;
};
