import { Vector3, Mesh as BabylonMesh, VertexData, Scene, StandardMaterial } from '@babylonjs/core';
import { getCenterOfV3s, getFaceVertices } from './halfedge';
import { HalfEdgeFace, HalfEdgeMesh, V2, V3 } from './geometrytypes';
import { getV3, getVector3 } from './helpermethods';

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

export enum ExtrusionProfileType {
  Arc = 'Arc',
  Ellipse = 'Ellipse',
  Square = 'Square',
}

export type ArcExtrusionProfile = {
  type: ExtrusionProfileType.Arc;
  radiusTop: number; // absolute value
  insetTop: number; // absolute value
  insetBottom: number; // absolute value
  insetSides: number; // absolute value
};

export type SquareExtrusionProfile = {
  type: ExtrusionProfileType.Square;
  insetTop: number; // absolute value
  insetBottom: number; // absolute value
  insetSides: number; // absolute value
};

export type EllipseExtrusionProfile = {
  type: ExtrusionProfileType.Ellipse;
  radius: number; // absolute value
  insetTop: number; // absolute value
  insetBottom: number; // absolute value
  insetSides: number; // absolute value
};

export type ExtrusionProfile = ArcExtrusionProfile | SquareExtrusionProfile | EllipseExtrusionProfile;

const ARC_DIVSION_COUNT = 8;
export const MALCULMIUS_MESH_NAME = 'malculmius';
export const MALCULMIUS_SHADE_NAME = 'shade';
const UNIT_SCALING = 0.001;

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

const invertMeshFaces = (mesh: Mesh): void => {
  mesh.faces.forEach((f) => f.reverse());
};

const closeVoxel = (voxel: Voxel): Mesh => {
  const topMesh = basePolygonToMesh(voxel.baseProfile);
  const bottomMesh = basePolygonToMesh(voxel.baseProfile.map((v) => v.add(new Vector3(0, 0, voxel.height))));
  invertMeshFaces(bottomMesh);

  return joinMeshes([topMesh, bottomMesh]);
};

const closeFrame = (frame: Frame, extrusionProfile: ExtrusionProfile): Mesh => {
  const p00 = frame.origin;
  const p01 = frame.origin.add(frame.xAxis);
  const p10 = frame.origin.add(frame.yAxis);
  const p11 = frame.origin.add(frame.xAxis).add(frame.yAxis);

  const profile = getPointsOnFrame(extrusionProfile, frame);

  switch (extrusionProfile.type) {
    case ExtrusionProfileType.Arc:
    case ExtrusionProfileType.Square:
      return closeFrameHelperMethod(p00, p01, p10, p11, profile, 2);
    case ExtrusionProfileType.Ellipse:
      return closeFrameHelperMethod(p00, p01, p10, p11, profile, profile.length * 0.5);
  }
};

const getPointsOnArcFrame = (profile: ArcExtrusionProfile, frame: Frame): Vector3[] => {
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

const getPointsOnEllipseFrame = (profile: EllipseExtrusionProfile, frame: Frame): Vector3[] => {
  const { origin, xAxis, yAxis, xAxisMultiplier } = frame;
  const { radius, insetTop, insetBottom, insetSides } = profile;
  const lX = 1 / xAxis.length();
  const lY = 1 / yAxis.length();
  const centerBottom = origin.add(xAxis).add(yAxis.scale(insetBottom * lY));
  const sideBottom = origin.add(xAxis.scale(insetSides * lX * xAxisMultiplier)).add(yAxis.scale((insetBottom + radius) * lY));
  const originBottomArcFrame = origin.add(xAxis).add(yAxis.scale((insetBottom + radius) * lY));
  const sideTop = origin.add(xAxis.scale(insetSides * lX * xAxisMultiplier)).add(yAxis.scale(1 - (insetTop + radius) * lY));
  const originArcFrame = origin.add(xAxis).add(yAxis.scale(1 - (insetTop + radius) * lY));
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

const getPointsOnSquareFrame = (profile: SquareExtrusionProfile, frame: Frame): Vector3[] => {
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

export const getPointsOnFrame = (profile: ExtrusionProfile, frame: Frame): Vector3[] => {
  switch (profile.type) {
    case ExtrusionProfileType.Arc:
      return getPointsOnArcFrame(profile, frame);
    case ExtrusionProfileType.Ellipse:
      return getPointsOnEllipseFrame(profile, frame);
    case ExtrusionProfileType.Square:
      return getPointsOnSquareFrame(profile, frame);
  }
};

export const loft = (a: Vector3[], b: Vector3[], closed: boolean = false): Mesh => ({
  vertices: [...a, ...b],
  faces: a.map((_, i) => [i, (i + 1) % a.length, ((i + 1) % a.length) + a.length, i + a.length]).slice(0, closed ? -0 : -1) as Face[],
});

export const vertexHash = (v: Vector3 | V3): string => `${v.x.toFixed(3)}_${v.y.toFixed(3)}_${v.z.toFixed(3)}`;

export const joinMeshes = (meshes: Mesh[]): Mesh => {
  const vertices: Vector3[] = [];
  const vertexMap: Map<string, number> = new Map();

  const faces: Face[] = [];

  meshes.forEach((mesh) => {
    const localHashes: string[] = [];
    mesh.vertices.forEach((v) => {
      const hash = vertexHash(v);
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

export const voxelToMesh = (voxel: Voxel, extrusionProfile: ExtrusionProfile): Mesh => {
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
    backFrameMesh.faces.map((f) => f.reverse());
    meshes.push(backFrameMesh);
    meshes.push(closeVoxel(voxel));
  });

  return joinMeshes(meshes);
};

export const meshToBabylonMesh = (mesh: Mesh, scene: Scene, centerPoint: Vector3, name: string, material?: StandardMaterial): BabylonMesh => {
  const babylonMesh = new BabylonMesh(name, scene);
  if (material) babylonMesh.material = material;
  const vertexData = new VertexData();
  vertexData.positions = mesh.vertices.flatMap((v) => [
    (v.x - centerPoint.x) * UNIT_SCALING + centerPoint.x,
    (v.z - centerPoint.y) * UNIT_SCALING + centerPoint.y,
    (-v.y - centerPoint.z) * UNIT_SCALING + centerPoint.z,
  ]);
  vertexData.indices = mesh.faces.flatMap((f) => (f.length === 4 ? [f[0], f[1], f[2], f[0], f[2], f[3]] : f));

  const normals: number[] = [];
  VertexData.ComputeNormals(vertexData.positions, vertexData.indices, normals);
  vertexData.normals = normals;
  vertexData.applyToMesh(babylonMesh);
  return babylonMesh;
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
  const centerPoint = getCenterOfV3s(fB);
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
  const centerPoint = getCenterOfV3s(fB);

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

const getVertexDataForFaceWithData = (fs: FaceWithData[]): VertexData => {
  const vertexData = new VertexData();
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  fs.forEach((f, i) => {
    positions.push(...f.vertices.map((v) => [v.x * UNIT_SCALING, v.z * UNIT_SCALING, v.y * UNIT_SCALING]).flat());
    indices.push(i * 3, i * 3 + 1, i * 3 + 2);
    normals.push(...f.normals.map((v) => [v.x, v.z, v.y]).flat());
    uvs.push(...f.uvs.map((v) => [v.u, v.v]).flat());
  });

  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;

  return vertexData;
};

export const renderHalfEdgeMesh = (m: HalfEdgeMesh, scene: Scene, name: string, renderMethod?: HalfEdgeRenderMethod) => {
  const facedata = getFacesWithDataForHalfEdgeMesh(m, renderMethod);

  const vertexData = getVertexDataForFaceWithData(facedata);

  // const material = new StandardMaterial('normal', scene);
  // material.wireframe = true;

  // toda add material
  const babylonMesh = new BabylonMesh(name, scene);
  // babylonMesh.material = material;
  vertexData.applyToMesh(babylonMesh);
};
