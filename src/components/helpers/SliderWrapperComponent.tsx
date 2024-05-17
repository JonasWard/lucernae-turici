import { Slider } from 'antd';
import React from 'react';

export const SliderWrapper: React.FC<{ value: number; onChange: (value: number) => void; min: number; max: number; step: number }> = ({
  value,
  onChange,
  min,
  max,
  step,
}) =>
  value || value === 0 ? (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Slider style={{ width: 400 }} value={value} onChange={onChange} min={min} max={max} step={step} />
      {value.toFixed(2)}
    </div>
  ) : (
    <span>Value is not valid</span>
  );
