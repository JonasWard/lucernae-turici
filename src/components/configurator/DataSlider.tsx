import React from 'react';

interface IDataSliderProps {
  urls: string[];
  setData: (value: number) => void;
}

export const DataSlider: React.FC<IDataSliderProps> = ({ urls, setData }) => {
  return <div>SLider</div>;
};
