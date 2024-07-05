import { ProcessingMethodCategory } from './processingMethodCategory';

export type IncrementalMethod = {
  absolute?: boolean;
  type: ProcessingMethodCategory.IncrementalMethod;
  total: number;
  angle: number;
};
