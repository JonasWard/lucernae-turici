import { Vector2, Vector3 } from '@babylonjs/core';
import { V2, V3 } from './geometrytypes';

export const getRandomUUID = (): string => {
  const validChars = '0123456789abcdef';
  const s = (count: number) => [...Array(count)].map(() => validChars[Math.floor(Math.random() * validChars.length)]).join('');
  const M = ['1', '2', '3', '4', '5'];
  const N = ['8', '9', 'a', 'b'];
  return `${s(7)}-${s(4)}-${M[Math.floor(Math.random() * M.length)]}${s(3)}-${N[Math.floor(Math.random() * N.length)]}${s(3)}-${s(12)}`;
};

export const getVector3 = (v: V3): Vector3 => new Vector3(v.x, v.y, v.z);
export const getVector2 = (v: V2): Vector2 => new Vector2(v.u, v.v);
export const getV3 = (v: Vector3): V3 => ({ x: v.x, y: v.y, z: v.z });
export const getV2 = (v: Vector2): V2 => ({ u: v.x, v: v.y });
