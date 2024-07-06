import { BooleanDescriptionWithValueType } from '../types/dataEntry';

export const updateValue = (original: BooleanDescriptionWithValueType, update: BooleanDescriptionWithValueType): BooleanDescriptionWithValueType => ({
  ...original,
  value: update.value,
});
