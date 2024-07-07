import { GeometryBaseData } from './baseGeometry';
import { getHalfEdgeMeshFromMesh, markFacesWithOneNakedEdge } from './halfEdge/halfedge';
import { Mesh, V3 } from './v3';
import { FootprintFactory } from './footprints/footprintFactory';
import { HalfEdgeMesh } from './halfEdge/types/HalfEdgeMesh';

abstract class MeshFactory {
  public static createCylinder = (radiuses: number[], divisions: number): Mesh => {
    const vertices: V3[] = [];
    const faces: number[][] = [];

    const alphaDelta = (Math.PI * 2.0) / divisions;

    for (let i = 0; i < divisions; i++) {
      const alpha = alphaDelta * i;
      const cosAlpha = Math.cos(alpha);
      const sinAlpha = Math.sin(alpha);

      radiuses.forEach((r) => {
        vertices.push({ x: r * cosAlpha, y: r * sinAlpha, z: 0 });
      });

      const baseIndex = i * radiuses.length;
      const nextBaseIndex = ((i + 1) % divisions) * radiuses.length;

      for (let j = 0; j < radiuses.length - 1; j++) {
        faces.push([baseIndex + j, nextBaseIndex + j, nextBaseIndex + j + 1, baseIndex + j + 1].reverse());
      }
    }

    return { vertices, faces };
  };
}

export abstract class HalfEdgeMeshFactory {
  public static createHalfEdgeMeshFromMesh = (mesh: Mesh): HalfEdgeMesh => getHalfEdgeMeshFromMesh(mesh, true);
  public static markFacesWithOneNakedEdge = (heMesh: HalfEdgeMesh): void => markFacesWithOneNakedEdge(heMesh);

  public static createCylinder = (radiuses: number[], divisions: number): HalfEdgeMesh => {
    const heMesh = getHalfEdgeMeshFromMesh(MeshFactory.createCylinder(radiuses, divisions), true);
    markFacesWithOneNakedEdge(heMesh);
    return heMesh;
  };

  public static getFootprintFromGeometryBaseData = (gBD: GeometryBaseData): HalfEdgeMesh => FootprintFactory.createFootprintHalfedgeMesh(gBD.footprint);
}
