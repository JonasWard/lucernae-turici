import React, { useEffect, useState } from 'react';
import { getVersionDataForLerping, lerpData } from '../../urlAsState/utils/spline';
import { SemanticlyNestedDataEntry } from '../../urlAsState/types/semanticlyNestedDataEntry';
import { Slider } from 'antd';

interface IDataSliderProps {
  version: number;
  setData: (value: SemanticlyNestedDataEntry) => void;
}

export const DataSlider: React.FC<IDataSliderProps> = ({ version, setData }) => {
  const [localVersion, setLocalVersion] = useState(version);
  const [baseData, setBaseData] = useState(getVersionDataForLerping(version));
  const [t, setT] = useState(0.5);

  useEffect(() => {
    if (localVersion === version) return;
    setBaseData(getVersionDataForLerping(version));
    setLocalVersion(version);
  }, [version]);

  useEffect(() => {
    const { baseDataArray, keyDataArray } = baseData;
    setData(lerpData(t, baseDataArray, keyDataArray, version));
  }, [t, localVersion]);

  return (
    <div style={{ position: 'absolute', left: 50, top: 50, bottom: 130 }}>
      <Slider min={0} max={1} step={0.001} vertical value={t} onChange={(t) => setT(t)}></Slider>
    </div>
  );
};
