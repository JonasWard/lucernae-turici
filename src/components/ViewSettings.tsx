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
    <div style={{ width: '100%', padding: 8 }}>
      <Select
        style={{ width: 'calc(100% - 16px)' }}
        value={renderMethod}
        options={Object.entries(RenderMethod).map(([key, s]) => ({ label: key, value: s as RenderMethod }))}
        onSelect={(s: RenderMethod) => {
          setRerender(true);
          setRenderMethod(s);
        }}
      />
    </div>
    <div style={{ width: '100%', padding: 8 }}>
      <Switch
        checkedChildren={'slider'}
        unCheckedChildren={'numeric'}
        style={{ width: 'calc(100% - 16px)' }}
        value={sliderInput}
        onChange={(s) => setSliderInput(s)}
      />
    </div>
  </PopoverWrapper>
);
