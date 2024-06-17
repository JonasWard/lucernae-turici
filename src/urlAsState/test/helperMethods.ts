import { dataBitsParser, dataBitsStringifier } from '../parsers/parsers';
import { DataEntry } from '../types/dataEntry';

export const toStringTest = (a: DataEntry, s: string) => {
  try {
    const dataString = dataBitsStringifier(a);
    if (dataString !== s) {
      console.error(`value to string test: Expected ${s}, got ${dataString}`);
      console.table(a);
    }
  } catch (e) {
    console.error(e);
    console.table({ string: s, value: a.value });
    console.table(a);
  }
};

export const fromStringTest = (s: string, d: DataEntry) => {
  try {
    const data = dataBitsParser(s, d);
    if (data.value !== d.value) {
      console.error(`string to value test: Expected ${d.value}, got ${data.value}`);
      console.table(d);
    }
  } catch (e) {
    console.error(e);
    console.table({ string: s, value: d.value });
    console.table(d);
  }
};
