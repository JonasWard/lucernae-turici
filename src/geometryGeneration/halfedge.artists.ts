import { Scene, Material, VertexData, Color3, StandardMaterial, Mesh } from '@babylonjs/core';
import { HalfEdgeFace, HalfEdgeMesh } from './geometrytypes';
import { V3 } from './v3';
import { getFaceEdges, getFaceNormal, getVerticesFacesMap } from './halfedge';

export const createStandardLampMaterial = (scene: Scene) => {
  const material = new StandardMaterial('lamp', scene);
  material.diffuseColor = new Color3(1, 1, 1);
  material.specularColor = new Color3(1, 1, 1);
  material.emissiveColor = new Color3(1, 1, 1);
  return material;
};

export class HalfEdgeMeshRenderer {
  static getNormalsForFacesMap = (heMesh: HalfEdgeMesh): { [k: string]: V3 } =>
    Object.fromEntries(Object.values(heMesh.faces).map((face) => [face.id, getFaceNormal(face, heMesh)]));

  static getNormalsForVertices = (heMesh: HalfEdgeMesh): { [k: string]: V3 } => {
    const normalsForFacesMap = HalfEdgeMeshRenderer.getNormalsForFacesMap(heMesh);
    const verticesFacesMap = getVerticesFacesMap(heMesh);

    return Object.fromEntries(Object.entries(verticesFacesMap).map(([id, fIds]) => [id, V3.getUnit(V3.add(...fIds.map((fId) => normalsForFacesMap[fId])))]));
  };

  static getTriangularVerticesForFace = (face: HalfEdgeFace, mesh: HalfEdgeMesh): [string, string, string][] => {
    const edges = getFaceEdges(face, mesh);
    switch (edges.length) {
      case 0:
      case 1:
      case 2:
        console.log('invalid face, not triangulated');
        return [];
      case 3:
        return [[edges[0].vertex, edges[1].vertex, edges[2].vertex]];
      default:
        const first = edges[0].vertex;
        return edges.slice(1, edges.length - 1).map((edge) => [first, edge.vertex, mesh.halfEdges[edge.next].vertex]);
    }
  };

  static getVertexIndicesMap = (mesh: HalfEdgeMesh): { [k: string]: number } => Object.fromEntries(Object.keys(mesh.vertices).map((v, i) => [v, i]));
  static getPositionsForVertices = (mesh: HalfEdgeMesh): number[] =>
    Object.values(mesh.vertices)
      .map((v) => [v.x, v.z, -v.y])
      .flat();

  static getUVsForVertices = (mesh: HalfEdgeMesh): number[] =>
    Object.values(mesh.vertices)
      .map((v) => [v.x, v.z])
      .flat();

  static getVertexDataForHEMesh = (mesh: HalfEdgeMesh) => {
    const vertexData = new VertexData();

    const vertexIndicesMap = HalfEdgeMeshRenderer.getVertexIndicesMap(mesh);
    // const normalsForVertices = HalfEdgeMeshRenderer.getNormalsForVertices(mesh);
    const triangularFacesArray = Object.values(mesh.faces)
      .map((face) => HalfEdgeMeshRenderer.getTriangularVerticesForFace(face, mesh))
      .flat();

    vertexData.positions = HalfEdgeMeshRenderer.getPositionsForVertices(mesh);
    vertexData.indices = Object.values(triangularFacesArray)
      .map((face) =>
        face.map((v) => {
          return vertexIndicesMap[v];
        })
      )
      .flat();

    const normals: number[] = [];

    VertexData.ComputeNormals(vertexData.positions, vertexData.indices, normals);

    vertexData.normals = normals;

    vertexData.uvs = HalfEdgeMeshRenderer.getUVsForVertices(mesh);

    return vertexData;
  };

  public static render = (mesh: HalfEdgeMesh, scene: Scene, material?: Material | StandardMaterial, name: string = 'halfEdgeMesh') => {
    const meshMaterial = material ?? createStandardLampMaterial(scene);

    const babylonMesh = new Mesh(name, scene);
    const vertexData = HalfEdgeMeshRenderer.getVertexDataForHEMesh(mesh);
    vertexData.applyToMesh(babylonMesh);
    babylonMesh.material = meshMaterial;

    return babylonMesh;
  };
}
