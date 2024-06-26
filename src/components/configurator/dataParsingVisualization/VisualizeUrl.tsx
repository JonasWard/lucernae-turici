import { DataEntryArray } from '../../../urlAsState/types/dataEntry';
import React from 'react';
import { getRelativeValue } from '../../../urlAsState/utils/relativeValue';
import { MaterialFactory } from '../../../geometryGeneration/materialFactory';

interface IVisualizeUrlProps {
  dataArray: DataEntryArray;
  keysPresent: string[];
}

const padding = 0;
const height = 1;

export const VisualizeUrl: React.FC<IVisualizeUrlProps> = ({ dataArray, keysPresent }) => {
  return (
    <div style={{ width: `calc(100% - ${padding * 2}px)`, padding: `0 ${padding}px`, height, display: 'flex', flexDirection: 'row' }}>
      {keysPresent.map((key, i) => {
        const dataEntry = dataArray.find((de) => de.name === key);

        if (!dataEntry) return <div key={i} style={{ width: `${100 / keysPresent.length}%`, height, backgroundColor: '#ff0' }} />;

        const t = getRelativeValue(dataEntry);
        return (
          <div key={i} style={{ width: `${100 / keysPresent.length}%`, height, display: 'flex', flexDirection: 'row' }}>
            <div
              style={{
                backgroundColor: MaterialFactory.getTwilightColorFromUnitValue(1.0 - t * 0.5),
                height,
                width: `${100 * (1 - t)}%`,
              }}
            />
            <div
              style={{
                height,
                width: `${100 * t}%`,
                backgroundColor: MaterialFactory.getTwilightColorFromUnitValue(t * 0.5),
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
