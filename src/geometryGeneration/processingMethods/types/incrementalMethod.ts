import { ProcessingMethodCategory } from './processingMethodCategory';

export type IncrementalMethod = {
  type: ProcessingMethodCategory.IncrementalMethod;
  total: number;
  angle: number;
};
