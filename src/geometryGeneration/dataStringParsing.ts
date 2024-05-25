// this is a helper method to store a state into an as simple as possible base64 string
// to achieve this, we create an array of numbers with a connected amount of bits assigned to each number in the array
// the first value will be the version number

export enum StateEnum {
  VERSION,
  FLOAT,
  BOOLEAN,
  INT,
}

export interface Version {
  type: StateEnum.VERSION;
  bits: versionRange;
}

type versionRange = 4 | 8 | 10;
type integerBitRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type exponentRange = 0 | 1 | 2 | 3;
type precisionRange = 0 | 1 | 2 | 3;
type significandBits = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

// int max and int min can be any in javascript integer representable valid number
// however, the delta between the two should neve exceed 10 bits or 1024
export interface Int {
  type: StateEnum.INT;
  min: number;
  max: number;
  bits: integerBitRange;
}

// floating points are interpreted as base 10 numbers
// either by the precision or from the min max range of a float, an exponent is derived
// from that, the radix is turned into an integer which, just like with the Int data type, can have a maximum delta between min and max of 1024
// the input component rounds accordingly!
export interface Float {
  type: StateEnum.FLOAT;
  min: number;
  max: number;
  precision: precisionRange;
  significand: significandBits;
  exponent: exponentRange;
}

export interface Boolean {
  type: StateEnum.BOOLEAN;
}

export type DataValue = number | boolean;
export type DataValues = DataValue[];
export type DataEntry = Version | Int | Float | Boolean;
export type DataPattern = DataEntry[];

export interface VersionObject {
  versionName: string;
  dataPattern: DataEntry[];
  defaultValues: DataValues;
  namesMap: { [key: string]: number };
}

export interface VersionMapGenerator {
  [key: number]: {
    generatorMethod: (...args: any[]) => VersionObject;
    baseDefinitions: DataEntry[];
    constructObject: (values: DataValues, versionObject: VersionObject) => Object;
    deconstructObject: (dataObject: Object, versionObject: VersionObject) => DataValues;
  };
}

export class DataToURLFactory {
  public static createVersion = (bits: versionRange = 8): Version => ({ type: StateEnum.VERSION, bits });

  private static getBitsForIntegerNumber = (v: number) => Math.ceil(Math.log2(v));

  public static createInt = (min: number, max: number): Int => {
    if (!Number.isInteger(min) || !Number.isInteger(max)) throw new Error('min and max must be integers');
    if (Math.abs(max - min) > 1023) throw new Error('max - min must be less than 1024');
    const bits = DataToURLFactory.getBitsForIntegerNumber(max - min + 1) as integerBitRange;
    return { type: StateEnum.INT, min, max, bits };
  };

  static getExponentRange = (exponentDelta: number) => {
    if (exponentDelta > 3) return;
  };

  private static getExponentBitsCountForExponent = (deltaExponent: number): exponentRange => {
    if (deltaExponent === 0) return 0;
    if (deltaExponent === -1) return 1;
    if (deltaExponent === -2 || deltaExponent === 1) return 2;
    if (deltaExponent === -4 || deltaExponent === -3 || deltaExponent === 2 || deltaExponent === 3) return 3;
    else throw new Error('you can not have an exponent outside of the range -4 to 3');
  };

  private static getExponentBitsForExponent = (deltaExponent: number, exponentBitsCount: exponentRange): string => {
    switch (exponentBitsCount) {
      case 0:
        return '';
      case 1:
        return (deltaExponent + 1).toString(2);
      case 2:
        return (deltaExponent + 2).toString(2).padStart(2, '0');
      case 3:
        return (deltaExponent + 4).toString(2).padStart(3, '0');
    }
  };

  private static getExponentForBits = (d: string) => {
    switch (d) {
      case '':
      case '1':
      case '10':
      case '100':
        return 0;
      case '0':
      case '01':
      case '011':
        return -1;
      case '00':
      case '010':
        return -2;
      case '11':
      case '101':
        return 1;
      case '000':
        return -4;
      case '001':
        return -3;
      case '110':
        return 2;
      case '111':
        return 3;
      default:
        throw new Error('invalid exponent bits');
    }
  };

  public static createFloat = (min: number, max: number, precision: precisionRange): Float => {
    const delta = max - min;
    const deltaExponent = Math.floor(Math.log10(delta));
    const significatedDelta = delta * 10 ** (precision - deltaExponent);
    const significand = DataToURLFactory.getBitsForIntegerNumber(significatedDelta) as significandBits;
    const exponent = DataToURLFactory.getExponentBitsCountForExponent(deltaExponent);
    return {
      type: StateEnum.FLOAT,
      min,
      max,
      precision,
      significand,
      exponent,
    };
  };
  public static createBoolean = (): Boolean => ({ type: StateEnum.BOOLEAN });

  private static parseIntegerToBits = (v: number, bits: number): string => v.toString(2).padStart(bits, '0').slice(-bits);
  private static parseIntToBits = (v: number, bits: integerBitRange, min: number): string => DataToURLFactory.parseIntegerToBits(v - min, bits);

  private static getSignificantAsBitsForFloat = (v: number, floatEntry: Float): string => {
    const significand = Math.round((v - floatEntry.min) * 10 ** (floatEntry.exponent + floatEntry.precision));
    return DataToURLFactory.parseIntegerToBits(significand, floatEntry.significand);
  };

  private static getExponentAsBitsForFloat = (v: number, floatEntry: Float): string =>
    DataToURLFactory.getExponentBitsForExponent(Math.ceil(Math.log10(v - floatEntry.min)), floatEntry.exponent);

  private static parseFloatToBits = (v: number, floatEntry: Float): string =>
    `${DataToURLFactory.getSignificantAsBitsForFloat(v, floatEntry)}${DataToURLFactory.getExponentAsBitsForFloat(v, floatEntry)}`;

  private static parseToBits = (v: DataValue, d: DataEntry): string => {
    switch (d.type) {
      case StateEnum.VERSION:
        return DataToURLFactory.parseIntegerToBits(v as number, d.bits);
      case StateEnum.INT:
        return DataToURLFactory.parseIntToBits(v as number, d.bits, d.min);
      case StateEnum.FLOAT:
        return DataToURLFactory.parseFloatToBits(v as number, d);
      case StateEnum.BOOLEAN:
        return v ? '1' : '0';
    }
  };

  private static bitLengthForEntry = (entry: DataEntry): number => {
    switch (entry.type) {
      case StateEnum.VERSION:
      case StateEnum.INT:
        return entry.bits;
      case StateEnum.FLOAT:
        return entry.significand + entry.exponent;
      case StateEnum.BOOLEAN:
        return 1;
    }
  };

  private static offsetMapForDataPattern = (pattern: DataPattern): [number, number][] => {
    const offsets = pattern.map((e) => this.bitLengthForEntry(e));
    const slicesArray: [number, number][] = [[0, offsets[0]]];

    for (let i = 1; i < offsets.length; i++) {
      slicesArray.push([slicesArray[i - 1][1], slicesArray[i - 1][1] + offsets[i]]);
    }

    return slicesArray;
  };

  private static getExponentForFloatEntry = (exponentString: string, floatEntry: Float) => {
    const exponent = DataToURLFactory.getExponentForBits(exponentString);
    return exponent - floatEntry.exponent - floatEntry.precision;
  };

  private static parseFloat = (s: string, floatEntry: Float) => {
    const significand = Number.parseInt(s.slice(0, floatEntry.significand), 2);
    const exponent = DataToURLFactory.getExponentForFloatEntry(s.slice(floatEntry.significand, floatEntry.significand + floatEntry.exponent), floatEntry);

    return floatEntry.min + significand * 10 ** exponent;
  };

  public static createUrl = (data: DataValues, pattern: DataPattern): string =>
    DataToURLFactory.parseBitsToBase64(pattern.map((e, i) => DataToURLFactory.parseToBits(data[i], e)).join(''));

  public static deconstructUrl = (url: string, pattern: DataPattern): DataValues => {
    const bits = DataToURLFactory.parseBase64ToBits(url);
    const offsets = DataToURLFactory.offsetMapForDataPattern(pattern);
    return pattern.map((entry, i) => {
      const bitsForEntry = bits.slice(offsets[i][0], offsets[i][1]);
      switch (entry.type) {
        case StateEnum.VERSION:
          return Number.parseInt(bitsForEntry, 2);
        case StateEnum.INT:
          return Number.parseInt(bitsForEntry, 2) + entry.min;
        case StateEnum.FLOAT:
          return DataToURLFactory.parseFloat(bitsForEntry, entry as Float);
        case StateEnum.BOOLEAN:
          return bitsForEntry === '1';
      }
    });
  };

  public static testParse = (n: DataValue, entry: DataEntry) => {
    const bits = DataToURLFactory.parseToBits(n, entry);
    return DataToURLFactory.deconstructUrl(DataToURLFactory.parseBitsToBase64(bits), [entry])[0];
  };

  public static base64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  public static parseBitsToBase64 = (bits: string): string => {
    // split the bits into 6 bit chunks
    const chunks = bits.match(/.{1,6}/g);
    // parse the chunks into numbers
    const numbers = chunks?.map((c) => Number.parseInt(c.padEnd(6, '0'), 2)) ?? [];
    // map the numbers to base64
    return numbers.map((n) => DataToURLFactory.base64map.charAt(n)).join('');
  };

  public static parseBase64ToBits = (base64: string): string => {
    // map the base64 characters to numbers
    const numbers = base64.split('').map((c) => DataToURLFactory.base64map.indexOf(c));
    // parse the numbers into 6 bit chunks
    const chunks = numbers.map((n) => n.toString(2).padStart(6, '0'));
    // join the chunks
    return chunks.join('');
  };

  public static test = () => {
    // DataToURLFactory.createFloat(0, 1, 3);

    const dataMap = [
      DataToURLFactory.createVersion(8),
      DataToURLFactory.createVersion(4),
      DataToURLFactory.createInt(0, 10),
      DataToURLFactory.createBoolean(),
      DataToURLFactory.createBoolean(),
      DataToURLFactory.createInt(0, 100),
      DataToURLFactory.createInt(0, 1000),
      DataToURLFactory.createInt(5000, 6000),
      DataToURLFactory.createFloat(-1, 1, 1),
      DataToURLFactory.createFloat(0, 1, 2),
      DataToURLFactory.createFloat(0, 1, 3),
      DataToURLFactory.createFloat(1, 5, 1),
      DataToURLFactory.createFloat(0, 1, 1),
      DataToURLFactory.createFloat(0, 1, 1),
      DataToURLFactory.createFloat(3, 100, 1),
      DataToURLFactory.createFloat(2, 6, 1),
    ];
    const values = [0, 1, 10, true, false, 50, 1, 5500, -0.1, 0.02, 0.003, 2, 0.5, 0.6, 3.1, 4.5];

    values.forEach((e, i) => console.log(e, DataToURLFactory.testParse(e, dataMap[i])));

    // console.log(floatOnly.map((e, i) => DataToURLFactory.parseToBits(floatData[i], e)));
    const url = DataToURLFactory.createUrl(values, dataMap);
    console.log(url);
    console.log(DataToURLFactory.deconstructUrl(url, dataMap));
    // const floatBits = DataToURLFactory.parseBase64ToBits(floatUrl);
    // console.log(floatBits);
    // const floatOffsets = DataToURLFactory.offsetMapForDataPattern(floatOnly);
    // console.log(floatOffsets.map(([start, end]) => floatBits.slice(start, end)));
    // console.log(DataToURLFactory.deconstructUrl(floatUrl, floatOnly));
  };
}
