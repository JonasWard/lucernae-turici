import { VersionDescriptionWithValueType } from '../types/dataEntry';

export const updateValue = (original: VersionDescriptionWithValueType, update: VersionDescriptionWithValueType): VersionDescriptionWithValueType => {
  const value = Math.min(original.bits ** 2 - 1, update.value);

  return {
    ...original,
    value,
  };
};
