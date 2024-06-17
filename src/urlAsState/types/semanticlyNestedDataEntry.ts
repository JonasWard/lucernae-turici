import { DataDescription, DataEntry } from './dataEntry';

export type SemanticlyNestedDataEntry = {
  [key: string]: SemanticlyNestedDataEntry | DataEntry;
};

export type SemanticlyNestedDataDescription = {
  [key: string]: SemanticlyNestedDataDescription | DataDescription;
};
