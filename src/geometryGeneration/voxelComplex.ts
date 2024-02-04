import { Vector3 } from '@babylonjs/core';
import { ExtrusionProfile, Mesh, joinMeshes, voxelToMesh } from './baseGeometry';

export enum Malculmiuses {
  One = 'One',
}

export type MalculmiusOneGeometry = {
  type: Malculmiuses.One;
  circleRadius: number;
  circleDivisions: number;
  angleSplit: number;
  offsetA: number;
  offsetB: number;
  innerRadius: number;
};

export type MalculmiusGeometryType = Malculmiuses.One;

export type MalculmiusGeometry = MalculmiusOneGeometry;

const MALCULMIUS_TOLERANCE = 1;

const copyAndRotate = (vss: Vector3[][], origin: Vector3, angle: number): Vector3[][] => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return vss.map((vs) =>
    vs.map((v) => new Vector3((v.x - origin.x) * cos - (v.y - origin.y) * sin + origin.x, (v.x - origin.x) * sin + (v.y - origin.y) * cos + origin.y, v.z))
  );
};

const createShardOfMalculmiusOne = (geometry: MalculmiusOneGeometry, origin: Vector3, angle: number): Vector3[][] => {
  // creating the base profiles
  const singleShard = (o: Vector3, v0: Vector3, v1: Vector3, r0: number, r1: number, o0: number): Vector3[][] => {
    const t0 = o.add(v0.scale(r1));
    const t1 = o.add(v1.scale(r1));

    const topVs: Vector3[] = [];

    if (Math.abs(o0) < MALCULMIUS_TOLERANCE) {
      topVs.push(t0, t1);
    } else {
      const d = t0.add(t1).scale(0.5);
      topVs.push(t0, o.add(d.scale(1 + o0 / d.length())), t1);
    }

    if (r0 < MALCULMIUS_TOLERANCE) {
      if (topVs.length === 3 && o0 < 0) {
        return [
          [o, topVs[0], topVs[1]],
          [o, topVs[1], topVs[2]],
        ];
      } else {
        return [[o, topVs[0], topVs[1], topVs[2]]];
      }
    } else {
      const p0 = o.add(v0.scale(r0));
      const p1 = o.add(v1.scale(r0));

      if (topVs.length === 3 && o0 < 0) {
        return [
          [p1, p0, topVs[1]],
          [topVs[1], p0, topVs[0]],
          [topVs[2], p1, topVs[1]],
        ];
      } else if (topVs.length === 3) {
        return [[p1, p0, ...topVs]];
      } else {
        return [[p1, p0, topVs[0], topVs[1]]];
      }
    }
  };

  const { circleRadius, circleDivisions, angleSplit, offsetA, offsetB, innerRadius } = geometry;

  const vertexSets: Vector3[][] = [];

  const angleDelta = (Math.PI * 2) / circleDivisions;
  const angleDeltaSplit = angleDelta * angleSplit;

  const v0 = new Vector3(1, 0, 0);
  const v1 = new Vector3(Math.cos(angleDeltaSplit), Math.sin(angleDeltaSplit), 0);
  const v2 = new Vector3(Math.cos(angleDelta), Math.sin(angleDelta), 0);

  const shards = [...singleShard(origin, v0, v1, innerRadius, circleRadius, offsetA), ...singleShard(origin, v1, v2, innerRadius, circleRadius, offsetB)];

  for (let i = 0; i < circleDivisions; i++) {
    vertexSets.push(...copyAndRotate(shards, origin, i * angleDelta));
  }

  return vertexSets;
};

const createVoxelComplex = (polygons: Vector3[][], heightMap: number[], extrusionProfile: ExtrusionProfile): Mesh => {
  const meshes: Mesh[] = [];

  polygons.forEach((polygon) => {
    for (let i = 0; i < heightMap.length; i++) {
      const h0 = heightMap[i];
      const h1 = heightMap[i + 1];
      const vZ = new Vector3(0, 0, h0);
      const hDelta = h1 - h0;
      meshes.push(voxelToMesh({ baseProfile: polygon.map((v) => v.add(vZ)), height: hDelta }, extrusionProfile));
    }
  });

  return joinMeshes(meshes);
};

export const createMalculmiusGeometry = (
  geometry: MalculmiusGeometry,
  origin: Vector3 = new Vector3(0, 0, 0),
  heightMap: number[],
  extrusionProfile: ExtrusionProfile
): Mesh => {
  // creating the base profile
  switch (geometry.type) {
    case Malculmiuses.One:
      return createVoxelComplex(createShardOfMalculmiusOne(geometry, origin, 0), heightMap, extrusionProfile);
  }
};
