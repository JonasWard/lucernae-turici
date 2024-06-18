import { Select } from 'antd';
import { VersionDescriptionWithValueType } from '../../../urlAsState/types/dataEntry';
import React from 'react';
import { VersionEnumSemantics } from '../../../urlAsState/types/versionParser';
import { IconRenderer } from '../IconRenderer';

export interface IVersionDataEntryRendererProps {
  version: VersionDescriptionWithValueType;
  onChange: (newValue: VersionDescriptionWithValueType) => void;
  versionEnumSemantics?: VersionEnumSemantics;
}

const defaultSelectorValues = (max: number, key: string) => [...Array(max).keys()].map((i) => ({ value: i, label: `${key} ${i}` }));

export const VersionDataEntryRenderer: React.FC<IVersionDataEntryRendererProps> = ({ version, onChange, versionEnumSemantics }) => {
  const options = ((versionEnumSemantics && versionEnumSemantics[version.name]) ?? defaultSelectorValues(2 ** version.bits, version.name)).map((v) => ({
    ...v,
    label: <IconRenderer name={v.label} />,
  }));

  return <Select style={{ width: '100%' }} options={options} value={version.value} onSelect={(value) => onChange({ ...version, value })} />;
};
