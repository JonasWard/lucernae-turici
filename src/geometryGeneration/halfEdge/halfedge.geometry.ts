import { V3 } from '../v3';
import { HalfEdgeMesh } from './types/HalfEdgeMesh';
import { HalfEdge } from './types/halfEdge';

export class HalfEdgeGeometry {
  public static getStart = (halfEdge: HalfEdge, heMesh: HalfEdgeMesh): V3 => heMesh.vertices[heMesh.halfEdges[halfEdge.previous].vertex];
  public static getEnd = (halfEdge: HalfEdge, heMesh: HalfEdgeMesh): V3 => heMesh.vertices[halfEdge.vertex];
  public static getCenter = (halfEdge: HalfEdge, heMesh: HalfEdgeMesh): V3 =>
    V3.mul(V3.add(HalfEdgeGeometry.getStart(halfEdge, heMesh), HalfEdgeGeometry.getEnd(halfEdge, heMesh)), 0.5);
  public static getDirection = (halfEdge: HalfEdge, heMesh: HalfEdgeMesh): V3 =>
    V3.sub(HalfEdgeGeometry.getEnd(halfEdge, heMesh), HalfEdgeGeometry.getStart(halfEdge, heMesh));
  /**
   * Helper method for retrieving the angle between the directions at the start of a half edge
   * @param halfEdge - HalfEdge to consider
   * @param heMesh - the HalfEdgeMesh the HalfEdge belongs to
   * @returns - angle in radians
   */
  public static getOffsetAngleAtStart = (halfEdge: HalfEdge, heMesh: HalfEdgeMesh): number => {
    const previousDirection = HalfEdgeGeometry.getDirection(heMesh.halfEdges[halfEdge.previous], heMesh);
    const direction = HalfEdgeGeometry.getDirection(halfEdge, heMesh);

    return V3.getVectorAngle(V3.mul(previousDirection, -1), V3.getUnit(direction));
  };
  /**
   * Method for retrieving the offest direction at the start of a given halfEdge
   * @param halfEdge - HalfEdge to consider
   * @param heMesh - the HalfEdgeMesh to which the HalfEdge belongs
   * @returns - offset direction, unitVector or zero length vector
   */
  public static getOffsetDirectionStart = (halfEdge: HalfEdge, heMesh: HalfEdgeMesh): V3 => {
    if (halfEdge.neighbour) return V3.Origin;
    if (heMesh.halfEdges[halfEdge.previous].neighbour) return V3.getUnit(HalfEdgeGeometry.getDirection(heMesh.halfEdges[halfEdge.previous], heMesh));

    const direction = HalfEdgeGeometry.getDirection(halfEdge, heMesh);
    const angle = HalfEdgeGeometry.getOffsetAngleAtStart(halfEdge, heMesh) * -0.5;

    return V3.getUnit({
      x: Math.cos(angle) * direction.x - Math.sin(angle) * direction.y,
      y: Math.sin(angle) * direction.x + Math.cos(angle) * direction.y,
      z: 0,
    });
  };
  /**
   * Method for retreiving the offset direction at the end of a given halfEdge
   * @param halfEdge - HalfEdge to consider
   * @param heMesh - the HalfEdgeMesh to which the HalfEdge belongs
   * @returns  - offset direction (will be unitVector or zero length vector)
   */
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
