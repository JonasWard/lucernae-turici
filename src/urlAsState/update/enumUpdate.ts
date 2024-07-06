import { EnumDescriptionWithValueType } from '../types/dataEntry';

export const updateValue = (original: EnumDescriptionWithValueType, update: EnumDescriptionWithValueType): EnumDescriptionWithValueType => {
  const value = Math.min(original.max, update.value);

  return {
    ...original,
    value,
  };
};
