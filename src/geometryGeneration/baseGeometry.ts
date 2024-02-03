import { Vector3, Mesh as BabylonMesh, VertexData, Scene } from '@babylonjs/core';

// this mesh assumes a positive oriented coordinate system, which means we will have to transform the mesh when importing them into a babylon scene

export type Face = [number, number, number] | [number, number, number, number];
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

const ARC_DIVSION_COUNT = 12;

const getArc = (frame: Frame): Vector3[] => {
  let index = 0;
  const angleDelta = (Math.PI * 0.5) / ARC_DIVSION_COUNT;

  const vertices = [];

  for (let i = 0; i < ARC_DIVSION_COUNT + 1; i++) {
    const angle = i * angleDelta;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    const point = frame.origin.add(frame.xAxis.scale(x)).add(frame.yAxis.scale(y));
    vertices.push(point);
    index++;
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
    faces: polygon.length === 3 ? [[1, 2, 0]] : [[0, 2, 3, 1]],
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

export const joinMeshes = (meshes: Mesh[]): Mesh => {
  const vertices: Vector3[] = [];

  const faceIndexMap: Map<number, number> = new Map();
  const faces: Face[] = [];

  let vertexIndexCount = 0;
  let meshStartIndex = 0;
  meshes.forEach((mesh) => {
    meshStartIndex = vertexIndexCount;
    mesh.vertices.forEach((v) => {
      const closestIndex = vertices.findIndex((v2) => v2.subtract(v).lengthSquared() < 0.0001);
      if (closestIndex === -1) {
        vertices.push(v);
        faceIndexMap.set(vertexIndexCount, vertices.length - 1);
      } else {
        faceIndexMap.set(vertexIndexCount, closestIndex);
      }
      vertexIndexCount++;
    });

    mesh.faces.forEach((face) => faces.push(face.map((i) => faceIndexMap.get(i + meshStartIndex) as number) as Face));
  });

  return { vertices, faces };
};

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

export const meshToBabylonMesh = (mesh: Mesh, scene: Scene): BabylonMesh => {
  const babylonMesh = new BabylonMesh('custom', scene);
  const vertexData = new VertexData();
  vertexData.positions = mesh.vertices.flatMap((v) => [v.x, v.z, -v.y]);
  vertexData.indices = mesh.faces.flatMap((f) => (f.length === 4 ? [f[0], f[1], f[2], f[0], f[2], f[3]] : f));

  const normals: number[] = [];
  VertexData.ComputeNormals(vertexData.positions, vertexData.indices, normals);
  vertexData.normals = normals;
  vertexData.applyToMesh(babylonMesh);
  return babylonMesh;
};
