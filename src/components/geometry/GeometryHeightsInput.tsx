import React from 'react';
import { SliderWrapper } from '../helpers/SliderWrapperComponent';
import { ProcessingMethodRenderer } from './GeometryProcessingMethodInput';
import { HeightGenerator, ProcessingMethods } from '../../geometryGeneration/geometry';

const defaultstoryCount = { min: 1, max: 12, step: 1, int: true };
const defaultbaseHeight = { min: 20, max: 200, step: 1, int: false };

export const HeightsRenderer: React.FC<{ heights: HeightGenerator; setHeights: (heights: HeightGenerator) => void }> = ({ heights, setHeights }) => {
  const setStoryCount = (value: number) => setHeights({ ...heights, storyCount: value });
  const setBaseHeight = (value: number) => setHeights({ ...heights, baseHeight: value });
  const setMethod = (method: ProcessingMethods) => setHeights({ ...heights, method: { ...heights.method, ...method } as ProcessingMethods });

  return (
    <>
      <h3>{'Heights'}</h3>
      <div key='storyCount'>
        <span>{'Story Count'}</span>
        <SliderWrapper
          value={heights.storyCount}
          onChange={setStoryCount}
          min={defaultstoryCount.min}
          max={defaultstoryCount.max}
          step={defaultstoryCount.step}
        />
      </div>
      <div key='baseHeight'>
        <span>{'Base Height'}</span>
        <SliderWrapper
          value={heights.baseHeight}
          onChange={setBaseHeight}
          min={defaultbaseHeight.min}
          max={defaultbaseHeight.max}
          step={defaultbaseHeight.step}
        />
      </div>
      <div key='method'>
        <span>{'Method'}</span>
        <ProcessingMethodRenderer method={heights.method} updateMethod={setMethod} />
      </div>
    </>
  );
};
