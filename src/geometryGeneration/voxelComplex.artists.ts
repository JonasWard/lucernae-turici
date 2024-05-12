import { Color3, Scene, StandardMaterial, MeshBuilder, Vector3 } from '@babylonjs/core';
import { V2 } from './geometrytypes';
import { ExtrusionProfile } from './baseGeometry';
import { V3 } from './v3';
import { VoxelComplex, Voxel } from './voxelComplex.type';
import { getCenterOfVoxelFace, getCenterOfVoxel } from './voxelComplex';

const vSize = 0.02;
const vHSize = vSize * 0.2;
const edgeResolution = 5;
const colorScale = 200;

const getColorForVertex = (v: V3): string => {
  const r = Math.ceil((v.x * colorScale) % 265).toString(16);
  const g = Math.ceil((v.y * colorScale) % 265).toString(16);
  const b = Math.ceil((v.z * colorScale) % 265).toString(16);
  return `#${r.length < 2 ? '0' + r : r}${g.length < 2 ? '0' + g : g}${b.length < 2 ? '0' + b : b}`;
};

const getColorForUUID = (s: string): string => `#${s.slice(0, 6)}`;

const getMaterialForColor = (c: string, scene: Scene): StandardMaterial => {
  let material = scene.materials.find((m) => m.name === c) as StandardMaterial | undefined;
  if (!material) {
    material = new StandardMaterial(c, scene);
    const c3 = Color3.FromHexString(c);
    material.diffuseColor = c3;
    material.ambientColor = c3;
    // material.emissiveColor = c3;
  }

  return material;
};

// creates a cube mesh representation for a vertex
export const getMeshForVertex = (c: V3, scene: Scene, color?: string) => {
  const localColor = color ?? getColorForVertex(c);
  const material = getMaterialForColor(localColor, scene);

  const vHash = V3.getHash(c);

  const babylonMesh = MeshBuilder.CreateSphere(vHash, { segments: 2, diameter: vSize }, scene);
  babylonMesh.material = material;

  babylonMesh.position.set(c.x, c.z, c.y);
};

export const getMeshForEdge = (v0: V3, v1: V3, scene: Scene, id: string, color?: string) => {
  const localColor = color ?? getColorForUUID(id);
  const material = getMaterialForColor(localColor, scene);

  const babylonMesh = MeshBuilder.CreateTube(id, {
    path: [new Vector3(v0.x, v0.z, v0.y), new Vector3(v1.x, v1.z, v1.y)],
    tessellation: edgeResolution,
    radius: vHSize,
    cap: 0, // no cap
  });

  babylonMesh.material = material;
};

const getRepresentativeLocationForVoxelFace = (voxel: Voxel, vX: VoxelComplex, index: number): V3 => {
  const fC = getCenterOfVoxelFace(voxel, vX, index);
  const cC = getCenterOfVoxel(voxel, vX);

  return V3.add(cC, V3.mul(V3.sub(fC, cC), 0.5));
};

const getVertexPairForFaceInVoxel = (voxel: Voxel, vX: VoxelComplex, index: number): [V3, V3] | undefined => {
  if (voxel.neighbourMap[index] === null) return undefined;

  const v0 = getRepresentativeLocationForVoxelFace(voxel, vX, index);
  const v1 = getRepresentativeLocationForVoxelFace(vX.voxels[voxel.neighbourMap[index]![0]], vX, voxel.neighbourMap[index]![1]);

  return [v0, V3.add(v0, V3.mul(V3.sub(v1, v0), 0.5))];
};

// getting the center of a face in a voxelcomplex
const getRepresentativeMeshForVoxelFace = (voxel: Voxel, vX: VoxelComplex, index: number, scene: Scene) => {
  // getting the center of the face
  const v = getRepresentativeLocationForVoxelFace(voxel, vX, index);

  getMeshForVertex(v, scene, getColorForUUID(voxel.id));
};

const getAllRepresentativeMeshForVoxelFace = (voxel: Voxel, vX: VoxelComplex, scene: Scene) => {
  for (let i = 0; i < voxel.n + 2; i++) {
    getRepresentativeMeshForVoxelFace(voxel, vX, i, scene);
    const pair = getVertexPairForFaceInVoxel(voxel, vX, i);
    if (pair) getMeshForEdge(pair[0], pair[1], scene, `${voxel.id}-${i}`);
  }
};

export const applyMalcolmiusLogic = (vX: VoxelComplex, extrusionProfile: ExtrusionProfile, scene: Scene) => {};

export const curveForQuad = (v00: V3, v01: V3, v11: V3, v10: V3, uvs: V2[]): V3[] =>
  uvs.map((uv) => V3.add(V3.mul(v00, (1 - uv.u) * (1 - uv.v)), V3.mul(v01, (1 - uv.u) * uv.v), V3.mul(v10, uv.u * (1 - uv.v)), V3.mul(v11, uv.u * uv.v)));

// to parse a single voxel, go face by face and for every face, come up with the mesh logic that applies based on the neigbouring voxel
// for now we only consider

export const voxelToMesh = (voxel: Voxel, vX: VoxelComplex, geometryParsing: any) => {
  // voxel by voxel parsing
};

export const getMeshRepresentationOfVoxelComplexGraph = (vX: VoxelComplex, scene: Scene) => {
  Object.values(vX.vertices).map((v) => getMeshForVertex(v, scene));

  // render the face vertices
  Object.values(vX.voxels).forEach((voxel) => getAllRepresentativeMeshForVoxelFace(voxel, vX, scene));
};
