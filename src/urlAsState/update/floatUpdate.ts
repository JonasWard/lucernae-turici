import { FloatDescriptionWithValueType } from '../types/dataEntry';

export const updateValue = (original: FloatDescriptionWithValueType, update: FloatDescriptionWithValueType): FloatDescriptionWithValueType => {
  const value = Math.max(Math.min(update.value, original.max), original.min);

  return {
    ...original,
    value,
  };
};
