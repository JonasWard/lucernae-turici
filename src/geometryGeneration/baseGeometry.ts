import { Vector3, Mesh as BabylonMesh, VertexData, Scene, TransformNode, Material } from '@babylonjs/core';
import { getCenterOfHalfEdge, getEndVertexOfHalfEdge, getFaceVertices, getStartVertexOfHalfEdge } from './halfedge';
import { BaseFrame, HalfEdge, HalfEdgeFace, HalfEdgeMesh, TransformationMatrix, V2 } from './geometrytypes';
import { getV3, getVector3, getVertexHash } from './helpermethods';
import { V3 } from './v3';
import { FloorplanType } from './footprintgeometrytypes';
import { HeightGenerator, getHeights } from './geometry';
import { MaterialFactory } from './materialFactory';
import { ArcExtrusionProfileType } from './extrusionProfiles/types/arc';
import { SquareExtrusionProfileType } from './extrusionProfiles/types/square';
import { EllipseExtrusionProfileType } from './extrusionProfiles/types/ellipse';
import { ExtrusionProfileType } from './extrusionProfiles/types/extrusionProfileType';
import { ExtrusionCategory } from './extrusionProfiles/types/extrusionTypes';

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

const ARC_DIVSION_COUNT = 8;
export const MALCULMIUS_MESH_NAME = 'malculmius';
export const MALCULMIUS_SHADE_NAME = 'shade';
const UNIT_SCALING = 1;

const getArc = (frame: Frame): Vector3[] => {
  const angleDelta = (Math.PI * 0.5) / ARC_DIVSION_COUNT;

  const vertices = [];

  for (let i = 0; i < ARC_DIVSION_COUNT + 1; i++) {
    const angle = i * angleDelta;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    const point = frame.origin.add(frame.xAxis.scale(x)).add(frame.yAxis.scale(y));
    vertices.push(point);
  }

  return vertices;
};

const closeFrameHelperMethod = (p00: Vector3, p01: Vector3, p10: Vector3, p11: Vector3, otherPts: Vector3[], insetSecond: number): Mesh => {
  return {
    vertices: [p00, p10, p11, p01, ...otherPts],
    faces: [
      [0, 4, 3],
      ...[...Array(insetSecond - 1).keys()].map((i) => [0, i + 5, i + 4]),
      [0, 1, insetSecond + 4, insetSecond + 3],
      ...[...Array(otherPts.length - insetSecond - 1).keys()].map((i) => [1, i + insetSecond + 5, i + insetSecond + 4]),
      [1, 2, otherPts.length + 3],
    ] as Face[],
  };
};

const basePolygonToMesh = (polygon: Vector3[]): Mesh => {
  if (polygon.length > 4) {
    const midpoint = polygon.reduce((acc, p) => acc.add(p), Vector3.Zero()).scale(1 / polygon.length);
    return {
      vertices: [midpoint, ...polygon],
      faces: polygon.map((_, i) => [0, 1 + (i % polygon.length), 1 + ((i + 1) % polygon.length)] as Face),
    };
  }
  return {
    vertices: polygon,
    faces: polygon.length === 3 ? [[0, 1, 2]] : [[0, 1, 2, 3]],
  };
};

const invertMeshFaces = (mesh: Mesh): void => mesh.faces.forEach((f) => f.reverse());

const closeVoxel = (voxel: Voxel): Mesh => {
  const topMesh = basePolygonToMesh(voxel.baseProfile);
  const bottomMesh = basePolygonToMesh(voxel.baseProfile.map((v) => v.add(new Vector3(0, 0, voxel.height))));
  invertMeshFaces(bottomMesh);

  return joinMeshes([topMesh, bottomMesh]);
};

const closeFrame = (frame: Frame, extrusionProfile: ExtrusionProfileType): Mesh => {
  const p00 = frame.origin;
  const p01 = frame.origin.add(frame.xAxis);
  const p10 = frame.origin.add(frame.yAxis);
  const p11 = frame.origin.add(frame.xAxis).add(frame.yAxis);

  const profile = getPointsOnFrame(extrusionProfile, frame);

  switch (extrusionProfile.type) {
    case ExtrusionCategory.Arc:
    case ExtrusionCategory.Square:
      return closeFrameHelperMethod(p00, p01, p10, p11, profile, 2);
    case ExtrusionCategory.Ellipse:
      return closeFrameHelperMethod(p00, p01, p10, p11, profile, profile.length * 0.5);
  }
};

const getPointsOnArcFrame = (profile: ArcExtrusionProfileType, frame: Frame): Vector3[] => {
  const { origin, xAxis, yAxis, xAxisMultiplier } = frame;
  const { radiusTop, insetTop, insetBottom, insetSides } = profile;
  const lX = 1 / xAxis.length();
  const lY = 1 / yAxis.length();
  const centerBottom = origin.add(xAxis).add(yAxis.scale(insetBottom * lY));
  const sideBottom = origin.add(xAxis.scale(insetSides * lX * xAxisMultiplier)).add(yAxis.scale(insetBottom * lY));
  const sideTop = origin.add(xAxis.scale(insetSides * lX * xAxisMultiplier)).add(yAxis.scale(1 - (insetTop + radiusTop) * lY));
  const originArcFrame = origin.add(xAxis).add(yAxis.scale(1 - (insetTop + radiusTop) * lY));
  const centerTop = origin.add(xAxis).add(yAxis.scale(1 - insetTop * lY));
  return [
    centerBottom,
    sideBottom,
    ...getArc({ origin: originArcFrame, xAxis: sideTop.subtract(originArcFrame), yAxis: centerTop.subtract(originArcFrame), xAxisMultiplier: 1 }),
  ];
};

const getPointsOnEllipseFrame = (profile: EllipseExtrusionProfileType, frame: Frame): Vector3[] => {
  const { origin, xAxis, yAxis, xAxisMultiplier } = frame;
  const { radiusTop, insetTop, insetBottom, insetSides } = profile;
  const lX = 1 / xAxis.length();
  const lY = 1 / yAxis.length();
  const centerBottom = origin.add(xAxis).add(yAxis.scale(insetBottom * lY));
  const sideBottom = origin.add(xAxis.scale(insetSides * lX * xAxisMultiplier)).add(yAxis.scale((insetBottom + radiusTop) * lY));
  const originBottomArcFrame = origin.add(xAxis).add(yAxis.scale((insetBottom + radiusTop) * lY));
  const sideTop = origin.add(xAxis.scale(insetSides * lX * xAxisMultiplier)).add(yAxis.scale(1 - (insetTop + radiusTop) * lY));
  const originArcFrame = origin.add(xAxis).add(yAxis.scale(1 - (insetTop + radiusTop) * lY));
  const centerTop = origin.add(xAxis).add(yAxis.scale(1 - insetTop * lY));
  return [
    ...getArc({
      origin: originBottomArcFrame,
      xAxis: centerBottom.subtract(originBottomArcFrame),
      yAxis: sideBottom.subtract(originBottomArcFrame),
      xAxisMultiplier: 1,
    }),
    ...getArc({ origin: originArcFrame, xAxis: sideTop.subtract(originArcFrame), yAxis: centerTop.subtract(originArcFrame), xAxisMultiplier: 1 }),
  ];
};

const getPointsOnSquareFrame = (profile: SquareExtrusionProfileType, frame: Frame): Vector3[] => {
  const { origin, xAxis, yAxis, xAxisMultiplier } = frame;
  const { insetTop, insetBottom, insetSides } = profile;
  const lX = 1 / xAxis.length();
  const lY = 1 / yAxis.length();
  const centerBottom = origin.add(xAxis).add(yAxis.scale(insetBottom * lY));
  const sideBottom = origin.add(xAxis.scale(insetSides * lX * xAxisMultiplier)).add(yAxis.scale(insetBottom * lY));
  const sideTop = origin.add(xAxis.scale(insetSides * lX * xAxisMultiplier)).add(yAxis.scale(1 - insetTop * lY));
  const centerTop = origin.add(xAxis).add(yAxis.scale(1 - insetTop * lY));
  return [centerBottom, sideBottom, sideTop, centerTop];
};

export const getPointsOnFrame = (profile: ExtrusionProfileType, frame: Frame): Vector3[] => {
  switch (profile.type) {
    case ExtrusionCategory.Arc:
      return getPointsOnArcFrame(profile, frame);
    case ExtrusionCategory.Ellipse:
      return getPointsOnEllipseFrame(profile, frame);
    case ExtrusionCategory.Square:
      return getPointsOnSquareFrame(profile, frame);
  }
};

export const loft = (a: Vector3[], b: Vector3[], closed: boolean = false): Mesh => ({
  vertices: [...a, ...b],
  faces: a.map((_, i) => [i, (i + 1) % a.length, ((i + 1) % a.length) + a.length, i + a.length]).slice(0, closed ? -0 : -1) as Face[],
});

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

export const voxelToMesh = (voxel: Voxel, extrusionProfile: ExtrusionProfileType): Mesh => {
  // get the midpoint of the base profile of the voxel
  const baseProfile = voxel.baseProfile;
  const baseProfileMidpoint = baseProfile.reduce((acc, p) => acc.add(p), Vector3.Zero()).scale(1 / baseProfile.length);

  // get the frames of the voxel
  const meshes: Mesh[] = [];

  baseProfile.forEach((p, i) => {
    const origin = p;
    const yAxis = new Vector3(0, 0, voxel.height);

    // front frame
    const frontFrame = {
      origin,
      xAxis: baseProfile[(i + 1) % baseProfile.length].subtract(p).scale(0.5),
      yAxis,
      xAxisMultiplier: 1,
    };

    // back frame
    const backFrame = {
      origin: origin,
      xAxis: baseProfile[(i + baseProfile.length - 1) % baseProfile.length].subtract(p).scale(0.5),
      yAxis: yAxis,
      xAxisMultiplier: 1,
    };

    const centerXAxis = baseProfileMidpoint.subtract(p);

    // center frame =
    const centerFrame = {
      origin: origin,
      xAxis: centerXAxis,
      yAxis: yAxis,
      xAxisMultiplier: centerXAxis.length() / ((frontFrame.xAxis.length() + backFrame.xAxis.length()) * 0.5),
    };

    const frontCurve = getPointsOnFrame(extrusionProfile, frontFrame);
    const backCurve = getPointsOnFrame(extrusionProfile, backFrame);
    const centerCurve = getPointsOnFrame(extrusionProfile, centerFrame);

    meshes.push(loft(frontCurve, centerCurve));
    meshes.push(loft(centerCurve, backCurve));
    meshes.push(closeFrame(frontFrame, extrusionProfile));
    const backFrameMesh = closeFrame(backFrame, extrusionProfile);
    invertMeshFaces(backFrameMesh);
    meshes.push(backFrameMesh);
    meshes.push(closeVoxel(voxel));
  });

  return joinMeshes(meshes);
};

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

const getSimpleTriangularMeshForHalfEdgeFace = (face: HalfEdgeFace, m: HalfEdgeMesh) => {
  // getting the face ring
  const fB = getFaceBoundary(face, m);
  if (fB.length < 3) return [];
  if (fB.length === 3) return [makeFaceData(fB as [V3, V3, V3])];
  if (fB.length === 4) return [makeFaceData([fB[0], fB[1], fB[2]]), makeFaceData([fB[0], fB[2], fB[3]])];

  const faces: FaceWithData[] = [];
  const centerPoint = V3.getCenter(fB);
  fB.forEach((v, i) => {
    faces.push(makeFaceData([v, fB[(i + 1) % fB.length], centerPoint]));
  });

  return faces;
};

const getSetBackTriangularMeshForHalfEdgeFace = (face: HalfEdgeFace, m: HalfEdgeMesh) => {
  // getting the face ring
  const fB = getFaceBoundary(face, m);
  if (fB.length < 3) return [];

  const faces: FaceWithData[] = [];
  const centerPoint = V3.getCenter(fB);

  const halfFBSet = fB.map((v) => ({
    x: v.x + (centerPoint.x - v.x) * 0.2,
    y: v.y + (centerPoint.y - v.y) * 0.2,
    z: v.z + (centerPoint.z - v.z) * 0.2,
  }));

  const midFBSet = fB.map((v, i) => ({
    x: v.x + (fB[(i + 1) % fB.length].x - v.x) * 0.5,
    y: v.y + (fB[(i + 1) % fB.length].y - v.y) * 0.5,
    z: v.z + (fB[(i + 1) % fB.length].z - v.z) * 0.5,
  }));

  fB.forEach((v0, i) => {
    faces.push(
      makeFaceData([v0, midFBSet[i], halfFBSet[i]]),
      makeFaceData([midFBSet[i], fB[(i + 1) % fB.length], halfFBSet[(i + 1) % halfFBSet.length]]),
      makeFaceData([halfFBSet[i], midFBSet[i], halfFBSet[(i + 1) % halfFBSet.length]])
      // makeFaceData([v0, fB[(i + 1) % fB.length], halfFBSet[(i + 1) % fB.length]]),
      // makeFaceData([v0, halfFBSet[(i + 1) % halfFBSet.length], halfFBSet[i]])
    );
  });

  return faces;
};

const getGeometryForFaces = (face: HalfEdgeFace, m: HalfEdgeMesh, method: HalfEdgeRenderMethod): FaceWithData[] => {
  switch (method) {
    case HalfEdgeRenderMethod.Coloured:
      return getSetBackTriangularMeshForHalfEdgeFace(face, m);
    case HalfEdgeRenderMethod.Flat:
      return getSimpleTriangularMeshForHalfEdgeFace(face, m);
  }
};

const getFacesWithDataForHalfEdgeMesh = (m: HalfEdgeMesh, method: HalfEdgeRenderMethod = HalfEdgeRenderMethod.Coloured) => {
  return Object.values(m.faces)
    .map((f) => getGeometryForFaces(f, m, method))
    .flat();
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

// method for rendering an entire half edge mesh
export const renderHalfEdgeMesh = (m: HalfEdgeMesh, scene: Scene, name: string, renderMethod?: HalfEdgeRenderMethod, material?: Material) => {
  const facedata = getFacesWithDataForHalfEdgeMesh(m, renderMethod);
  const vertexData = getVertexDataForFaceWithData(facedata);

  const babylonMesh = new BabylonMesh(name, scene);
  vertexData.applyToMesh(babylonMesh);

  if (material) babylonMesh.material = material ?? MaterialFactory.getDefaultMaterial(scene);
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
