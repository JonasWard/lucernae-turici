import { HalfEdgeMeshFactory } from '../halfEdge/halfedge.factory';
import { Mesh, V3 } from '../v3';
import { FootprintCategory } from './types/footprintCategory';
import { PolygonGridSimpleFootprint } from './types/polygonGridSimple';

const getCenterPoint = (polygonGrid: PolygonGridSimpleFootprint): V3 =>
  V3.add(V3.mul(V3.XAxis, polygonGrid.size * polygonGrid.xCount * -0.5), V3.mul(V3.YAxis, polygonGrid.size * polygonGrid.yCount * -0.5));

export const createFootprintMesh = (polygonGrid: PolygonGridSimpleFootprint): Mesh => {
  if (polygonGrid.xCount < 1 || polygonGrid.yCount < 1) throw new Error('need at least 1 cell in each direction');

  const xAxis = V3.XAxis;
  const yAxis = V3.YAxis;

  // creating the base mesh
  let baseMesh: [Mesh] | [Mesh, Mesh];

  let vectorSpacingX: V3;
  let vectorSpacingY: V3;

  // centering grid
  const origin = getCenterPoint(polygonGrid);

  const scaledX = V3.mul(V3.XAxis, polygonGrid.size);

  // defining the base shapes
  switch (polygonGrid.type) {
    case FootprintCategory.TriangleGrid:
      const halfX = V3.mul(xAxis, polygonGrid.size * 0.5);
      const oneAndAHalfX = V3.mul(xAxis, polygonGrid.size * 1.5);
      const triScaledY = V3.mul(yAxis, polygonGrid.size * 3 ** 0.5 * 0.5);

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

    case FootprintCategory.SquareGrid:
      const quadScaledY = V3.mul(yAxis, polygonGrid.size);

      baseMesh = [
        {
          vertices: [origin, V3.add(origin, scaledX), V3.add(origin, quadScaledY), V3.add(origin, V3.add(scaledX, quadScaledY))],
          faces: [[1, 3, 2, 0]],
        },
      ];

      vectorSpacingX = scaledX;
      vectorSpacingY = quadScaledY;

      break;

    case FootprintCategory.HexGrid:
      const yScaleHalf = V3.mul(yAxis, polygonGrid.size * 0.5);
      const yScaleOneAndAHalf = V3.mul(yAxis, polygonGrid.size * 1.5);
      const yScaleDouble = V3.mul(yAxis, polygonGrid.size * 2.0);
      const xScaleOne = V3.mul(xAxis, polygonGrid.size * 3 ** 0.5 * 0.5);
      const xScaleTwo = V3.mul(xAxis, polygonGrid.size * 3 ** 0.5);

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

  const xVectors = [...Array(polygonGrid.xCount).keys()].map((i) => V3.mul(vectorSpacingX, i));
  const yVectors = [...Array(polygonGrid.yCount).keys()].map((j) => V3.mul(vectorSpacingY, j));

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

export const createFootprintHalfedgeMesh = (polygonGrid: PolygonGridSimpleFootprint) =>
  HalfEdgeMeshFactory.createHalfEdgeMeshFromMesh(createFootprintMesh(polygonGrid));
