import { FootprintCategory } from './footprintCategory';

export interface MalculmiusOneFootprint {
  type: FootprintCategory.MalculmiusOne;
  circleRadius: number;
  circleDivisions: number;
  angleSplit: number;
  offsetA: number;
  offsetB: number;
  innerRadius: number;
}
