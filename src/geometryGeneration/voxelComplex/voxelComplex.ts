import { getWorldXYToFrameTransformation } from '../baseGeometry';
import { BaseFrame } from '../geometrytypes';
import { FaceMetaData } from '../halfEdge/types/faceMetaData';
import { HalfEdgeFace } from '../halfEdge/types/halfEdgeFace';
import { linkingHalfEdges } from '../halfEdge/halfedge';
import { getRandomUUID } from '../helpermethods';
import { V3 } from '../v3';
import { getNeighbourState, isFaceClosed } from './voxelComplex.states';
import { VoxelComplex, Voxel } from './types/voxelComplex';
import { HalfEdgeMesh } from '../halfEdge/types/HalfEdgeMesh';
import { HalfEdge } from '../halfEdge/types/halfEdge';

const getTopFaceIndexes = (v: Voxel): number[] => [...Array(v.n).keys()].map((i) => i + v.n);
const getBottomFaceIndexes = (v: Voxel): number[] => [...Array(v.n).keys()].reverse();
const getSideFaceIndexes = (v: Voxel, i: number): [number, number, number, number] => [i, (i + 1) % v.n, v.n + ((i + 1) % v.n), v.n + i];
const getFaceIndexArraysForVoxel = (v: Voxel, vX: VoxelComplex, includeFacesWithNeighbour?: boolean): number[][] => {
  const faceIndexes: number[][] = [];
  if (includeFacesWithNeighbour || isFaceInVoxelClosed(v, vX, 0)) faceIndexes.push(getTopFaceIndexes(v));
  if (includeFacesWithNeighbour || isFaceInVoxelClosed(v, vX, 1)) faceIndexes.push(getBottomFaceIndexes(v));
  for (let i = 0; i < v.n; i++) if (includeFacesWithNeighbour || isFaceInVoxelClosed(v, vX, i + 2)) faceIndexes.push(getSideFaceIndexes(v, i));
  return faceIndexes;
};

// key method for knowing whether to not close a face
export const isFaceInVoxelClosed = (v: Voxel, vX: VoxelComplex, faceIndex: number): boolean => isFaceClosed(v.state, getNeighbourState(v, vX, faceIndex));

const getTopFace = (v: Voxel): string[] => v.vertices.slice(v.n, 2 * v.n);
const getBottomFace = (v: Voxel): string[] => v.vertices.slice(0, v.n).reverse();
const getSideFace = (v: Voxel, i: number) => getSideFaceIndexes(v, i).map((idx) => v.vertices[idx]) as [string, string, string, string];

const getSideFaces = (v: Voxel): [string, string, string, string][] => {
  const faces: [string, string, string, string][] = [];
  for (let i = 0; i < v.n; i++) faces.push(getSideFace(v, i));
  return faces;
};

export const gefFace = (v: Voxel, i: number) => {
  if (i < 0 || i > v.n + 1) throw new Error(`index ${i} is not in the face domain [0, ${i + 1} for voxel ${v.id} with ${v.n + 2} faces`);
  if (i === 0) return getTopFace(v);
  if (i === 1) return getBottomFace(v);
  else return getSideFace(v, i - 2);
};

const getAllFaces = (v: Voxel): string[][] => [getTopFace(v), getBottomFace(v), ...getSideFaces(v)];

const isFaceNaked = (v: Voxel, i: number): boolean => {
  if (i < 0 || i > v.n + 1) throw new Error(`index ${i} is not in the face domain [0, ${i + 1} for voxel ${v.id} with ${v.n + 2} faces`);
  return Boolean(v.neighbourMap[i]);
};

export const getCenterOfVoxel = (v: Voxel, voxelComplex: VoxelComplex): V3 => V3.getCenter(v.vertices.map((v) => voxelComplex.vertices[v]));
export const getCenterOfVoxelFace = (v: Voxel, voxelComplex: VoxelComplex, i: number): V3 => V3.getCenter(gefFace(v, i).map((v) => voxelComplex.vertices[v]));

const getHalfEdgeCountForVoxel = (v: Voxel): number => 2 * v.n + 4 * v.n;

// returns the neigbour face idx and the half edge / vertex index on that face
const getNeighbourForFaceIndexes = (n: number, fIdx: number, vIdx: number): [number, number] | undefined => {
  // top face case
  if (fIdx === 0) return [2 + ((vIdx + n - 1) % n), 3];
  // bottom face case
  if (fIdx === 1) return [2 + (n - 1 - (vIdx % n)), 1];
  // side faces
  if (vIdx === 3) return [0, (fIdx + n - 1) % n];
  if (vIdx === 1) return [1, (n - fIdx + 1) % n];
  if (vIdx === 0) return [2 + ((((fIdx - 2) % n) + n - 1) % n), 2];
  if (vIdx === 2) return [2 + ((fIdx + n - 1) % n), 0];
  // should not happen
  throw new Error(`invalid face index ${fIdx} and vertex index ${vIdx}`);
};

export const getHalfEdgeMeshForVoxel = (v: Voxel, voxelComplex: VoxelComplex, scaleValue?: number, includeFacesWithNeighbour?: boolean): HalfEdgeMesh => {
  let vertices;
  if (scaleValue) {
    // get the center of the vertices
    const center = v.vertices
      .map((ver) => voxelComplex.vertices[ver])
      .reduce((a, b, _, arr) => ({ x: a.x + b.x / arr.length, y: a.y + b.y / arr.length, z: a.z + b.z / arr.length }), { x: 0, y: 0, z: 0 });
    vertices = Object.fromEntries(v.vertices.map((ver) => [ver, V3.add(center, V3.mul(V3.sub(voxelComplex.vertices[ver], center), scaleValue))]));
  } else vertices = Object.fromEntries(v.vertices.map((ver) => [v, voxelComplex.vertices[ver]]));
  const halfEdges: { [k: string]: HalfEdge } = {};
  const faces: { [k: string]: HalfEdgeFace } = {};

  const metaData: FaceMetaData = { originVoxelId: v.id };

  const indexesOnFaceArray = getFaceIndexArraysForVoxel(v, voxelComplex, includeFacesWithNeighbour);
  const halfEdgeIndexes = indexesOnFaceArray.map((f) => f.map(() => getRandomUUID()));

  indexesOnFaceArray.forEach((indexesOnFace, i) => {
    const faceId = getRandomUUID();
    faces[faceId] = { id: faceId, edge: halfEdgeIndexes[i][0], metaData };
    indexesOnFace.forEach((vI, j) => {
      const edgeId = halfEdgeIndexes[i][j];
      const neigbours = getNeighbourForFaceIndexes(v.n, i, j);
      halfEdges[edgeId] = {
        id: edgeId,
        face: faceId,
        vertex: v.vertices[vI],
        next: halfEdgeIndexes[i][(j + 1) % indexesOnFace.length],
        previous: halfEdgeIndexes[i][(j + indexesOnFace.length - 1) % indexesOnFace.length],
        neighbour:
          neigbours && halfEdgeIndexes[neigbours[0]] && halfEdgeIndexes[neigbours[0]][neigbours[1]] ? halfEdgeIndexes[neigbours[0]][neigbours[1]] : undefined,
      };
    });
  });

  return { faces, halfEdges, vertices };
};

const voxelComplexFromHalfEdgeMesh = (heMesh: HalfEdgeMesh, frames: BaseFrame[]) => {
  const baseVertexList = Object.values(heMesh.vertices);
  const vertices: { [k: string]: V3 } = JSON.parse(JSON.stringify(heMesh.vertices));
  frames.forEach((frame) => {
    const transformation = getWorldXYToFrameTransformation(frame);
    baseVertexList.forEach((v) => {
      const localV = V3.transform(v, transformation);
      vertices[V3.getHash(v)] = localV;
    });
  });
};

export const getHalfEdgeMeshesFromVoxelComplex = (voxelComplex: VoxelComplex, scaleValue?: number, includeFacesWithNeighbour?: boolean): HalfEdgeMesh[] => {
  const heMeshes: HalfEdgeMesh[] = [];
  Object.values(voxelComplex.voxels).forEach((voxel) => {
    const heMesh = getHalfEdgeMeshForVoxel(voxel, voxelComplex, scaleValue, includeFacesWithNeighbour);
    heMeshes.push(heMesh);
  });
  return heMeshes;
};

export const getHalfEdgeMeshForVoxelEnclosure = (voxelComplex: VoxelComplex): HalfEdgeMesh => {
  const heMeshes = getHalfEdgeMeshesFromVoxelComplex(voxelComplex, 1.0, false);

  const vertices: { [k: string]: V3 } = {};
  Object.values(heMeshes).forEach((heMesh) => Object.assign(vertices, heMesh.vertices));

  const faces: { [k: string]: HalfEdgeFace } = {};
  Object.values(heMeshes).forEach((heMesh) => Object.assign(faces, heMesh.faces));

  const halfEdges: { [k: string]: HalfEdge } = {};
  Object.values(heMeshes).forEach((heMesh) => Object.assign(halfEdges, heMesh.halfEdges));

  // re-linking half edges
  linkingHalfEdges(halfEdges);

  return {
    vertices,
    faces,
    halfEdges,
  };
};
