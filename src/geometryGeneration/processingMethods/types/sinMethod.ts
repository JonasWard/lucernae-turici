import { ProcessingMethodCategory } from './processingMethodCategory';

export type SinMethod = {
  type: ProcessingMethodCategory.Sin;
  absolute?: boolean;
  max: number;
  min: number;
  period: number;
  phaseShift: number;
};
