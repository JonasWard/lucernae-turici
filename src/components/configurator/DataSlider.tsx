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

  useEffect(() => {
    if (localVersion === version) return;
    setBaseData(getVersionDataForLerping(version));
    setLocalVersion(version);
  }, [version]);

  const setT = (t: number) => setData(lerpData(t, baseData.baseDataArray, baseData.keyDataArray, version));

  return (
    <div style={{ position: 'absolute', left: 10, top: 130, bottom: 130 }}>
      <Slider min={0} max={1} step={0.001} vertical onChange={(t) => setT(t)}></Slider>
    </div>
  );
};
