import { Color3 } from '@babylonjs/core';

export interface MaterialOptions {
  name: string;
  backFaceCulling?: boolean;
  wireframe?: boolean;
  emissiveColor?: Color3;
  diffuseColor?: Color3;
  alpha?: number;
}
