import { Vector3 } from '@babylonjs/core';
import { GeometryBaseData, joinMeshes, polygonToMesh } from './baseGeometry';
import { FootprintGeometryTypes } from './footprintgeometrytypes';
import { createShardOfMalculmiusOne } from './geometry';
import { HalfEdgeMesh } from './geometrytypes';
import { getHalfEdgeMeshFromMesh, linkingHalfEdges, markFacesWithOneNakedEdge } from './halfedge';
import { Mesh, V3 } from './v3';

abstract class MeshFactory {
  public static createPolygon = (vertexCount = 4, outerRadius = 1, origin = V3.Origin, xAxis = V3.XAxis, yAxis = V3.YAxis): Mesh => {
    if (vertexCount < 3) throw new Error('you need at least 3 vertices for a given polygon mesh');
    const alphaDelta = (Math.PI * 2.0) / vertexCount;
    const vertices: V3[] = [];

    for (let i = 0; i < vertexCount; i++)
      vertices.push(V3.add(origin, V3.add(V3.mul(xAxis, outerRadius * Math.cos(alphaDelta * i)), V3.mul(yAxis, outerRadius * Math.sin(alphaDelta * i)))));

    return {
      vertices,
      faces: [[...Array(vertexCount).keys()]],
    };
  };

  // triangular grid actually considers pairs of triangles as one
  public static createGrid = (
    gridType: 3 | 4 | 6 = 4,
    sideSpacing = 1,
    xCount: number,
    yCount: number,
    origin = V3.Origin,
    xAxis = V3.XAxis,
    yAxis = V3.YAxis
  ): Mesh => {
    if (xCount < 1 || yCount < 1) throw new Error('need at least 1 cell in each direction');

    // creating the base mesh
    let baseMesh: [Mesh] | [Mesh, Mesh];

    let vectorSpacingX: V3;
    let vectorSpacingY: V3;

    const scaledX = V3.mul(xAxis, sideSpacing);

    // defining the base shapes
    switch (gridType) {
      case 3:
        const halfX = V3.mul(xAxis, sideSpacing * 0.5);
        const oneAndAHalfX = V3.mul(xAxis, sideSpacing * 1.5);
        const triScaledY = V3.mul(yAxis, sideSpacing * 3 ** 0.5 * 0.5);

        baseMesh = [
          {
            vertices: [origin, V3.add(origin, scaledX), V3.add(origin, V3.add(halfX, triScaledY)), V3.add(origin, V3.add(oneAndAHalfX, triScaledY))],
            faces: [
              [1, 2, 0],
              [3, 2, 1],
            ],
          },
          {
            vertices: [V3.add(origin, halfX), V3.add(origin, oneAndAHalfX), V3.add(origin, triScaledY), V3.add(origin, V3.add(scaledX, triScaledY))],
            faces: [
              [3, 2, 0],
              [1, 3, 0],
            ],
          },
        ];

        vectorSpacingX = scaledX;
        vectorSpacingY = triScaledY;

        break;

      case 4:
        const quadScaledY = V3.mul(yAxis, sideSpacing);

        baseMesh = [
          {
            vertices: [origin, V3.add(origin, scaledX), V3.add(origin, quadScaledY), V3.add(origin, V3.add(scaledX, quadScaledY))],
            faces: [[1, 3, 2, 0]],
          },
        ];

        vectorSpacingX = scaledX;
        vectorSpacingY = quadScaledY;

        break;

      case 6:
        const yScaleHalf = V3.mul(yAxis, sideSpacing * 0.5);
        const yScaleOneAndAHalf = V3.mul(yAxis, sideSpacing * 1.5);
        const yScaleDouble = V3.mul(yAxis, sideSpacing * 2.0);
        const xScaleOne = V3.mul(xAxis, sideSpacing * 3 ** 0.5 * 0.5);
        const xScaleTwo = V3.mul(xAxis, sideSpacing * 3 ** 0.5);

        const verticesHex = [
          V3.add(origin, yScaleHalf),
          V3.add(origin, yScaleOneAndAHalf),
          V3.add(origin, V3.add(xScaleOne, yScaleDouble)),
          V3.add(origin, V3.add(xScaleTwo, yScaleOneAndAHalf)),
          V3.add(origin, V3.add(xScaleTwo, yScaleHalf)),
          V3.add(origin, xScaleOne),
        ];

        baseMesh = [
          {
            vertices: verticesHex,
            faces: [[5, 4, 3, 2, 1, 0]],
          },
          {
            vertices: verticesHex.map((v) => V3.add(v, xScaleOne)),
            faces: [[5, 4, 3, 2, 1, 0]],
          },
        ];

        vectorSpacingX = xScaleTwo;
        vectorSpacingY = yScaleOneAndAHalf;

        break;
    }

    // populating the meshes

    const meshes: Mesh[] = [];

    const xVectors = [...Array(xCount).keys()].map((i) => V3.mul(vectorSpacingX, i));
    const yVectors = [...Array(yCount).keys()].map((j) => V3.mul(vectorSpacingY, j));

    yVectors.forEach((y, i) => {
      const localMesh = baseMesh[i % baseMesh.length];
      xVectors.forEach((x) => {
        const xy = V3.add(x, y);

        meshes.push({
          vertices: localMesh.vertices.map((v) => V3.add(v, xy)),
          faces: localMesh.faces.map((l) => l.map((i) => i)),
        });
      });
    });

    return Mesh.joinMeshes(meshes);
  };

  public static createCylinder = (radiuses: number[], divisions: number): Mesh => {
    if (radiuses.length < 2) throw new Error('need at least 2 radiuses for a cylinder');
    if (divisions < 3) throw new Error('need at least 3 divisions for a cylinder');

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
  public static createPolygon = (vertexCount = 4, outerRadius = 1, origin = V3.Origin, xAxis = V3.XAxis, yAxis = V3.YAxis): HalfEdgeMesh =>
    getHalfEdgeMeshFromMesh(MeshFactory.createPolygon(vertexCount, outerRadius, origin, xAxis, yAxis), true);

  public static createGrid = (
    gridType: 3 | 4 | 6 = 4,
    sideSpacing = 1,
    xCount: number,
    yCount: number,
    origin = V3.Origin,
    xAxis = V3.XAxis,
    yAxis = V3.YAxis
  ): HalfEdgeMesh => getHalfEdgeMeshFromMesh(MeshFactory.createGrid(gridType, sideSpacing, xCount, yCount, origin, xAxis, yAxis), true);

  public static createCylinder = (radiuses: number[], divisions: number): HalfEdgeMesh => {
    const heMesh = getHalfEdgeMeshFromMesh(MeshFactory.createCylinder(radiuses, divisions), true);
    markFacesWithOneNakedEdge(heMesh);
    return heMesh;
  };

  public static getFootprintFromGeometryBaseData = (gBD: GeometryBaseData): HalfEdgeMesh => {
    const footprint = gBD.footprint;

    switch (footprint.type) {
      case FootprintGeometryTypes.Cylinder:
        return HalfEdgeMeshFactory.createCylinder(
          [
            ...(footprint.bufferInside ? [footprint.radius0 - footprint.bufferInside] : []),
            footprint.radius0,
            footprint.radius1 + footprint.radius0,
            footprint.radius2 + footprint.radius1 + footprint.radius0,
            ...(footprint.bufferOutside ? [footprint.radius2 + footprint.radius1 + footprint.radius0 + footprint.bufferOutside] : []),
          ],
          footprint.segments
        );
      case FootprintGeometryTypes.Square:
        return HalfEdgeMeshFactory.createGrid(4, footprint.size, 1, 1);
      case FootprintGeometryTypes.SquareGrid:
        return HalfEdgeMeshFactory.createGrid(4, footprint.size, footprint.xCount, footprint.yCount);
      case FootprintGeometryTypes.TriangleGrid:
        return HalfEdgeMeshFactory.createGrid(3, footprint.size, footprint.xCount, footprint.yCount);
      case FootprintGeometryTypes.HexGrid:
        return HalfEdgeMeshFactory.createGrid(6, footprint.size, footprint.xCount, footprint.yCount);
      case FootprintGeometryTypes.MalculmiusOne:
        const shard = createShardOfMalculmiusOne(footprint, new Vector3(0, 0, 0), 0);
        return getHalfEdgeMeshFromMesh(joinMeshes(shard.map((s) => polygonToMesh(s))));
    }
  };
}
