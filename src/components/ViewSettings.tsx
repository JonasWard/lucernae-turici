import React from 'react';
import { RenderMethod } from '../geometryGeneration/geometryEntry';
import { Select, Switch } from 'antd';
import { DisplayType, getDisplayType } from './semantics/SemanticsRenderObject';
import { ViewWrapper } from './ViewWrapper';
import { MaterialFactory, MaterialUUIDColorStates } from '../geometryGeneration/materialFactory';

type IViewPortSettingsProps = {
  activeName: string;
  setActiveName: (s: string) => void;
  renderMethod: RenderMethod;
  setRenderMethod: (renderMethod: RenderMethod) => void;
  setRerender: (rerender: boolean) => void;
  sliderInput: boolean;
  setSliderInput: (sliderInput: boolean) => void;
  displayTypeMap?: { [key: string]: DisplayType };
};

export const ViewSettings: React.FC<IViewPortSettingsProps> = ({
  activeName,
  setActiveName,
  renderMethod,
  setRenderMethod,
  setRerender,
  sliderInput,
  setSliderInput,
  displayTypeMap,
}) => (
  <ViewWrapper
    displayType={displayTypeMap ? getDisplayType('settings', displayTypeMap) : DisplayType.POPOVER}
    name={'settings'}
    activeName={activeName}
    setActiveName={setActiveName}
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
    <div style={{ padding: '8px' }}>
      <Select
        style={{ width: '100%' }}
        value={MaterialFactory.UUIDColorOptions}
        options={Object.values(MaterialUUIDColorStates).map((s) => ({ label: s, value: s as MaterialUUIDColorStates }))}
        onSelect={(s: MaterialUUIDColorStates) => {
          MaterialFactory.UUIDColorOptions = s;
          setRerender(true);
        }}
      />
    </div>
  </ViewWrapper>
);
