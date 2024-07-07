import { HalfEdgeMeshFactory } from '../halfEdge/halfedge.factory';
import { Mesh, V3 } from '../v3';
import { MalculmiusOneFootprint } from './types/malcolmiusOne';

const MALCULMIUS_TOLERANCE = 0.01;

// helper logic for creating a single segment of a malculmius one
const singleShard = (o: V3, v0: V3, v1: V3, r0: number, r1: number, o0: number): V3[][] => {
  const t0 = V3.add(o, V3.mul(v0, r1));
  const t1 = V3.add(o, V3.mul(v1, r1));

  const topVs: V3[] = [];

  if (Math.abs(o0) < MALCULMIUS_TOLERANCE) {
    topVs.push(t0, t1);
  } else {
    const d = V3.mul(V3.add(t0, t1), 0.5);
    topVs.push(t0, V3.add(o, V3.mul(d, 1 + o0 / V3.getLength(d))), t1);
  }

  if (r0 < MALCULMIUS_TOLERANCE) {
    if (topVs.length === 3 && o0 < 0)
      return [
        [o, topVs[0], topVs[1]],
        [o, topVs[1], topVs[2]],
      ];
    else return [[o, topVs[0], topVs[1], topVs[2]]];
  } else {
    const p0 = V3.add(o, V3.mul(v0, r0));
    const p1 = V3.add(o, V3.mul(v1, r0));

    if (topVs.length === 3 && o0 < 0)
      return [
        [p1, p0, topVs[1]],
        [topVs[1], p0, topVs[0]],
        [topVs[2], p1, topVs[1]],
      ];
    else if (topVs.length === 3) return [[p1, p0, ...topVs]];
    else return [[p1, p0, topVs[0], topVs[1]]];
  }
};

// helper method for rotating and copying a set of vertices
const copyAndRotate = (vss: V3[][], o: V3, angle: number): V3[][] => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return vss.map((vs) => vs.map((v) => V3.fromNumbers((v.x - o.x) * cos - (v.y - o.y) * sin + o.x, (v.x - o.x) * sin + (v.y - o.y) * cos + o.y, v.z)));
};

export const createFootprintMesh = (malcolmiusOne: MalculmiusOneFootprint): Mesh => {
  // creating the base profiles
  const { circleRadius, circleDivisions, angleSplit, offsetA, offsetB, innerRadius } = malcolmiusOne;

  const angleDelta = (Math.PI * 2) / circleDivisions;
  const angleDeltaSplit = angleDelta * angleSplit;

  const v0 = V3.fromNumbers(1, 0, 0);
  const v1 = V3.fromNumbers(Math.cos(angleDeltaSplit), Math.sin(angleDeltaSplit), 0);
  const v2 = V3.fromNumbers(Math.cos(angleDelta), Math.sin(angleDelta), 0);

  const shards = [...singleShard(V3.Origin, v0, v1, innerRadius, circleRadius, offsetA), ...singleShard(V3.Origin, v1, v2, innerRadius, circleRadius, offsetB)];

  const vertexSets: V3[][] = [];
  for (let i = 0; i < circleDivisions; i++) vertexSets.push(...copyAndRotate(shards, V3.Origin, i * angleDelta));

  return Mesh.joinMeshes(vertexSets.map((vertices) => Mesh.makeFromPolygon(vertices)));
};

export const createFootprintHalfedgeMesh = (malcolmiusOne: MalculmiusOneFootprint) =>
  HalfEdgeMeshFactory.createHalfEdgeMeshFromMesh(createFootprintMesh(malcolmiusOne));
