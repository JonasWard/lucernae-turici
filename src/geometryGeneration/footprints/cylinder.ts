import { CylinderFootprint } from './types/cylinder';
import { Mesh, V3 } from '../v3';
import { HalfEdgeMeshFactory } from '../halfedge.factory';

const MINIMUM_INNER_RADIUS = 1;
const MINIMUM_BUFFER = 0.1;

const hasInnerRadius = (cylinder: CylinderFootprint): boolean => cylinder.radius0 >= MINIMUM_BUFFER;
const hasOuterRadius = (cylinder: CylinderFootprint): boolean => cylinder.radius2 >= MINIMUM_BUFFER;
const getRadii = (cylinder: CylinderFootprint): number[] => {
  const filteredRadii = [cylinder.radius0, cylinder.radius1, cylinder.radius2].filter((r) => r >= MINIMUM_INNER_RADIUS);

  const radii = hasInnerRadius(cylinder) ? [filteredRadii[0] - cylinder.bufferInside, filteredRadii[0]] : [filteredRadii[0]];

  if (filteredRadii.length > 1) for (const radius of filteredRadii.slice(1)) radii.push(radii[radii.length - 1] + radius);
  if (hasOuterRadius(cylinder)) radii.push(radii[radii.length - 1] + cylinder.bufferOutside);

  return radii;
};

export const createFootprintMesh = (cylinder: CylinderFootprint): Mesh => {
  const radii = getRadii(cylinder);

  const vertices: V3[] = [];
  const faces: number[][] = [];

  const alphaDelta = (Math.PI * 2.0) / cylinder.segments;

  for (let i = 0; i < cylinder.segments; i++) {
    const alpha = alphaDelta * i;
    const cosAlpha = Math.cos(alpha);
    const sinAlpha = Math.sin(alpha);

    radii.forEach((r) => {
      vertices.push({ x: r * cosAlpha, y: r * sinAlpha, z: 0 });
    });

    const baseIndex = i * radii.length;
    const nextBaseIndex = ((i + 1) % cylinder.segments) * radii.length;

    for (let j = 0; j < radii.length - 1; j++) {
      faces.push([baseIndex + j, nextBaseIndex + j, nextBaseIndex + j + 1, baseIndex + j + 1].reverse());
    }
  }

  return { vertices, faces };
};

export const createFootprintHalfedgeMesh = (cylinder: CylinderFootprint) => {
  const heMesh = HalfEdgeMeshFactory.createHalfEdgeMeshFromMesh(createFootprintMesh(cylinder));
  HalfEdgeMeshFactory.markFacesWithOneNakedEdge(heMesh);
  return heMesh;
};
