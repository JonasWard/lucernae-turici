import React from 'react';
import { RenderMethod } from '../../geometryGeneration/geometryEntry';
import { Button, Select, Switch } from 'antd';
import { DisplayType, getDisplayType } from './semantics/SemanticsRenderObject';
import { ViewWrapper } from './semantics/ViewWrapper';
import { MaterialFactory, MaterialUUIDColorStates } from '../../geometryGeneration/materialFactory';
import { SemanticlyNestedDataEntry } from '../../urlAsState/types/semanticlyNestedDataEntry';
import { exportOBJ, exportSTL } from '../../geometryGeneration/export/fileHandling';
import { getURLForData } from '../../urlAsState/objectmap/versionReading';
import { Scene } from '@babylonjs/core';

type IViewPortSettingsProps = {
  activeName: string;
  setActiveName: (s: string) => void;
  renderMethod: RenderMethod;
  setRenderMethod: (renderMethod: RenderMethod) => void;
  setRerender: (rerender: boolean) => void;
  sliderInput: boolean;
  setSliderInput: (sliderInput: boolean) => void;
  displayTypeMap?: { [key: string]: DisplayType };
  disabled?: string[];
  data: SemanticlyNestedDataEntry;
  scene: Scene | null;
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
  disabled = [],
  data,
  scene,
}) => (
  <ViewWrapper
    displayType={displayTypeMap ? getDisplayType('settings', displayTypeMap) : DisplayType.POPOVER}
    name={'settings'}
    activeName={activeName}
    setActiveName={setActiveName}
    disabled={disabled}
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
    {scene && renderMethod === RenderMethod.NORMAL ? (
      <div style={{ padding: '8px' }}>
        <Button onClick={() => exportSTL(scene, getURLForData(data))}>Download STL</Button>
      </div>
    ) : null}
    {scene && renderMethod === RenderMethod.NORMAL ? (
      <div style={{ padding: '8px' }}>
        <Button onClick={() => exportOBJ(scene, getURLForData(data))}>Download OBJ</Button>
      </div>
    ) : null}
  </ViewWrapper>
);
