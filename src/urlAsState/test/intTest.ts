import { DataEntryFactory } from '../factory/factory';
import { toStringTest as generalStringTest, fromStringTest as generalFromStringTest } from './helperMethods';

export const values: [number, number, number, string][] = [
  // [0, 0, 0, '0'], // min
  [0, 0, 1, '0'], // min
  [1, 0, 1, '1'], // max
  [-10, -10, 10, '00000'], // min
  [0, -10, 10, '01010'], // middle
  [10, -10, 10, '10100'], // max
  [0, -10, 10, '01010'], // middle
  [10, -10, 10, '10100'], // max
  [0, 0, 15, '0000'], // min
  [3, 0, 15, '0011'], // min
  [15, 0, 15, '1111'], // min
  [10, 10, 20, '0000'], // min
  [15, 10, 20, '0101'], // middle
  [20, 10, 20, '1010'], // max
  [-10, -10, 20, '00000'], // min
  [20, -10, 20, '11110'], // min
  [-200, -200, 20, '00000000'], // min
  [-100, -200, 20, '01100100'], // middle
  [20, -200, 20, '11011100'], // max
];

export const toStringTest = () => {
  values.forEach(([value, min, max, s]) => {
    generalStringTest(DataEntryFactory.createInt(value, min, max), s);
  });

  values.forEach(([value, min, max, s]) => {
    generalFromStringTest(s, DataEntryFactory.createInt(value, min, max));
  });
};
