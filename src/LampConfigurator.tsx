import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DisplayType, SemanticsRenderObject } from './components/semantics/SemanticsRenderObject';
import { dataObjectAsUrl, getDefaultObject, getValueObjectFrom, readingUrlAsDataObject } from './urlAsState/objectmap/versionReading';
import { updateDataEntry } from './urlAsState/objectmap/versionUpdate';
import { globalDataAttributeMapper, parserObjects } from './urlAsState/test/semanticlyNestedDataTest';
import { SemanticlyNestedDataEntry } from './urlAsState/types/semanticlyNestedDataEntry';
import { DataEntry } from './urlAsState/types/dataEntry';
import App, { BABYLON_CANVAS_ID } from './App';
import { GeometryBaseData } from './geometryGeneration/baseGeometry';
import { RenderMethod } from './geometryGeneration/geometryEntry';
import { UndoRedo } from './components/semantics/UndoRedo';
import { ViewSettings } from './components/ViewSettings';

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
  const [sliderInput, setSliderInput] = useState<boolean>(true);
  const [rerender, setRerender] = useState<boolean>(false);
  const [lastURLFromData, setLastURLFromData] = useState<string>('');
  const [renderMethod, setRenderMethod] = useState<RenderMethod>(RenderMethod.NORMAL);
  const [activeName, setActiveName] = useState<string>('');

  const updateURLFromData = (data: SemanticlyNestedDataEntry) => {
    const newUrl = dataObjectAsUrl(data, parserObjects);
    window.history.replaceState(null, 'Same Page Title', `/para-slim-shady/#configurator/${newUrl}`);
    if (lastURLFromData !== newUrl) setRerender(true);
    setLastURLFromData(newUrl);
  };

  const [data, setData] = useState<SemanticlyNestedDataEntry>(tryParse(stateString ?? ''));

  const tryToHandelUndoRedo = (url: string) => {
    try {
      setData(readingUrlAsDataObject(url, parserObjects));
    } catch (e) {
      console.warn(e);
    }
  };

  const updateData = (dataEntry: DataEntry) => setData(updateDataEntry(data, dataEntry, parserObjects));

  useEffect(() => {
    updateURLFromData(data);
  }, [data]);

  const resetData = (versionNumber: number) => setData(getDefaultObject(parserObjects[versionNumber], versionNumber));

  return (
    <>
      <App
        setActiveName={setActiveName}
        gBD={getValueObjectFrom(data, globalDataAttributeMapper) as unknown as GeometryBaseData}
        rerender={rerender}
        completedRerender={() => setRerender(false)}
        renderMethod={renderMethod}
      />
      <div style={{ position: 'absolute', top: 0, right: 0, padding: 8 }}>
        <SemanticsRenderObject
          asSlider={sliderInput}
          semantics={data}
          name={''} // name is not used in this context
          updateEntry={updateData}
          versionEnumSemantics={parserObjects[0].versionEnumSemantics}
          activeName={activeName}
          setActiveName={setActiveName}
          displayTypeMap={displayTypeMap}
          updateVersion={(versionNumber) => resetData(versionNumber)}
        />
        <ViewSettings
          activeName={activeName}
          setActiveName={setActiveName}
          renderMethod={renderMethod}
          setRerender={setRerender}
          sliderInput={sliderInput}
          setSliderInput={setSliderInput}
          setRenderMethod={setRenderMethod}
        />
      </div>
      <UndoRedo activeUrl={lastURLFromData} setActiveUrl={tryToHandelUndoRedo} />
    </>
  );
};
