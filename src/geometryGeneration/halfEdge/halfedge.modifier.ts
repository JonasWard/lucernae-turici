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
    v0: string,
    v1: string,
    voxelState: VoxelState = VoxelState.ONEDIRECTION
  ): { face: HalfEdgeFace; left: HalfEdge; right: HalfEdge } => {
    // vertices
    const vertices = [heMesh.halfEdges[naked.previous].vertex, v1, v0, naked.vertex];

    const halfEdgeID = vertices.map(() => getRandomUUID());
    const faceID = getRandomUUID();

    const halfEdges: HalfEdge[] = vertices.map((v, i) => ({
      id: halfEdgeID[i],
      vertex: v,
      face: faceID,
      next: halfEdgeID[(i + 1) % vertices.length],
      previous: halfEdgeID[(i + vertices.length - 1) % vertices.length],
    }));

    heMesh.halfEdges[naked.id].neighbour = halfEdges[0].id;
    halfEdges[0].neighbour = naked.id;

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
    // getting the vertices
    const newVertices = boundary.map((edge) =>
      V3.add(HalfEdgeGeometry.getStart(edge, heMesh), V3.mul(HalfEdgeGeometry.getOffsetDirectionStart(edge, heMesh), bufferDistance))
    );
    const newVectexWithIds = newVertices.map((v) => [getVertexHash(v), v] as [string, V3]);

    newVectexWithIds.forEach(([id, v]) => (heMesh.vertices[id] = v));

    const leftArray: HalfEdge[] = [];
    const rightArray: HalfEdge[] = [];

    boundary.forEach((edge, i) => {
      const { face, left, right } = HalfEdgeModifier.createFaceForUncoveredEdge(
        edge,
        heMesh,
        newVectexWithIds[(i + boundary.length - 1) % boundary.length][0],
        newVectexWithIds[i][0]
      );

      leftArray.push(left);
      rightArray.push(right);

      heMesh.faces[face.id] = face;

      return face;
    });

    // linking the new faces
    leftArray.forEach((left, i) => {
      left.neighbour = rightArray[(i + rightArray.length - 1) % rightArray.length].id;
      rightArray[(i + 1) % rightArray.length].neighbour = left.id;
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
