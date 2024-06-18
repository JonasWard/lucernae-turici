import { Vector3 } from '@babylonjs/core';
import { BaseFrameFactory, ExtrusionProfile, Mesh, WorldXY, joinMeshes, polygonToMesh, voxelToMesh } from './baseGeometry';
import { BaseFrame, HalfEdgeMesh } from './geometrytypes';
import { getHalfEdgeMeshFromMesh } from './halfedge';
import { VoxelFactory } from './voxelComplex.factory';
import { V3 } from './v3';
import { VoxelComplex } from './voxelComplex.type';
import { MalculmiusOneFootprint } from './footprintgeometrytypes';

export enum Malculmiuses {
  One = 5,
}

export type MalculmiusOneGeometry = {
  type: Malculmiuses.One;
  circleRadius: number;
  circleDivisions: number;
  angleSplit: number;
  offsetA: number;
  offsetB: number;
  innerRadius: number;
  postProcessing: PostProcessingMethods;
  heights: HeightGenerator;
};

export enum ProcessingMethodType {
  None,
  IncrementalMethod,
  Sin,
}

export type NoneMethod = {
  type: ProcessingMethodType.None;
};

export type IncrementalMethod = {
  type: ProcessingMethodType.IncrementalMethod;
  total: boolean;
  angle: number;
};

export type SinMethod = {
  type: ProcessingMethodType.Sin;
  max: number;
  min: number;
  period: number;
  phaseShift: number;
};

export type ProcessingMethods = NoneMethod | IncrementalMethod | SinMethod;

export type PostProcessingMethods = {
  twist: ProcessingMethods;
  skew: ProcessingMethods;
};

export type HeightGenerator = {
  storyCount: number;
  baseHeight: number;
  method: ProcessingMethods;
};

export const DEFAULT_PROCESSING_METHODS = {
  [ProcessingMethodType.None]: {
    type: ProcessingMethodType.None,
  } as NoneMethod,
  [ProcessingMethodType.IncrementalMethod]: {
    type: ProcessingMethodType.IncrementalMethod,
    total: false,
    angle: 1.3,
  } as IncrementalMethod,
  [ProcessingMethodType.Sin]: {
    type: ProcessingMethodType.Sin,
    max: 0.5,
    min: 1.5,
    period: 2,
    phaseShift: 3,
  } as SinMethod,
};

export const DEFAULT_HEIGHT_GENERATORS = {
  [ProcessingMethodType.None]: {
    storyCount: 4,
    baseHeight: 100,
    method: DEFAULT_PROCESSING_METHODS[ProcessingMethodType.None],
  },
  [ProcessingMethodType.IncrementalMethod]: {
    storyCount: 0,
    baseHeight: 0,
    method: DEFAULT_PROCESSING_METHODS[ProcessingMethodType.None],
  },
  [ProcessingMethodType.Sin]: {
    storyCount: 0,
    baseHeight: 0,
    method: DEFAULT_PROCESSING_METHODS[ProcessingMethodType.None],
  },
};

const getSineMethod =
  (sineSettings: SinMethod) =>
  (angle: number): number => {
    return sineSettings.min + (sineSettings.max - sineSettings.min) * (Math.sin(sineSettings.period * angle + sineSettings.phaseShift) * 0.5 + 0.5);
  };

const getIncrementalMethod =
  (incrementalSettings: IncrementalMethod, total?: number) =>
  (angle: number): number => {
    return incrementalSettings.total && total ? 1 + angle * incrementalSettings.angle * total : 1 + angle * incrementalSettings.angle;
  };

const getBaseMethod = (method: ProcessingMethods, total?: number): ((angle: number) => number) => {
  switch (method.type) {
    case ProcessingMethodType.None:
      return () => 1;
    case ProcessingMethodType.IncrementalMethod:
      return getIncrementalMethod(method, total);
    case ProcessingMethodType.Sin:
      return getSineMethod(method);
  }
};

export const getHeights = (heightGenerator: HeightGenerator): number[] => {
  const heights: number[] = [];

  switch (heightGenerator.method.type) {
    case ProcessingMethodType.None:
      heights.push(...Array.from({ length: heightGenerator.storyCount }, () => heightGenerator.baseHeight));
      break;
    case ProcessingMethodType.IncrementalMethod:
      const incrementalMethod = getIncrementalMethod(heightGenerator.method);
      heights.push(...Array.from({ length: heightGenerator.storyCount }, (_, i) => incrementalMethod(i) + heightGenerator.baseHeight));
      break;
    case ProcessingMethodType.Sin:
      const sineMethod = getSineMethod(heightGenerator.method);
      heights.push(...Array.from({ length: heightGenerator.storyCount }, (_, i) => sineMethod(i) * heightGenerator.baseHeight));
      break;
  }

  let height = 0;
  const incrementalHeights = [0];

  heights.forEach((h) => {
    height += h;
    incrementalHeights.push(height);
  });

  return incrementalHeights;
};

export type MalculmiusGeometryType = Malculmiuses.One;

export type MalculmiusGeometry = MalculmiusOneGeometry;

const MALCULMIUS_TOLERANCE = 0.01;

const copyAndRotate = (vss: Vector3[][], origin: Vector3, angle: number): Vector3[][] => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return vss.map((vs) =>
    vs.map((v) => new Vector3((v.x - origin.x) * cos - (v.y - origin.y) * sin + origin.x, (v.x - origin.x) * sin + (v.y - origin.y) * cos + origin.y, v.z))
  );
};

export const createShardOfMalculmiusOne = (geometry: MalculmiusOneFootprint, origin: Vector3, angle: number): Vector3[][] => {
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

const createVoxelComplex = (polygons: Vector3[][], heightMap: number[], extrusionProfile: ExtrusionProfile, mesh: Mesh): Mesh => {
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

  const localMesh = joinMeshes(meshes);
  mesh.faces = localMesh.faces;
  mesh.vertices = localMesh.vertices;

  return mesh;
};

const createBase = (polygons: Vector3[][], heightMap: number[], mesh: Mesh): Mesh => {
  return {
    vertices: [],
    faces: [],
  };
};

const createShade = (polygons: Vector3[][], heightMap: number[], heMesh: HalfEdgeMesh): HalfEdgeMesh => {
  const vZ = new Vector3(0, 0, 550);

  const meshes = polygons.map((p) => polygonToMesh(p.map((v) => v.add(vZ))));
  const localHeMesh = getHalfEdgeMeshFromMesh(joinMeshes(meshes));

  heMesh.faces = localHeMesh.faces;
  heMesh.vertices = localHeMesh.vertices;
  heMesh.halfEdges = localHeMesh.halfEdges;

  return heMesh;
};

export const twistAndSkewVertex = (v: Vector3, twistMethod: (angle: number) => number, skewMethod: (angle: number) => number, angle: number): Vector3 => {
  const twistAngle = twistMethod(v.z * 0.001);
  const skew = 0.5 + skewMethod(v.z * 0.001) * 0.5;

  const cos = Math.cos(twistAngle) * skew;
  const sin = Math.sin(twistAngle) * skew;

  return new Vector3(v.x * cos - v.y * sin, v.x * sin + v.y * cos, v.z);
};

export const twistAndSkewVertexV3 = (v: V3, twistMethod: (angle: number) => number, skewMethod: (angle: number) => number, angle: number): V3 => {
  const twistAngle = twistMethod(v.z * 0.001);
  const skew = 0.5 + skewMethod(v.z * 0.001) * 0.5;

  const cos = Math.cos(twistAngle) * skew;
  const sin = Math.sin(twistAngle) * skew;

  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos, z: v.z };
};

export const createMalculmiusGeometry = (
  geometry: MalculmiusGeometry,
  origin: Vector3 = new Vector3(0, 0, 0),
  extrusionProfile: ExtrusionProfile
): { base: Mesh; building: Mesh; shade: HalfEdgeMesh } => {
  // creating the base profile
  const heightMap = getHeights(geometry.heights);

  const base: Mesh = {
    faces: [],
    vertices: [],
  };
  const building: Mesh = {
    faces: [],
    vertices: [],
  };
  const shade: HalfEdgeMesh = {
    faces: {},
    halfEdges: {},
    vertices: {},
  };

  switch (geometry.type) {
    case Malculmiuses.One:
      const shardOfMalculmiusOne = createShardOfMalculmiusOne(geometry as unknown as MalculmiusOneFootprint, origin, 0);
      createBase(shardOfMalculmiusOne, heightMap, base);
      createVoxelComplex(shardOfMalculmiusOne, heightMap, extrusionProfile, building);
      createShade(shardOfMalculmiusOne, heightMap, shade);
  }

  // get post processing methods
  const twistMethod = getBaseMethod(geometry.postProcessing.twist, heightMap[heightMap.length - 1]);
  const skewMethod = getBaseMethod(geometry.postProcessing.skew, heightMap[heightMap.length - 1]);

  building.vertices = building.vertices.map((v) => twistAndSkewVertex(v, twistMethod, skewMethod, v.z));
  return { base, building, shade };
};

export const createCellComplexFromMalculmiusGeometry = (geometry: MalculmiusGeometry, originFrame: BaseFrame = WorldXY): VoxelComplex => {
  // constructing the heightmap
  const heightMap = getHeights(geometry.heights);
  const baseFrames = BaseFrameFactory.getBaseFramArrayAlongDirectionForSpacings(originFrame.z, heightMap);

  const shard = createShardOfMalculmiusOne(geometry as unknown as MalculmiusOneFootprint, new Vector3(originFrame.o.x, originFrame.o.y, originFrame.o.z), 0);
  const heMesh = getHalfEdgeMeshFromMesh(joinMeshes(shard.map(polygonToMesh)));

  // constructing the voxel complex
  const cellComplex = VoxelFactory.sweepHalfEdgeMesh(heMesh, baseFrames);

  // applying the post processing methods
  const twistMethod = getBaseMethod(geometry.postProcessing.twist, heightMap[heightMap.length - 1]);
  const skewMethod = getBaseMethod(geometry.postProcessing.skew, heightMap[heightMap.length - 1]);
  Object.entries(cellComplex.vertices).forEach(([k, v]) => {
    cellComplex.vertices[k] = twistAndSkewVertexV3(v, twistMethod, skewMethod, v.z);
  });

  return cellComplex;
};
