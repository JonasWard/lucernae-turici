import { DataType } from '../enums/dataTypes';
import { DataDescription, DataEntry, DataEntryArray, DataRangeDescription } from '../types/dataEntry';
import * as floatParser from './floatParser';
import * as intParser from './intParser';
import * as enumParser from './enumParser';
import * as versionParser from './versionParser';
import * as booleanParser from './booleanParser';

export const valueBitsParser = (bitString: string, mapData: DataRangeDescription) => {
  switch (mapData.type) {
    case DataType.BOOLEAN:
      return booleanParser.rawParser(bitString);
    case DataType.INT:
      return intParser.rawParser(bitString, mapData);
    case DataType.ENUM:
      return enumParser.rawParser(bitString, mapData);
    case DataType.FLOAT:
      return floatParser.rawParser(bitString, mapData);
    case DataType.VERSION:
      return versionParser.rawParser(bitString, mapData);
  }
};

export const dataBitsParser = (rawString: string, mapData: DataDescription): DataEntry => {
  switch (mapData.type) {
    case DataType.BOOLEAN:
      return { ...mapData, value: valueBitsParser(rawString, mapData) as boolean };
    case DataType.ENUM:
    case DataType.INT:
    case DataType.FLOAT:
    case DataType.VERSION:
      return { ...mapData, value: valueBitsParser(rawString, mapData) as number };
  }
};

export const getBitsCount = (mapData: DataRangeDescription) => {
  switch (mapData.type) {
    case DataType.BOOLEAN:
      return booleanParser.getBitsCount();
    case DataType.INT:
      return intParser.getBitsCount(mapData);
    case DataType.FLOAT:
      return floatParser.getBitsCount(mapData);
    case DataType.VERSION:
      return versionParser.getBitsCount(mapData);
    case DataType.ENUM:
      return enumParser.getBitsCount(mapData);
  }
};

/**
 * Method to convert a bitstring into an array of data entries
 * @param bitString bitstring to parse into bits and then data entries
 * @param mapDataArray Data descriptions to map the bits to data entries
 * @returns array of data entries
 */
export const dataBitsArrayParser = (bitString: string, mapDataArray: DataDescription[]): DataEntryArray => {
  const bitCounts = mapDataArray.map((mapData) => getBitsCount(mapData));
  const bitStartEndMap: [number, number][] = [];
  bitCounts.forEach((bitCount, index) => {
    const start = index === 0 ? 0 : bitStartEndMap[index - 1][1];
    bitStartEndMap.push([start, start + bitCount]);
  });
  return mapDataArray.map((mapData, i) => dataBitsParser(bitString.slice(bitStartEndMap[i][0], bitStartEndMap[i][1]), mapData));
};

export const dataBitsStringifier = (data: DataEntry): string => {
  switch (data.type) {
    case DataType.BOOLEAN:
      return booleanParser.rawStringifier(data.value as boolean);
    case DataType.INT:
      return intParser.rawStringifier(data.value as number, data);
    case DataType.FLOAT:
      return floatParser.rawStringifier(data.value as number, data);
    case DataType.VERSION:
      return versionParser.rawStringifier(data.value as number, data);
    case DataType.ENUM:
      return enumParser.rawStringifier(data.value as number, data);
  }
};

export const dataEntryCorrecting = (dataEntry: DataEntry): DataEntry => dataBitsParser(dataBitsStringifier(dataEntry), dataEntry);

const base64url = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export const parseBitsToBase64 = (bits: string): string => {
  // split the bits into 6 bit chunks
  const chunks = bits.match(/.{1,6}/g);
  // parse the chunks into numbers
  const numbers = chunks?.map((c) => Number.parseInt(c.padEnd(6, '0'), 2)) ?? [];
  // map the numbers to base64
  return numbers.map((n) => base64url.charAt(n)).join('');
};

export const parseBase64ToBits = (base64: string): string => {
  // map the base64 characters to numbers
  const numbers = base64.split('').map((c) => base64url.indexOf(c));
  // parse the numbers into 6 bit chunks
  const chunks = numbers.map((n) => n.toString(2).padStart(6, '0'));
  // join the chunks
  return chunks.join('');
};

// *** only relevant exports for actual use ***

/**
 * Method to convert an array of data entries into a base64 string
 * @param dataArray Data Entries to read to parse into bits and then a base64 string
 * @returns bitstring representation of the data entries
 */
export const dataArrayStringifier = (dataEntryArray: DataEntryArray): string => {
  return dataEntryArray.map(dataBitsStringifier).join('');
};
