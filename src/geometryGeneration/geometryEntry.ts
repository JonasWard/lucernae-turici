import { Mesh, Scene } from '@babylonjs/core';
import { GeometryBaseData } from './baseGeometry';
import { VoxelComplexMeshArtist } from './voxelComplex.artists';
import { VoxelFactory } from './voxelComplex.factory';

export const AddLampGeometryToScene = (lampGeometry: GeometryBaseData, scene: Scene, existingMesh: Mesh | null): Mesh => {
  const name = 'lampGeometry';

  if (existingMesh) existingMesh.dispose();

  const voxelComplex = VoxelFactory.getVoxelComplexFromGeometryBaseData(lampGeometry);
  return VoxelComplexMeshArtist.render(voxelComplex, scene, lampGeometry, undefined, name);
};
