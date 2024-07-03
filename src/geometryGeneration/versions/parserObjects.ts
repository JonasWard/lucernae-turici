import { ParserForVersion } from '../../urlAsState/types/versionParser';
import { parserVersion0 } from './version0';
import { parserVersion1 } from './version1';

export const parserObjects: ParserForVersion[] = [parserVersion0, parserVersion1];
