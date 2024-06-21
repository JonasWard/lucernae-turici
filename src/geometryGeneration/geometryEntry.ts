import { Mesh, Scene, TransformNode } from '@babylonjs/core';
import { GeometryBaseData, renderHalfEdge } from './baseGeometry';
import { VoxelComplexMeshArtist, getMeshRepresentationOfVoxelComplexGraph } from './voxelComplex.artists';
import { VoxelFactory } from './voxelComplex.factory';
import { getHalfEdgeMeshForVoxelEnclosure } from './voxelComplex';
import { HalfEdgeMeshRenderer } from './halfedge.artists';
import { HalfEdgeMeshFactory } from './halfedge.factory';
import { MaterialFactory } from './materialFactory';

export enum RenderMethod {
  NORMAL = 'Normal',
  WIREFRAME = 'Wireframe',
  ENCLOSURE = 'Enclosure',
  HALFEDGESENCLOSURE = 'HalfEdgesEnclosure',
  NEIGHHBOURMAP = 'Neighbourmap',
  BASEMESH = 'BaseMesh',
}

export const LAMP_MESH = 'lampMesh';
export const ROOT_NODE = 'rootNode';

export const AddLampGeometryToScene = (
  lampGeometry: GeometryBaseData,
  scene: Scene,
  renderMethod: RenderMethod = RenderMethod.NORMAL
): Mesh | TransformNode => {
  scene.meshes.filter((m) => m.name === LAMP_MESH).forEach((m) => m.dispose(false, true));

  const rootNode = scene.getTransformNodeByName(ROOT_NODE) ?? new TransformNode(ROOT_NODE, scene);
  rootNode.getChildMeshes().forEach((m) => m.dispose(false, true));

  const voxelComplex = VoxelFactory.getVoxelComplexFromGeometryBaseData(lampGeometry);
  switch (renderMethod) {
    case RenderMethod.NORMAL:
      return VoxelComplexMeshArtist.render(voxelComplex, scene, lampGeometry, undefined, LAMP_MESH);
    case RenderMethod.WIREFRAME:
      return VoxelComplexMeshArtist.render(voxelComplex, scene, lampGeometry, MaterialFactory.getWireframeMaterial(scene), LAMP_MESH);
    case RenderMethod.ENCLOSURE:
    case RenderMethod.HALFEDGESENCLOSURE:
      const enclosureMesh = getHalfEdgeMeshForVoxelEnclosure(voxelComplex);
      if (renderMethod === RenderMethod.ENCLOSURE)
        return HalfEdgeMeshRenderer.render(enclosureMesh, scene, MaterialFactory.getDefaultMaterial(scene), LAMP_MESH);
      Object.values(enclosureMesh.halfEdges).map((he) => renderHalfEdge(he, enclosureMesh, scene, rootNode, false));
      return rootNode;
    case RenderMethod.NEIGHHBOURMAP:
      getMeshRepresentationOfVoxelComplexGraph(voxelComplex, scene, rootNode, 20);
      return rootNode;
    case RenderMethod.BASEMESH:
      const footprintHeMesh = HalfEdgeMeshFactory.getFootprintFromGeometryBaseData(lampGeometry);
      Object.values(footprintHeMesh.halfEdges).map((he) => renderHalfEdge(he, footprintHeMesh, scene, rootNode, false));
      return rootNode;
  }
};
