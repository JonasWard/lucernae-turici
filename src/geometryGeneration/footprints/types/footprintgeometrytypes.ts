import { CylinderFootprint } from './cylinder';
import { MalculmiusOneFootprint } from './malcolmiusOne';
import { PolygonGridShellFootprint } from './polygonGridShell';
import { PolygonGridSimpleFootprint } from './polygonGridSimple';
import { SquareFootprint } from './square';

export type FloorplanType = SquareFootprint | PolygonGridSimpleFootprint | PolygonGridShellFootprint | CylinderFootprint | MalculmiusOneFootprint;
