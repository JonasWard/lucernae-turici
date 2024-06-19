import { Select } from 'antd';
import { MalculmiusGeometryType, Malculmiuses } from '../../geometryGeneration/geometry';
import React from 'react';

export const UpdateGeometryTypeComponent: React.FC<{ type: MalculmiusGeometryType; updateType: (type: MalculmiusGeometryType) => void }> = ({
  type,
  updateType,
}) => (
  <Select onChange={updateType} style={{ width: '100%' }} value={type}>
    {[Malculmiuses.One].map((v) => (
      <Select.Option key={v} value={v}>
        {v}
      </Select.Option>
    ))}
  </Select>
);
