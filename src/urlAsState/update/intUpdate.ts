import { IntDescriptionWithValueType } from '../types/dataEntry';

export const updateValue = (original: IntDescriptionWithValueType, update: IntDescriptionWithValueType): IntDescriptionWithValueType => {
  const value = Math.max(Math.min(update.value, original.max), original.min);

  return {
    ...original,
    value,
  };
};
