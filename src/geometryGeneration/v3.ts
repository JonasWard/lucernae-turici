import { VertexData } from '@babylonjs/core';
import { TransformationMatrix, V2 } from './geometrytypes';

export interface V3 {
  x: number;
  y: number;
  z: number;
}

export interface QuadFace {
  v00: V3;
  v01: V3;
  v11: V3;
  v10: V3;
}

export interface Mesh {
  vertices: V3[];
  faces: number[][];
}

export class V3 {
  private static zeroTolerance = 1e-3;
  private static zeroToleranceSquared = V3.zeroTolerance ** 2;
  private static massAdd = (vertices: V3[]): V3 => vertices.reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }), { x: 0, y: 0, z: 0 });
  public static add = (...vertices: V3[]): V3 => V3.massAdd(vertices);
  public static sub = (v1: V3, v2: V3): V3 => ({ x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z });
  public static mul = (v: V3, s: number): V3 => ({ x: v.x * s, y: v.y * s, z: v.z * s });
  public static dot = (v1: V3, v2: V3): number => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  public static cross = (v1: V3, v2: V3): V3 => ({
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  });
  public static getCenter = (vs: V3[]): V3 => V3.mul(V3.massAdd(vs), 1 / vs.length);
  public static getLengthSquared = (v: V3): number => v.x ** 2 + v.y ** 2 + v.z ** 2;
  public static getLength = (v: V3): number => (v.x ** 2 + v.y ** 2 + v.z ** 2) ** 0.5;
  public static getUnit = (v: V3): V3 => (V3.getLengthSquared(v) > V3.zeroToleranceSquared ? V3.mul(v, 1 / V3.getLength(v)) : V3.Origin);
  public static getHash = (v: V3) =>
    `${v.x.toFixed(2).replace('-0.00', '0.00')}_${v.y.toFixed(2).replace('-0.00', '0.00')}_${v.z.toFixed(2).replace('-0.00', '0.00')}`;
  public static transform = (v: V3, m: TransformationMatrix): V3 => ({
    x: m[0] * v.x + m[1] * v.y + m[2] * v.z + m[3],
    y: m[4] * v.x + m[5] * v.y + m[6] * v.z + m[7],
    z: m[8] * v.x + m[9] * v.y + m[10] * v.z + m[11],
  });
  public static get XAxis() {
    return { x: 1, y: 0, z: 0 };
  }
  public static get YAxis() {
    return { x: 0, y: 1, z: 0 };
  }
  public static get ZAxis() {
    return { x: 0, y: 0, z: 1 };
  }
  public static get Origin() {
    return { x: 0, y: 0, z: 0 };
  }
  public static curveForQuad = (f: QuadFace, uvs: V2[]): V3[] =>
    uvs.map((uv) =>
      V3.add(V3.mul(f.v00, (1 - uv.u) * (1 - uv.v)), V3.mul(f.v01, (1 - uv.u) * uv.v), V3.mul(f.v10, uv.u * (1 - uv.v)), V3.mul(f.v11, uv.u * uv.v))
    );
  public static getNormalForVertices = (vs: V3[]): V3 => {
    if (vs.length < 3) return V3.ZAxis;
    const [a, b, c] = vs;
    return V3.getUnit(V3.cross(V3.sub(c, b), V3.sub(a, b)));
  };
}

export class Mesh {
  public static makeLoft = (a: V3[], b: V3[], closed: boolean = false): Mesh => ({
    vertices: [...a, ...b],
    faces: a.map((_, i) => [i, (i + 1) % a.length, ((i + 1) % a.length) + a.length, i + a.length]).slice(0, closed ? -0 : -1),
  });
  public static makeFromPolygon = (vertices: V3[], inverse: boolean = false): Mesh => ({
    vertices,
    faces: [inverse ? vertices.map((_, i) => i).reverse() : vertices.map((_, i) => i)],
  });
  public static joinMeshes = (meshes: Mesh[]): Mesh => {
    const vertices: V3[] = [];
    const vertexMap: Map<string, number> = new Map();

    const faces: number[][] = [];

    meshes.forEach((mesh) => {
      const localHashes: string[] = [];
      mesh.vertices.forEach((v) => {
        const hash = V3.getHash(v);
        if (!vertexMap.has(hash)) {
          vertices.push(v);
          vertexMap.set(hash, vertices.length - 1);
        }
        localHashes.push(hash);
      });

      mesh.faces.forEach((face) => faces.push(face.map((i) => vertexMap.get(localHashes[i]) as number)));
    });

    return { vertices, faces };
  };

  private static getTriangularVertexIndexesForFace = (face: number[]): [number, number, number][] => {
    switch (face.length) {
      case 0:
      case 1:
      case 2:
        console.log('invalid face, not triangulated');
        return [];
      case 3:
        return [[face[0], face[1], face[2]]];
      default:
        const first = face[0];
        return face.slice(1, face.length - 1).map((idx, i) => [first, idx, face[(i + 2) % face.length]]);
    }
  };

  public static getVertexDataForMesh = (mesh: Mesh): VertexData => {
    const vertexData = new VertexData();

    // const normalsForVertices = HalfEdgeMeshRenderer.getNormalsForVertices(mesh);
    vertexData.positions = mesh.vertices.map((v) => [v.x, v.z, -v.y]).flat(); // translation from cad to world space
    vertexData.indices = mesh.faces.map((face) => Mesh.getTriangularVertexIndexesForFace(face)).flat(2);

    const normals: number[] = [];

    VertexData.ComputeNormals(vertexData.positions, vertexData.indices, normals);

    vertexData.normals = normals;

    return vertexData;
  };
}
