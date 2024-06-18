import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DisplayType, SemanticsRenderObject } from './components/semantics/SemanticsRenderObject';
import { dataObjectAsUrl, getDefaultObject, getValueObjectFrom, readingUrlAsDataObject } from './urlAsState/objectmap/versionReading';
import { updateDataEntry } from './urlAsState/objectmap/versionUpdate';
import { globalDataAttributeMapper, parserObjects } from './urlAsState/test/semanticlyNestedDataTest';
import { SemanticlyNestedDataEntry } from './urlAsState/types/semanticlyNestedDataEntry';
import { DataEntry } from './urlAsState/types/dataEntry';
import { Button, Select } from 'antd';
import App from './App';
import { GeometryBaseData } from './geometryGeneration/baseGeometry';
import { RenderMethod } from './geometryGeneration/geometryEntry';

const displayTypeMap = {
  ['extrusion']: DisplayType.POPOVER,
  ['footprint']: DisplayType.POPOVER,
  ['heights']: DisplayType.POPOVER,
  ['heightProcessingMethod']: DisplayType.NESTED,
};

const tryParse = (s: string): SemanticlyNestedDataEntry => {
  try {
    return readingUrlAsDataObject(s, parserObjects);
  } catch (e) {
    console.warn(e);
    const data = getDefaultObject(parserObjects[0], 0);
    return data;
  }
};

export const LampConfigurator: React.FC = () => {
  const { stateString } = useParams();
  const [rerender, setRerender] = useState<boolean>(false);
  const [lastURLFromData, setLastURLFromData] = useState<string>('');
  const [renderMethod, setRenderMethod] = useState<RenderMethod>(RenderMethod.NORMAL);

  const updateURLFromData = (data: SemanticlyNestedDataEntry) => {
    const newUrl = dataObjectAsUrl(data, parserObjects);
    window.history.replaceState(null, 'Same Page Title', `/para-slim-shady/#configurator/${newUrl}`);
    if (lastURLFromData !== newUrl) setRerender(true);
    setLastURLFromData(newUrl);
  };

  const [data, setData] = useState<SemanticlyNestedDataEntry>(tryParse(stateString ?? '0'));

  const [activeName, setActiveName] = useState<string>('');

  const updateData = (dataEntry: DataEntry) => setData(updateDataEntry(data, dataEntry, parserObjects));

  useEffect(() => {
    updateURLFromData(data);
  }, [data]);

  const resetData = (versionNumber: number) => setData(getDefaultObject(parserObjects[versionNumber], versionNumber));

  return (
    <>
      <App
        gBD={getValueObjectFrom(data, globalDataAttributeMapper) as unknown as GeometryBaseData}
        rerender={rerender}
        completedRerender={() => setRerender(false)}
        renderMethod={renderMethod}
      />
      <div>
        <div style={{ position: 'absolute', top: 0, right: 0, padding: 15, width: 120 }}>
          <SemanticsRenderObject
            semantics={data}
            name={''}
            updateEntry={updateData}
            versionEnumSemantics={parserObjects[0].versionEnumSemantics}
            activeName={activeName}
            setActiveName={setActiveName}
            displayTypeMap={displayTypeMap}
            updateVersion={(versionNumber) => resetData(versionNumber)}
          />
          <Select
            style={{ width: '100%' }}
            options={Object.entries(RenderMethod).map(([key, s]) => ({ label: key, value: s as RenderMethod }))}
            onSelect={(s: RenderMethod) => {
              setRerender(true);
              setRenderMethod(s);
            }}
          />
        </div>
      </div>
    </>
  );
};
