import { DataEntryFactory } from '../factory/factory';
import { toStringTest as generalStringTest, fromStringTest as generalFromStringTest } from './helperMethods';

export const values: [boolean, string][] = [
  [false, '0'],
  [true, '1'],
];

export const toStringTest = () => {
  values.forEach(([value, s]) => {
    generalStringTest(DataEntryFactory.createBoolean(value), s);
  });

  values.forEach(([value, s]) => {
    generalFromStringTest(s, DataEntryFactory.createBoolean(value));
  });
};
