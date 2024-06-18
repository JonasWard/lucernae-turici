import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DisplayType, SemanticsRenderObject } from './components/semantics/SemanticsRenderObject';
import { dataObjectAsUrl, getDefaultObject, readingUrlAsDataObject } from './urlAsState/objectmap/versionReading';
import { updateDataEntry } from './urlAsState/objectmap/versionUpdate';
import { parserObjects } from './urlAsState/test/semanticlyNestedDataTest';
import { SemanticlyNestedDataEntry } from './urlAsState/types/semanticlyNestedDataEntry';
import { DataEntry } from './urlAsState/types/dataEntry';
import { Button } from 'antd';

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
  const [lastURLFromData, setLastURLFromData] = useState<string>('');

  const updateURLFromData = (data: SemanticlyNestedDataEntry) => {
    const newUrl = dataObjectAsUrl(data, parserObjects);
    window.history.replaceState(null, 'Same Page Title', `/configurator/${newUrl}`);
    setLastURLFromData(newUrl);
  };

  const [data, setData] = useState<SemanticlyNestedDataEntry>(tryParse(stateString ?? '0'));

  const [activeName, setActiveName] = useState<string>('');

  const updateData = (dataEntry: DataEntry) => setData(updateDataEntry({ ...data }, dataEntry, parserObjects));

  useEffect(() => {
    updateURLFromData(data);
  }, [data]);

  const resetData = () => setData(getDefaultObject(parserObjects[0], 0));

  return (
    <div>
      <div>LampConfigurator</div>
      <div>urlString string: {stateString}</div>
      <div>lastURLFromData : {lastURLFromData}</div>
      <Button onClick={resetData}>reset data</Button>
      <div style={{ position: 'absolute', top: 0, right: 0, padding: 50, width: 120 }}>
        <SemanticsRenderObject
          semantics={data}
          name={''}
          updateEntry={updateData}
          versionEnumSemantics={parserObjects[0].versionEnumSemantics}
          activeName={activeName}
          setActiveName={setActiveName}
          displayTypeMap={displayTypeMap}
        />
      </div>
    </div>
  );
};
