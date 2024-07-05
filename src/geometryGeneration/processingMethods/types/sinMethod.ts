import { ProcessingMethodCategory } from './processingMethodCategory';

export type SinMethod = {
  type: ProcessingMethodCategory.Sin;
  max: number;
  min: number;
  period: number;
  phaseShift: number;
};
