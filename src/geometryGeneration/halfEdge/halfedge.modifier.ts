import { getRandomUUID, getVertexHash } from '../helpermethods';
import { V3 } from '../v3';
import { VoxelState } from '../voxelComplex/types/voxelState';
import { getBoundariesForHalfEdgeMesh } from './halfedge';
import { HalfEdgeGeometry } from './halfedge.geometry';
import { HalfEdgeMesh } from './types/HalfEdgeMesh';
import { HalfEdge } from './types/halfEdge';
import { HalfEdgeFace } from './types/halfEdgeFace';

/**
 * Class that contains methdos that update the topology of a half edge mesh
 */
export class HalfEdgeModifier {
  private static createFaceForUncoveredEdge = (
    naked: HalfEdge,
    heMesh: HalfEdgeMesh,
    voxelState: VoxelState,
    ...vs: string[]
  ): { face: HalfEdgeFace; left: HalfEdge; right: HalfEdge } => {
    // vertices
    const vertices = vs.length === 2 ? [heMesh.halfEdges[naked.previous].vertex, ...vs, naked.vertex] : [...vs, naked.vertex];

    const halfEdgeID = vertices.map(() => getRandomUUID());
    const faceID = getRandomUUID();

    const halfEdges: HalfEdge[] = vertices.map((v, i) => ({
      id: halfEdgeID[i],
      vertex: v,
      face: faceID,
      next: halfEdgeID[(i + 1) % vertices.length],
      previous: halfEdgeID[(i + vertices.length - 1) % vertices.length],
    }));

    if (vs.length === 2) {
      heMesh.halfEdges[naked.id].neighbour = halfEdges[0].id;
      halfEdges[0].neighbour = naked.id;
    }

    const face: HalfEdgeFace = {
      id: faceID,
      edge: halfEdges[0].id,
      metaData: { voxelState },
    };

    halfEdges.forEach((he) => (heMesh.halfEdges[he.id] = he));

    return {
      face,
      left: halfEdges[3],
      right: halfEdges[1],
    };
  };

  private static addBufferForNakedBoundary = (heMesh: HalfEdgeMesh, boundary: HalfEdge[], newFacesState: VoxelState, bufferDistance: number): HalfEdgeMesh => {
    const verticesAdded: [number, number, number][] = []; // edge index, start vertex index, end vertex index
    const newVertices: V3[] = [];

    boundary.forEach((edge, i) => {
      console.log(edge.id, edge.previous);
    });

    // getting the vertices
    boundary.forEach((edge, i) => {
      let count = 1;
      if (HalfEdgeGeometry.getOffsetAngleAtStart(edge, heMesh) < Math.PI + 0.01)
        newVertices.push(V3.add(HalfEdgeGeometry.getStart(edge, heMesh), V3.mul(HalfEdgeGeometry.getOffsetDirectionStart(edge, heMesh), bufferDistance)));
      else {
        const start = HalfEdgeGeometry.getStart(edge, heMesh);
        const previousEdge = boundary[(i + 1) % boundary.length];
        newVertices.push(
          ...[
            V3.add(start, V3.mul(HalfEdgeGeometry.getNormal(previousEdge, heMesh), bufferDistance)),
            V3.add(start, V3.mul(HalfEdgeGeometry.getOffsetDirectionStart(previousEdge, heMesh), bufferDistance)),
            V3.add(start, V3.mul(HalfEdgeGeometry.getNormal(edge, heMesh), bufferDistance)),
          ]
        );
        count = 3;
      }

      const startIndex = verticesAdded[verticesAdded.length - 1] ? verticesAdded[verticesAdded.length - 1][1] : 0;

      verticesAdded.push([i, startIndex, startIndex + count]);
    });
    const newVectexWithIds = newVertices.map((v) => [getVertexHash(v), v] as [string, V3]);

    newVectexWithIds.forEach(([id, v]) => (heMesh.vertices[id] = v));

    const leftArray: HalfEdge[] = [];
    const rightArray: HalfEdge[] = [];

    verticesAdded.forEach(([edgeIndex, startIdx, endIdx]) => {
      const edge = boundary[edgeIndex];
      const localVs: [string, V3][] = [];

      for (let j = startIdx; j < endIdx; j++) localVs.push(newVectexWithIds[j % newVectexWithIds.length]);

      const { face, left, right } = HalfEdgeModifier.createFaceForUncoveredEdge(edge, heMesh, newFacesState, ...localVs.map(([id]) => id).reverse());

      leftArray.push(left);
      rightArray.push(right);

      heMesh.faces[face.id] = face;

      return face;
    });

    // linking the new faces
    leftArray.forEach((left, i) => {
      left.neighbour = rightArray[(i + rightArray.length - 1) % rightArray.length].id;
      rightArray[(i + rightArray.length - 1) % rightArray.length].neighbour = left.id;
    });

    return heMesh;
  };

  public static createBufferedHalfEdgeMesh = (heMesh: HalfEdgeMesh, newFacesState: VoxelState, bufferDistance: number): HalfEdgeMesh => {
    const boundaries = getBoundariesForHalfEdgeMesh(heMesh);

    const intermediateHeMesh: HalfEdgeMesh = JSON.parse(JSON.stringify(heMesh));
    boundaries.forEach((boundary) => HalfEdgeModifier.addBufferForNakedBoundary(intermediateHeMesh, boundary, newFacesState, bufferDistance));

    return intermediateHeMesh;
  };
}
