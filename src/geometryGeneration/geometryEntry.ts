import { Mesh, Scene, StandardMaterial, TransformNode } from '@babylonjs/core';
import { GeometryBaseData, renderHalfEdge } from './baseGeometry';
import { VoxelComplexMeshArtist, getMeshRepresentationOfVoxelComplexGraph } from './voxelComplex.artists';
import { VoxelFactory } from './voxelComplex.factory';
import { getHalfEdgeMeshForVoxelEnclosure } from './voxelComplex';
import { HalfEdgeMeshRenderer } from './halfedge.artists';
import { HalfEdgeMeshFactory } from './halfedge.factory';

export enum RenderMethod {
  NORMAL = 'Normal',
  WIREFRAME = 'Wireframe',
  ENCLOSURE = 'Enclosure',
  HALFEDGESENCLOSURE = 'HalfEdgesEnclosure',
  NEIGHHBOURMAP = 'Neighbourmap',
  BASEMESH = 'BaseMesh',
}

export const LAMP_MESH = 'lampMesh';

export const AddLampGeometryToScene = (
  lampGeometry: GeometryBaseData,
  scene: Scene,
  renderMethod: RenderMethod = RenderMethod.NORMAL
): Mesh | TransformNode => {
  scene.meshes.filter((m) => m.name === LAMP_MESH).forEach((m) => m.dispose());

  const existingRootNode = scene.getTransformNodeByName('rootNode');
  const rootNode = existingRootNode ? existingRootNode : new TransformNode('rootNode', scene);

  const voxelComplex = VoxelFactory.getVoxelComplexFromGeometryBaseData(lampGeometry);
  switch (renderMethod) {
    case RenderMethod.NORMAL:
      return VoxelComplexMeshArtist.render(voxelComplex, scene, lampGeometry, undefined, LAMP_MESH);
    case RenderMethod.WIREFRAME:
      const exisitingWireframeMaterial = scene.getMaterialByName('wireframeMaterial');
      const wireframeMaterial = exisitingWireframeMaterial ? exisitingWireframeMaterial : new StandardMaterial('wireframeMaterial', scene);
      wireframeMaterial.wireframe = true;
      return VoxelComplexMeshArtist.render(voxelComplex, scene, lampGeometry, wireframeMaterial, LAMP_MESH);
    case RenderMethod.ENCLOSURE:
    case RenderMethod.HALFEDGESENCLOSURE:
      const enclosureMesh = getHalfEdgeMeshForVoxelEnclosure(voxelComplex);
      if (renderMethod === RenderMethod.ENCLOSURE) return HalfEdgeMeshRenderer.render(enclosureMesh, scene, undefined, LAMP_MESH);
      Object.values(enclosureMesh.halfEdges).map((he) => renderHalfEdge(he, enclosureMesh, scene, undefined, rootNode));
      return rootNode;
    case RenderMethod.NEIGHHBOURMAP:
      getMeshRepresentationOfVoxelComplexGraph(voxelComplex, scene, rootNode, 20);
      return rootNode;
    case RenderMethod.BASEMESH:
      const footprintHeMesh = HalfEdgeMeshFactory.getFootprintFromGeometryBaseData(lampGeometry);
      Object.values(footprintHeMesh.halfEdges).map((he) => renderHalfEdge(he, footprintHeMesh, scene, undefined, rootNode, false));
      return rootNode;
  }
};
