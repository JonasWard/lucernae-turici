import { Scene, TransformNode } from '@babylonjs/core';
import { GeometryBaseData } from './baseGeometry';
import { HalfEdgeMeshFactory } from './halfedge.factory';
import { getBoundariesForHalfEdgeMesh, getHalfEdgeMeshFromMesh } from './halfedge';
import { Mesh, V3 } from './v3';
import { VoxelFactory } from './voxelComplex/voxelComplex.factory';
import { getHalfEdgeMeshForVoxelEnclosure } from './voxelComplex/voxelComplex';
import { MaterialFactory } from './materialFactory';
import { HalfEdgeMeshRenderer } from './halfedge.artists';

const HOLE_MINIMUM_RESOLUTION = 128;

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

  const holeCounts = vertices.length > HOLE_MINIMUM_RESOLUTION ? 1 : Math.ceil(HOLE_MINIMUM_RESOLUTION / vertices.length);
  const tDelta = 1 / holeCounts;

  vertices.forEach((v, i, arr) => {
    const next = arr[(i + 1) % arr.length];
    const v0 = V3.sub(v, center);
    const v1 = V3.sub(next, center);
    const vD = V3.sub(v1, v0);
    const vs: V3[] = [next, v];
    for (let i = 0; i <= holeCounts; i++) {
      const t = i * tDelta;
      const v = V3.add(v0, V3.mul(vD, t));
      vs.push(V3.mul(V3.getUnit(v), gBD.base.sideInnerRadius));
    }

    polygons.push(vs);
  });

  const heMeshWithHoles = getHalfEdgeMeshFromMesh(Mesh.joinMeshes(polygons.map((s) => Mesh.makeFromPolygon(s.reverse()))));

  const dir = V3.mul(V3.ZAxis, -gBD.base.sideHeight);
  const voxelComplex = VoxelFactory.extrudeHalfEdgeMesh(heMeshWithHoles, dir);
  const enclosureMesh = getHalfEdgeMeshForVoxelEnclosure(voxelComplex);

  const mesh = HalfEdgeMeshRenderer.render(enclosureMesh, scene, MaterialFactory.getLampMaterial(scene), 'baseMesh');
  mesh.parent = rootNode;
};
