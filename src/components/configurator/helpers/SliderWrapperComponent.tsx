import { Slider } from 'antd';
import React, { ReactNode } from 'react';

export const SliderWrapper: React.FC<{
  icon: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  precision: number;
}> = ({ value, onChange, min, max, step, icon, precision }) =>
  value || value === 0 ? (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        <div>{icon}</div>
        <div>{value.toFixed(precision >= 0 ? precision : 0)}</div>
      </div>
      <Slider style={{ width: '100%', margin: '5px 0' }} value={value} onChange={onChange} min={min} max={max} step={step} />
    </div>
  ) : (
    <span>Value is not valid</span>
  );
