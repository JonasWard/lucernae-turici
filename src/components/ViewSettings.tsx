import React from 'react';
import { RenderMethod } from '../geometryGeneration/geometryEntry';
import { PopoverWrapper } from './PopoverWrapper';
import { Select, Switch } from 'antd';
import { IconRenderer, getIconForKey } from './semantics/IconRenderer';

type IViewPortSettingsProps = {
  activeName: string;
  setActiveName: (s: string) => void;
  renderMethod: RenderMethod;
  setRenderMethod: (renderMethod: RenderMethod) => void;
  setRerender: (rerender: boolean) => void;
  sliderInput: boolean;
  setSliderInput: (sliderInput: boolean) => void;
};

export const ViewSettings: React.FC<IViewPortSettingsProps> = ({
  activeName,
  setActiveName,
  renderMethod,
  setRenderMethod,
  setRerender,
  sliderInput,
  setSliderInput,
}) => (
  <PopoverWrapper
    open={activeName === 'settings'}
    toggleOpen={(b: boolean) => setActiveName(b ? 'settings' : '')}
    title={<IconRenderer name={'settings'} />}
    buttonIcon={<IconRenderer name={'settings'} noName />}
  >
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%' }}
        value={renderMethod}
        options={Object.entries(RenderMethod).map(([key, s]) => ({ label: key, value: s as RenderMethod }))}
        onSelect={(s: RenderMethod) => {
          setRerender(true);
          setRenderMethod(s);
        }}
      />
    </div>
    <div style={{ padding: '8px' }}>
      <Switch checkedChildren={'slider'} unCheckedChildren={'numeric'} value={sliderInput} onChange={(s) => setSliderInput(s)} />
    </div>
  </PopoverWrapper>
);
