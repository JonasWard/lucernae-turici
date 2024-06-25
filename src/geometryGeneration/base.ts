import { Scene, TransformNode, Vector3 } from '@babylonjs/core';
import { GeometryBaseData, joinMeshes, polygonToMesh } from './baseGeometry';
import { HalfEdgeMeshFactory } from './halfedge.factory';
import { getBoundariesForHalfEdgeMesh, getHalfEdgeMeshFromMesh } from './halfedge';
import { V3 } from './v3';
import { VoxelFactory } from './voxelComplex.factory';
import { getHalfEdgeMeshForVoxelEnclosure } from './voxelComplex';
import { MaterialFactory } from './materialFactory';
import { HalfEdgeMeshRenderer } from './halfedge.artists';

const holeCounts = 12;
const tDelta = 1 / holeCounts;

export const constructBase = (gBD: GeometryBaseData, scene: Scene, rootNode: TransformNode) => {
  // get the voxel footprint base of the geometry
  const heMesh = HalfEdgeMeshFactory.getFootprintFromGeometryBaseData(gBD);

  const heEdges = getBoundariesForHalfEdgeMesh(heMesh);

  const heEdgeVertices = heEdges
    .map((heEdge) => heEdge.map((he) => heMesh.vertices[he.vertex]))
    .sort((a, b) => {
      const dA = V3.getBoundingBox(a);
      const dB = V3.getBoundingBox(b);

      return V3.getLength(V3.sub(dB.max, dB.min)) - V3.getLength(V3.sub(dA.max, dA.min));
    });

  const vertices = heEdgeVertices[0];
  const center = V3.getCenter(vertices);

  const polygons: V3[][] = [];

  vertices.forEach((v, i, arr) => {
    const next = arr[(i + 1) % arr.length];
    const v0 = V3.sub(v, center);
    const v1 = V3.sub(next, center);
    const vD = V3.sub(v1, v0);
    const vs: V3[] = [next, v];
    for (let i = 0; i <= holeCounts; i += tDelta) {
      const t = i * tDelta;
      const v = V3.add(v0, V3.mul(vD, t));
      vs.push(V3.mul(V3.getUnit(v), gBD.base.sideInnerRadius));
    }
    polygons.push(vs);
  });

  const heMeshWithHoles = getHalfEdgeMeshFromMesh(
    joinMeshes(polygons.map((s) => polygonToMesh(s.map((v) => new Vector3(v.x, v.y, v.z - gBD.base.sideHeight)))))
  );
  const dir = V3.mul(V3.ZAxis, gBD.base.sideHeight);
  const voxelComplex = VoxelFactory.extrudeHalfEdgeMesh(heMeshWithHoles, dir);
  const enclosureMesh = getHalfEdgeMeshForVoxelEnclosure(voxelComplex);

  const mesh = HalfEdgeMeshRenderer.render(enclosureMesh, scene, MaterialFactory.getLampMaterial(scene), 'baseMesh');
  mesh.parent = rootNode;
};
