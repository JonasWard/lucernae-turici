import { Vector3, Mesh as BabylonMesh, VertexData, Scene, TransformNode, Material } from '@babylonjs/core';
import { getCenterOfHalfEdge, getEndVertexOfHalfEdge, getFaceVertices, getStartVertexOfHalfEdge } from './halfedge';
import { BaseFrame, HalfEdge, HalfEdgeFace, HalfEdgeMesh, TransformationMatrix, V2 } from './geometrytypes';
import { getV3, getVector3, getVertexHash } from './helpermethods';
import { V3 } from './v3';
import { FloorplanType } from './footprintgeometrytypes';
import { HeightGenerator, getHeights } from './geometry';
import { MaterialFactory } from './materialFactory';
import { ExtrusionProfileType } from './extrusionProfiles/types/extrusionProfileType';

// this mesh assumes a positive oriented coordinate system, which means we will have to transform the mesh when importing them into a babylon scene

export type Face = number[];
export type Mesh = { faces: Face[]; vertices: Vector3[] };
export type Voxel = {
  baseProfile: Vector3[];
  height: number;
};
export type Frame = {
  origin: Vector3;
  xAxis: Vector3;
  yAxis: Vector3;
  xAxisMultiplier: number;
};

export type BaseType = {
  sideHeight: number;
  sideInnerRadius: number;
};

export type GeometryBaseData = {
  extrusion: ExtrusionProfileType;
  footprint: FloorplanType;
  heights: HeightGenerator;
  base: BaseType;
};

export const getHeightAndRadius = (gBD: GeometryBaseData): [number, number] => {
  const heights = getHeights(gBD.heights);

  return [heights[heights.length - 1] * 0.5, heights[heights.length - 1] * 2.5];
};

const UNIT_SCALING = 1;

export const joinMeshes = (meshes: Mesh[]): Mesh => {
  const vertices: Vector3[] = [];
  const vertexMap: Map<string, number> = new Map();

  const faces: Face[] = [];

  meshes.forEach((mesh) => {
    const localHashes: string[] = [];
    mesh.vertices.forEach((v) => {
      const hash = getVertexHash(v);
      if (!vertexMap.has(hash)) {
        vertices.push(v);
        vertexMap.set(hash, vertices.length - 1);
      }
      localHashes.push(hash);
    });

    mesh.faces.forEach((face) => faces.push(face.map((i) => vertexMap.get(localHashes[i]) as number) as Face));
  });

  return { vertices, faces };
};

export const polygonToMesh = (polygon: Vector3[]): Mesh => ({
  faces: [[...Array(polygon.length).keys()]],
  vertices: polygon,
});

export enum HalfEdgeRenderMethod {
  Flat = 'flat',
  Coloured = 'coloured',
}

export type FaceWithData = {
  vertices: [V3, V3, V3];
  normals: [V3, V3, V3];
  uvs: [V2, V2, V2];
};

const getFaceBoundary = (face: HalfEdgeFace, m: HalfEdgeMesh): V3[] => {
  return getFaceVertices(face, m);
};

// normal fall back just returns the normal defined by the plane which make up the face
const getNormalFallBack = (vertices: [V3, V3, V3]): [V3, V3, V3] => {
  const n = getV3(getNormal(getVector3(vertices[0]), getVector3(vertices[1]), getVector3(vertices[2])));
  return [n, n, n];
};

const handleNormals = (vertices: [V3, V3, V3], normalData?: [V3, V3, V3] | V3): [V3, V3, V3] => {
  if (!normalData) return getNormalFallBack(vertices);
  if (Array.isArray(normalData)) return normalData;
  return [normalData, normalData, normalData];
};

// the uv fallback puts angle around z-axis regraded to [0,1] for u and z value as v
const getUVFallBack = (vertices: [V3, V3, V3]): [V2, V2, V2] => {
  const uv0 = { u: 0.5 + Math.atan2(vertices[0].x, vertices[0].y / (Math.PI * 2)), v: vertices[0].z };
  const uv1 = { u: 0.5 + Math.atan2(vertices[1].x, vertices[1].y / (Math.PI * 2)), v: vertices[1].z };
  const uv2 = { u: 0.5 + Math.atan2(vertices[2].x, vertices[2].y / (Math.PI * 2)), v: vertices[2].z };

  return [uv0, uv1, uv2];
};

const handleUVs = (vertices: [V3, V3, V3], uvData?: [V2, V2, V2] | V2): [V2, V2, V2] => {
  if (!uvData) return getUVFallBack(vertices);
  if (Array.isArray(uvData)) return uvData;
  return [uvData, uvData, uvData];
};

// technically it would be possible to get a set of non-coplanar geometries, but since all vertices are hashed this is not a realistic problem
const getNormal = (v0: Vector3, v1: Vector3, v2: Vector3): Vector3 => v1.subtract(v0).cross(v2.subtract(v0)).normalize();

const makeFaceData = (vertices: [V3, V3, V3], normals?: [V3, V3, V3] | V3, uvs?: [V2, V2, V2] | V2): FaceWithData => {
  return { vertices, normals: handleNormals(vertices, normals), uvs: handleUVs(vertices, uvs) };
};

export const getVertexDataForFaceWithData = (fs: FaceWithData[]): VertexData => {
  const vertexData = new VertexData();
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  fs.forEach((f, i) => {
    positions.push(...f.vertices.map((v) => [v.x * UNIT_SCALING, v.z * UNIT_SCALING, -v.y * UNIT_SCALING]).flat());
    indices.push(i * 3, i * 3 + 1, i * 3 + 2);
    normals.push(...f.normals.map((v) => [v.x, v.z, -v.y]).flat());
    uvs.push(...f.uvs.map((v) => [v.u, v.v]).flat());
  });

  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;

  return vertexData;
};

const meshFromFaceData = (faceData: FaceWithData[], scene: Scene, uuid: string, name: string, rootNode?: TransformNode, backFaceCulling?: boolean) => {
  const vertexData = getVertexDataForFaceWithData(faceData);
  const babylonMesh = new BabylonMesh(`${name}-${uuid}`, scene);
  vertexData.applyToMesh(babylonMesh);
  babylonMesh.material = MaterialFactory.getMaterialForUuid(scene, uuid, 'material-', backFaceCulling);
  if (rootNode) babylonMesh.parent = rootNode;
};

// method for rendering / 'visualizing' a singel half edge
export const renderHalfEdge = (he: HalfEdge, m: HalfEdgeMesh, scene: Scene, rootNode?: TransformNode, backFaceCulling: boolean = true) => {
  const halfEdgeScale = 0.7;
  if (!he.face) return;
  // getting the face that belong to the half edge
  const face = m.faces[he.face];

  const faceCenter = V3.getCenter(getFaceVertices(face, m));
  const edgeCenter = getCenterOfHalfEdge(he, m, 0.5);
  const edgeStart = getStartVertexOfHalfEdge(he, m);
  const edgeEnd = getEndVertexOfHalfEdge(he, m);

  const topVertex: V3 = V3.add(edgeCenter, V3.mul(V3.sub(faceCenter, edgeCenter), halfEdgeScale));
  const halfTopVertex: V3 = V3.add(edgeCenter, V3.mul(V3.sub(faceCenter, edgeCenter), halfEdgeScale * 0.5));

  const sideEdgeStart: V3 = V3.add(edgeStart, V3.mul(V3.sub(faceCenter, edgeStart), halfEdgeScale));
  const sideEdgeEnd: V3 = V3.add(edgeEnd, V3.mul(V3.sub(faceCenter, edgeEnd), halfEdgeScale));

  const facedata: { uuid: string; name: string; vertices: FaceWithData[] }[] = [
    { name: 'main', vertices: [makeFaceData([edgeStart, halfTopVertex, topVertex]), makeFaceData([halfTopVertex, edgeEnd, topVertex])], uuid: he.id }, // main
    { name: 'start', vertices: [makeFaceData([sideEdgeStart, edgeStart, topVertex])], uuid: he.previous }, // start
    { name: 'end', vertices: [makeFaceData([edgeEnd, sideEdgeEnd, topVertex])], uuid: he.next }, // end
    { name: 'neighbour', vertices: [makeFaceData([edgeStart, edgeEnd, halfTopVertex])], uuid: he.neighbour ?? 'ffffff' }, // neighbour
  ];

  facedata.forEach((fd) => meshFromFaceData(fd.vertices, scene, fd.uuid, fd.name, rootNode, backFaceCulling));
};

export const getWorldXYToFrameTransformation = (f: BaseFrame): TransformationMatrix => [
  f.x.x,
  f.y.x,
  f.z.x,
  f.o.x,
  f.x.y,
  f.y.y,
  f.z.y,
  f.o.y,
  f.x.z,
  f.y.z,
  f.z.z,
  f.o.z,
  0,
  0,
  0,
  1,
];

const getFrameToFrameForV3Transformation = (p: V3, fA: BaseFrame, fB: BaseFrame): V3 => {
  const v = new Vector3(p.x, p.y, p.z);
  const oA = new Vector3(fA.o.x, fA.o.y, fA.o.z);
  const xA = new Vector3(fA.x.x, fA.x.y, fA.x.z);
  const yA = new Vector3(fA.y.x, fA.y.y, fA.y.z);
  const zA = new Vector3(fA.z.x, fA.z.y, fA.z.z);
  const oB = new Vector3(fB.o.x, fB.o.y, fB.o.z);
  const xB = new Vector3(fB.x.x, fB.x.y, fB.x.z);
  const yB = new Vector3(fB.y.x, fB.y.y, fB.y.z);
  const zB = new Vector3(fB.z.x, fB.z.y, fB.z.z);

  const locP = v.subtract(oA);
  const xT = locP.dot(xA);
  const yT = locP.dot(yA);
  const zT = locP.dot(zA);

  const vProjected = oB.add(xB.scale(xT)).add(yB.scale(yT)).add(zB.scale(zT));
  return { x: vProjected.x, y: vProjected.y, z: vProjected.z };
};

export const getFrameToFrameTransformation = (a: BaseFrame, b: BaseFrame): TransformationMatrix => {
  const o = getFrameToFrameForV3Transformation({ x: 0, y: 0, z: 0 }, a, b);
  const x = getFrameToFrameForV3Transformation({ x: 1, y: 0, z: 0 }, a, b);
  const y = getFrameToFrameForV3Transformation({ x: 0, y: 1, z: 0 }, a, b);
  const z = getFrameToFrameForV3Transformation({ x: 0, y: 0, z: 1 }, a, b);
  const frame: BaseFrame = {
    o,
    x: { x: x.x - o.x, y: x.y - o.y, z: x.z - o.z },
    y: { x: y.x - o.x, y: y.y - o.y, z: y.z - o.z },
    z: { x: z.x - o.x, y: z.y - o.y, z: z.z - o.z },
  };
  return getWorldXYToFrameTransformation(frame);
};

export const getTransformedV3 = (v: V3, m: TransformationMatrix): V3 => {
  const x = m[0] * v.x + m[1] * v.y + m[2] * v.z + m[3];
  const y = m[4] * v.x + m[5] * v.y + m[6] * v.z + m[7];
  const z = m[8] * v.x + m[9] * v.y + m[10] * v.z + m[11];
  return { x, y, z };
};

export const WorldXY: BaseFrame = {
  o: V3.Origin,
  x: V3.XAxis,
  y: V3.YAxis,
  z: V3.ZAxis,
};

export class BaseFrameFactory {
  public static getBaseFramArrayAlongDirection = (d: V3, count = 3, spacing = 0.1, o = WorldXY.o, x = WorldXY.x, y = WorldXY.y, z = WorldXY.z): BaseFrame[] => {
    const frames: BaseFrame[] = [];
    for (let i = 0; i < count; i++) {
      frames.push({
        o: V3.add(o, V3.mul(d, i * spacing)),
        x,
        y,
        z,
      });
    }
    return frames;
  };

  public static getBaseFramArrayAlongDirectionForSpacings = (
    d: V3,
    spacings: number[] = [0, 0.1],
    o = WorldXY.o,
    x = WorldXY.x,
    y = WorldXY.y,
    z = WorldXY.z
  ): BaseFrame[] =>
    spacings.map((spacing) => ({
      o: V3.add(o, V3.mul(d, spacing)),
      x,
      y,
      z,
    }));
}
