import { V3 } from '../../v3';
import { HalfEdge } from './halfEdge';
import { HalfEdgeFace } from './halfEdgeFace';

export interface HalfEdgeMesh {
  faces: { [k: string]: HalfEdgeFace };
  halfEdges: { [k: string]: HalfEdge };
  vertices: { [k: string]: V3 };
}
