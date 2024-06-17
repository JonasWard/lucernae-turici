export const getBitsCount = (): number => 1;

export const rawValueParser = (stateString: string): boolean => {
  if (stateString === '1') return true;
  if (stateString === '0') return false;
  throw new Error('Invalid boolean bit string');
};

export const rawParser = (stateString: string): boolean => rawValueParser(stateString);

export const rawStringifier = (value: boolean): string => (value ? '1' : '0');
