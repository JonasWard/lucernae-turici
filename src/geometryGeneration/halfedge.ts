import { Mesh, vertexHash } from './baseGeometry';
import { HalfEdge, HalfEdgeFace, HalfEdgeMesh, V3 } from './geometrytypes';
import { getRandomUUID } from './helpermethods';

const getNextEdge = (edge: HalfEdge, mesh: HalfEdgeMesh): HalfEdge => {
  return mesh.halfEdges[edge.next];
};

const getNeighbourEdge = (edge: HalfEdge, halfEdges: Record<string, HalfEdge>): HalfEdge | undefined => {
  return edge.neighbour ? halfEdges[edge.neighbour] : undefined;
};

export const getFaceEdges = (face: HalfEdgeFace, mesh: HalfEdgeMesh): HalfEdge[] => {
  const edges: HalfEdge[] = [];
  let edge = mesh.halfEdges[face.edge];
  do {
    edges.push(edge);
    edge = getNextEdge(edge, mesh);
  } while (edge.id !== face.edge);
  return edges;
};

export const getFaceVertices = (face: HalfEdgeFace, mesh: HalfEdgeMesh): V3[] => {
  return getFaceEdges(face, mesh).map((edge) => mesh.vertices[edge.vertex]);
};

export const getCenterOfV3s = (vertices: V3[]): V3 => {
  let count = 0;
  const rawV = vertices.reduce(
    (a, b) => {
      a.x += b.x;
      a.y += b.y;
      a.z += b.z;
      count++;
      return a;
    },
    { x: 0, y: 0, z: 0 }
  );

  const scale = 1 / count;
  return { x: rawV.x * scale, y: rawV.y * scale, z: rawV.z * scale };
};

export const getHalfEdgeMeshFromMesh = (mesh: Mesh): HalfEdgeMesh => {
  // mapping all vertices to a record
  const vertices: { [k: string]: V3 } = Object.fromEntries(
    mesh.vertices.map((vertex) => [vertexHash(vertex), { x: vertex.x, y: vertex.y, z: vertex.z }] as [string, V3])
  );

  interface rawHalfEdge {
    id: string;
    faceId: string;
    vId: string;
    vIdEnd: string;
  }

  const vertexEdgesMap: { [k: string]: HalfEdge[] } = {};
  const allHalfEdges: HalfEdge[] = [];

  // face wise construction of half edges
  const faces = Object.fromEntries(
    mesh.faces.map((f) => {
      const faceId = getRandomUUID();

      const rawEdges: rawHalfEdge[] = f.map((vIdx, i) => ({
        id: getRandomUUID(),
        faceId,
        vId: vertexHash(mesh.vertices[vIdx]),
        vIdEnd: vertexHash(mesh.vertices[f[(i + 1) % f.length]]),
      }));

      // linking the half edges within a face
      const halfEdges: HalfEdge[] = rawEdges.map((rawEdge, i, arr) => {
        const halfEdge = {
          id: rawEdge.id,
          face: rawEdge.faceId,
          vertex: rawEdge.vId,
          next: arr[(i + 1) % arr.length].id,
          previous: arr[(arr.length + i - 1) % arr.length].id,
        } as HalfEdge;

        allHalfEdges.push(halfEdge);

        // figuring out neighbour situations for the half edge
        const rawId = rawEdge.vId.localeCompare(rawEdge.vIdEnd) < 0 ? `${rawEdge.vId}.${rawEdge.vIdEnd}` : `${rawEdge.vIdEnd}.${rawEdge.vId}`;

        if (vertexEdgesMap[rawId]) vertexEdgesMap[rawId].push(halfEdge);
        else vertexEdgesMap[rawId] = [halfEdge];

        return halfEdge;
      });

      console.log(vertexEdgesMap);

      Object.values(vertexEdgesMap).forEach((edges) => {
        if (edges.length === 2) {
          edges[0].neighbour = edges[1].id;
          edges[1].neighbour = edges[0].id;
        }
      });

      return [
        faceId,
        {
          id: faceId,
          edge: halfEdges[0].id,
        },
      ];
    })
  );

  return {
    faces,
    vertices,
    halfEdges: Object.fromEntries(allHalfEdges.map((e) => [e.id, e])),
  };
};

// iterates recursively at a node to find the first other naked halfedge, the assumption is that the currentEdge hasn't been added yet
// assumption is that there are not more that 10 edges at the same node ever
const getConsecutiveNakedEdge = (currentEdge: HalfEdge, heMesh: HalfEdgeMesh, iterationLevel = 0): undefined | HalfEdge => {
  if (iterationLevel > 10) return undefined;
  const previousEdge = heMesh.halfEdges[currentEdge.previous];
  if (!previousEdge.neighbour) return previousEdge;
  const previousEdgeForPrevious = heMesh.halfEdges[heMesh.halfEdges[previousEdge.neighbour].previous];
  if (!previousEdgeForPrevious.neighbour) return previousEdgeForPrevious;
  return getConsecutiveNakedEdge(previousEdgeForPrevious, heMesh, iterationLevel + 1);
};

export const getBoundariesForHalfEdgeMesh = (heMesh: HalfEdgeMesh) => {
  // find all the naked edges
  const nakedEdges = Object.values(heMesh.halfEdges).filter((he) => !he.neighbour);
  const nakedEdgesNotAddedMap = Object.fromEntries(nakedEdges.map((he) => [he.id, true]));

  const invertedLoops: HalfEdge[][] = [];

  let iterations = 0;
  while (true) {
    // take the first nakedEdge that hasn't been added yet
    const firstEdge = nakedEdges.find((he) => nakedEdgesNotAddedMap[he.id]);
    if (!firstEdge) break;

    const localInvertedLoop: HalfEdge[] = [firstEdge];
    nakedEdgesNotAddedMap[firstEdge.id] = false;

    let activeEdge = firstEdge;

    let nestedIterations = 0;
    // initialise the second while loop
    while (true) {
      // find the previous edge of the edge
      const previousEdge = getConsecutiveNakedEdge(activeEdge, heMesh);
      if (!previousEdge) {
        console.log('could not find consecutive edge, escaping while loop');
        iterations = 101;
        break;
      }

      nakedEdgesNotAddedMap[previousEdge.id] = false;
      if (previousEdge.id === firstEdge.id) break;
      localInvertedLoop.push(previousEdge);
      activeEdge = previousEdge;

      nestedIterations++;
      if (nestedIterations > 100) {
        console.log('stuck in loop ...');
        break;
      }
    }

    invertedLoops.push(localInvertedLoop);

    iterations++;
    if (iterations > 100) break;
  }

  console.log(invertedLoops);
};
