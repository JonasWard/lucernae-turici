import { parseDownNestedDataDescription, parseUrlMethod } from '../../../urlAsState/objectmap/versionReading';
import { parserObjects } from '../../../geometryGeneration/versions/parserObjects';
import { DataEntryArray } from '../../../urlAsState/types/dataEntry';
import React from 'react';
import { getRelativeValue } from '../../../urlAsState/utils/relativeValue';
import { MaterialFactory } from '../../../geometryGeneration/materialFactory';

interface IVisualizeUrlProps {
  dataArray: DataEntryArray;
  keysPresent: string[];
}

const padding = 20;
const height = 3;

export const VisualizeUrl: React.FC<IVisualizeUrlProps> = ({ dataArray, keysPresent }) => {
  return (
    <div style={{ width: `calc(100% - ${padding * 2}px)`, padding: `0 ${padding}px`, height, display: 'flex', flexDirection: 'row' }}>
      {keysPresent.map((key, i) => {
        const dataEntry = dataArray.find((de) => de.name === key);

        if (!dataEntry) return <div key={i} style={{ width: `${100 / keysPresent.length}%`, height, backgroundColor: '#fff' }} />;

        const t = getRelativeValue(dataEntry);
        const widthA = `${100 * (1 - t)}%`;
        const widthB = `${100 * t}%`;
        return (
          <div key={i} style={{ width: `${100 / keysPresent.length}%`, height, display: 'flex', flexDirection: 'row' }}>
            <div
              style={{
                backgroundColor: MaterialFactory.getTwilightColorFromUnitValue(0.5 + t * 0.5),
                height,
                width: widthA,
              }}
            />
            <div
              style={{
                top: 0,
                height,
                width: widthB,
                backgroundColor: MaterialFactory.getTwilightColorFromUnitValue(t * 0.5),
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
