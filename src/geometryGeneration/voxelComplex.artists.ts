import { Color3, Scene, StandardMaterial, MeshBuilder, Vector3, Material, Mesh as BabylonMesh, TransformNode } from '@babylonjs/core';
import { ExtrusionProfile, GeometryBaseData } from './baseGeometry';
import { V3, Mesh } from './v3';
import { VoxelComplex, Voxel } from './voxelComplex.type';
import { getCenterOfVoxelFace, getCenterOfVoxel } from './voxelComplex';
import { VoxelMesh } from './voxelComplex.mesh';

const vSize = 0.02;
const vHSize = vSize * 0.2;
const edgeResolution = 5;
const colorScale = 200;

const getColorForVertex = (v: V3): string => {
  const r = Math.ceil((v.x * colorScale) % 255).toString(16);
  const g = Math.ceil((v.y * colorScale) % 255).toString(16);
  const b = Math.ceil((v.z * colorScale) % 255).toString(16);
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
export const getMeshForVertex = (c: V3, scene: Scene, color?: string, rootNode?: TransformNode, scale: number = 1) => {
  const localColor = color ?? getColorForVertex(c);
  const material = getMaterialForColor(localColor, scene);

  const vHash = V3.getHash(c);

  const babylonMesh = MeshBuilder.CreateSphere(vHash, { segments: 2, diameter: vSize * scale }, scene);

  if (rootNode) babylonMesh.parent = rootNode;

  babylonMesh.material = material;

  babylonMesh.position.set(c.x, c.z, -c.y);
};

export const getMeshForEdge = (v0: V3, v1: V3, scene: Scene, id: string, color?: string, rootNode?: TransformNode, scale: number = 1) => {
  const localColor = color ?? getColorForUUID(id);
  const material = getMaterialForColor(localColor, scene);

  const babylonMesh = MeshBuilder.CreateTube(id, {
    path: [new Vector3(v0.x, v0.z, -v0.y), new Vector3(v1.x, v1.z, -v1.y)],
    tessellation: edgeResolution,
    radius: vHSize * scale,
    cap: 0, // no cap
  });

  babylonMesh.material = material;
  if (rootNode) babylonMesh.parent = rootNode;
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
const getRepresentativeMeshForVoxelFace = (voxel: Voxel, vX: VoxelComplex, index: number, scene: Scene, rootNode?: TransformNode) => {
  // getting the center of the face
  const v = getRepresentativeLocationForVoxelFace(voxel, vX, index);

  getMeshForVertex(v, scene, getColorForUUID(voxel.id), rootNode);
};

const getAllRepresentativeMeshForVoxelFace = (voxel: Voxel, vX: VoxelComplex, scene: Scene, rootNode?: TransformNode, scale: number = 1) => {
  for (let i = 0; i < voxel.n + 2; i++) {
    getRepresentativeMeshForVoxelFace(voxel, vX, i, scene);
    const pair = getVertexPairForFaceInVoxel(voxel, vX, i);
    if (pair) getMeshForEdge(pair[0], pair[1], scene, `${voxel.id}-${i}`, undefined, rootNode, scale);
  }
};

export const applyMalcolmiusLogic = (vX: VoxelComplex, extrusionProfile: ExtrusionProfile, scene: Scene) => {};

// to parse a single voxel, go face by face and for every face, come up with the mesh logic that applies based on the neigbouring voxel
// for now we only consider

export const voxelToMesh = (voxel: Voxel, vX: VoxelComplex, geometryParsing: any) => {
  // voxel by voxel parsing
};

export const getMeshRepresentationOfVoxelComplexGraph = (vX: VoxelComplex, scene: Scene, rootNode?: TransformNode, scale: number = 1) => {
  Object.values(vX.vertices).map((v) => getMeshForVertex(v, scene, undefined, rootNode, scale));

  // render the face vertices
  Object.values(vX.voxels).forEach((voxel) => getAllRepresentativeMeshForVoxelFace(voxel, vX, scene, rootNode, scale));
};

export const createStandardLampMaterial = (scene: Scene) => {
  const material = new StandardMaterial('lamp', scene);
  material.diffuseColor = new Color3(1, 1, 1);
  material.specularColor = new Color3(1, 1, 1);
  material.emissiveColor = new Color3(1, 1, 1);
  return material;
};

// artist that renderers a voxel complex using a mesh representation
export class VoxelComplexMeshArtist {
  public static defaultMaterial = (scene: Scene) => {
    const material = new StandardMaterial('material', scene);
    material.ambientColor = new Color3(0.23, 0.23, 0.23);
    material.indexOfRefraction = 0.52;
    material.alpha = 1;
    material.cameraExposure = 0.66;
    material.cameraContrast = 1.66;
    material.emissiveColor = new Color3(0.67, 0.64, 0.49);
    material.wireframe = false;

    return material;
  };

  public static render = (vX: VoxelComplex, scene: Scene, gBD: GeometryBaseData, material?: Material | StandardMaterial, name = 'lampGeometry') => {
    const mesh = VoxelMesh.getMeshForVoxelComplex(vX, gBD);

    const meshMaterial = material ?? VoxelComplexMeshArtist.defaultMaterial(scene);
    const vertexData = Mesh.getVertexDataForMesh(mesh);
    const babylonMesh = new BabylonMesh(name, scene);
    vertexData.applyToMesh(babylonMesh);
    babylonMesh.material = meshMaterial;

    return babylonMesh;
  };
}
