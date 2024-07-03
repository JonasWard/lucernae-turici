import { HalfEdgeMesh } from '../geometrytypes';
import { HalfEdgeMeshFactory } from '../halfedge.factory';
import { Mesh, V3 } from '../v3';
import { FootprintCategory } from './types/footprintCategory';
import { PolygonGridShellFootprint } from './types/polygonGridShell';

const indexIncluded = (i: number, count: number, includedBuffer: number) => i < includedBuffer || i >= count - includedBuffer;

const shouldBeRenderedTriangle = (ix: number, iy: number, xCount: number, rowCount: number, shell: number): boolean => {
  // if there is no shell, always render
  if (shell === 0) return true;

  // checking if part of horizontal shell
  if (indexIncluded(iy, xCount, shell)) return true;

  // if not part of the horizontal shell, we need to check whether part of the vertical shell
  return indexIncluded(ix, rowCount, shell * 2);
};

const polygonsForTriangle = (xCount: number, yCount: number, size: number, shell: number): V3[][] => {
  const xSpacing = size;
  const ySpacing = (size * Math.sqrt(3)) / 2;

  const origin = V3.fromNumbers((xCount + yCount) * xSpacing * -0.5, xCount * ySpacing * -0.5, 0);

  // base polygons
  const polygonA = [V3.Origin, V3.mul(V3.XAxis, xSpacing), V3.add(V3.mul(V3.YAxis, ySpacing), V3.mul(V3.XAxis, xSpacing * 0.5))];

  const polygonB = [V3.mul(V3.XAxis, xSpacing * 0.5), V3.add(V3.mul(V3.YAxis, ySpacing), V3.mul(V3.XAxis, xSpacing)), V3.mul(V3.YAxis, ySpacing)];

  const polygons: V3[][] = [];

  // constructing all
  for (let iy = 0; iy < xCount; iy++) {
    const rowCount = 2 * (xCount - iy + yCount) - 1;
    for (let ix = 0; ix < rowCount; ix++) {
      if (!shouldBeRenderedTriangle(ix, iy, xCount, rowCount, shell)) continue;
      const basePoint = V3.add(origin, V3.add(V3.mul(V3.XAxis, xSpacing * (ix + iy) * 0.5), V3.mul(V3.YAxis, ySpacing * iy)));
      if (ix % 2 === 1) polygons.push(polygonB.map((v) => V3.add(v, basePoint)));
      else polygons.push(polygonA.map((v) => V3.add(v, basePoint)));
    }
  }

  return polygons;
};

const polygonsForHexagon = (xCount: number, yCount: number, size: number, shell: number): V3[][] => {};

const shouldBeRenderedSquare = (ix: number, iy: number, xCount: number, rowCount: number, shell: number): boolean => {
  // if there is no shell, always render
  if (shell === 0) return true;

  // checking if part of horizontal shell
  if (indexIncluded(iy, xCount, shell)) return true;

  // if not part of the horizontal shell, we need to check whether part of the vertical shell
  return indexIncluded(ix, rowCount, shell);
};

const polygonsForSquare = (xCount: number, yCount: number, size: number, shell: number): V3[][] => {
  const rowCount = xCount + yCount;
  const origin = V3.fromNumbers(rowCount * size * -0.5, xCount * size * -0.5, 0);

  // base polygons
  const polygon = [V3.Origin, V3.mul(V3.XAxis, size), V3.add(V3.mul(V3.YAxis, size), V3.mul(V3.XAxis, size)), V3.mul(V3.YAxis, size)];

  const polygons: V3[][] = [];

  // constructing all
  for (let iy = 0; iy < xCount; iy++) {
    for (let ix = 0; ix < rowCount; ix++) {
      if (!shouldBeRenderedSquare(ix, iy, xCount, rowCount, shell)) continue;
      const basePoint = V3.add(origin, V3.add(V3.mul(V3.XAxis, size * ix), V3.mul(V3.YAxis, size * iy)));
      polygons.push(polygon.map((v) => V3.add(v, basePoint)));
    }
  }

  return polygons;
};

const wrapperMethodForCreatingPolygons = (polygonGridShell: PolygonGridShellFootprint): V3[][] => {
  switch (polygonGridShell.type) {
    case FootprintCategory.TriangleGrid:
      return polygonsForTriangle(polygonGridShell.xCount, polygonGridShell.yCount, polygonGridShell.size, polygonGridShell.shellThickness);
    case FootprintCategory.HexGrid:
      return polygonsForHexagon(polygonGridShell.xCount, polygonGridShell.yCount, polygonGridShell.size, polygonGridShell.shellThickness);
    case FootprintCategory.SquareGrid:
      return polygonsForSquare(polygonGridShell.xCount, polygonGridShell.yCount, polygonGridShell.size, polygonGridShell.shellThickness);
  }
};

export const createFootprintMesh = (polygonGridShell: PolygonGridShellFootprint): Mesh => {
  const polygons = wrapperMethodForCreatingPolygons(polygonGridShell);
  const meshes = polygons.map((p) => Mesh.makeFromPolygon(p));
  return Mesh.joinMeshes(meshes);
};

export const createFootprintHalfedgeMesh = (polygonGridShell: PolygonGridShellFootprint): HalfEdgeMesh => {
  const heMesh = HalfEdgeMeshFactory.createHalfEdgeMeshFromMesh(createFootprintMesh(polygonGridShell));

  return heMesh;
};
