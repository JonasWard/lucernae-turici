import * as intTest from './intTest';
import * as booleanTest from './booleanTest';
import * as versionTest from './versionTest';
import * as floatTest from './floatTest';
import { DataEntryFactory } from '../factory/factory';
import { dataArrayStringifier, dataBitsArrayParser } from '../parsers/parsers';

const stringTest = () => {
  intTest.toStringTest();
  booleanTest.toStringTest();
  versionTest.toStringTest();
  floatTest.toStringTest();
};

const dataMap = [
  DataEntryFactory.createVersion(3, 4, 'versionA', 0),
  DataEntryFactory.createVersion(7, 4, 'versionB', 1),
  DataEntryFactory.createVersion(9, 4, 'versionC', 2),
  DataEntryFactory.createInt(0, 0, 10, 'intA', 3),
  DataEntryFactory.createInt(3, 0, 10, 'intB', 4),
  DataEntryFactory.createInt(7, 0, 10, 'intC', 5),
  DataEntryFactory.createFloat(0.1, 0, 10, 1, 'floatA', 3),
  DataEntryFactory.createFloat(0.06, 0, 10, 2, 'floatB', 4),
  DataEntryFactory.createFloat(0.024, 0, 10, 3, 'floatC', 5),
  DataEntryFactory.createBoolean(true, 'boolA', 6),
  DataEntryFactory.createBoolean(false, 'boolB', 7),
];

const valuedStringTest = () => {
  const bitstring = dataArrayStringifier(dataMap);

  const unpacked = dataBitsArrayParser(bitstring, dataMap);

  unpacked.forEach((data, index) => {
    if (dataMap[index].value !== data.value) console.log(data.name, data.value, data.index);
  });
};

export const allTests = () => {
  stringTest();
  valuedStringTest();
};
