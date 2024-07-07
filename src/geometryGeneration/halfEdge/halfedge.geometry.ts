import { V3 } from '../v3';
import { HalfEdgeMesh } from './types/HalfEdgeMesh';
import { HalfEdge } from './types/halfEdge';

export class HalfEdgeGeometry {
  public static getStart = (halfEdge: HalfEdge, heMesh: HalfEdgeMesh): V3 => heMesh.vertices[heMesh.halfEdges[halfEdge.previous].vertex];
  public static getEnd = (halfEdge: HalfEdge, heMesh: HalfEdgeMesh): V3 => heMesh.vertices[halfEdge.vertex];
  public static getDirection = (halfEdge: HalfEdge, heMesh: HalfEdgeMesh): V3 =>
    V3.sub(HalfEdgeGeometry.getEnd(halfEdge, heMesh), HalfEdgeGeometry.getStart(halfEdge, heMesh));
  public static getOffsetDirectionStart = (halfEdge: HalfEdge, heMesh: HalfEdgeMesh): V3 => {
    if (halfEdge.neighbour) return V3.Origin;

    const previousDirection = HalfEdgeGeometry.getDirection(heMesh.halfEdges[halfEdge.previous], heMesh);
    if (heMesh.halfEdges[halfEdge.previous].neighbour) return V3.getUnit(previousDirection);

    const direction = HalfEdgeGeometry.getDirection(halfEdge, heMesh);
    const angle = V3.getVectorAngle(V3.mul(V3.getUnit(previousDirection), -1), direction) * -0.5;

    return V3.getUnit({
      x: Math.cos(angle) * direction.x - Math.sin(angle) * direction.y,
      y: Math.sin(angle) * direction.x + Math.cos(angle) * direction.y,
      z: 0,
    });
  };

  public static getOffsetDirectionEnd = (halfEdge: HalfEdge, heMesh: HalfEdgeMesh): V3 => {
    if (halfEdge.neighbour) return V3.Origin;
    const nextDirection = HalfEdgeGeometry.getDirection(heMesh.halfEdges[halfEdge.next], heMesh);
    if (heMesh.halfEdges[halfEdge.next].neighbour) return V3.getUnit(V3.mul(nextDirection, -1));

    const direction = HalfEdgeGeometry.getDirection(halfEdge, heMesh);
    const angle = V3.getVectorAngle(nextDirection, V3.mul(direction, -1)) * 0.5;

    return V3.getUnit({
      x: Math.cos(angle) * nextDirection.x - Math.sin(angle) * nextDirection.y,
      y: Math.sin(angle) * nextDirection.x + Math.cos(angle) * nextDirection.y,
      z: 0,
    });
  };
}
