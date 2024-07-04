import { HalfEdge, HalfEdgeFace, HalfEdgeMesh } from './geometrytypes';
import { getRandomUUID } from './helpermethods';
import { V3, Mesh } from './v3';
import { VoxelState } from './voxelComplex/type/voxelState';

export const getFaceEdges = (face: HalfEdgeFace, mesh: HalfEdgeMesh): HalfEdge[] => {
  const edges: HalfEdge[] = [];
  let edge = mesh.halfEdges[face.edge];
  do {
    edges.push(edge);
    edge = mesh.halfEdges[edge.next];
  } while (edge.id !== face.edge);
  return edges;
};

export const getFaceVertices = (face: HalfEdgeFace, mesh: HalfEdgeMesh): V3[] => getFaceEdges(face, mesh).map((edge) => mesh.vertices[edge.vertex]);
export const getFaceNormal = (face: HalfEdgeFace, mesh: HalfEdgeMesh): V3 => V3.getNormalForVertices(getFaceVertices(face, mesh));
export const getStartVertexOfHalfEdge = (edge: HalfEdge, mesh: HalfEdgeMesh) => mesh.vertices[mesh.halfEdges[edge.previous].vertex];
export const getEndVertexOfHalfEdge = (edge: HalfEdge, mesh: HalfEdgeMesh) => mesh.vertices[edge.vertex];
export const getVerticesFacesMap = (mesh: HalfEdgeMesh): { [k: string]: string[] } => {
  const verticesFacesMap: { [k: string]: string[] } = {};
  Object.values(mesh.faces).forEach((face) => {
    getFaceEdges(face, mesh).forEach((edge) => {
      if (verticesFacesMap[edge.vertex]) verticesFacesMap[edge.vertex].push(face.id);
      else verticesFacesMap[edge.vertex] = [face.id];
    });
  });
  return verticesFacesMap;
};

export const getCenterOfHalfEdge = (edge: HalfEdge, mesh: HalfEdgeMesh, offset: number = 0.5): V3 => {
  const previousVertex = getStartVertexOfHalfEdge(edge, mesh);
  const edgeVertex = getEndVertexOfHalfEdge(edge, mesh);

  return V3.add(previousVertex, V3.mul(V3.sub(edgeVertex, previousVertex), offset));
};

export const linkingHalfEdges = (halfEdgeMap: { [k: string]: HalfEdge }): void => {
  const groupedEdgesMap: { [k: string]: HalfEdge[] } = {};
  Object.values(halfEdgeMap).forEach((edge) => {
    const sortedEdgeName =
      edge.vertex.localeCompare(halfEdgeMap[edge.previous].vertex) < 0
        ? `${edge.vertex}.${halfEdgeMap[edge.previous].vertex}`
        : `${halfEdgeMap[edge.previous].vertex}.${edge.vertex}`;
    if (groupedEdgesMap[sortedEdgeName]) groupedEdgesMap[sortedEdgeName].push(edge);
    else groupedEdgesMap[sortedEdgeName] = [edge];
  });

  Object.values(groupedEdgesMap).forEach((edges) => {
    if (edges.length === 2) {
      edges[0].neighbour = edges[1].id;
      edges[1].neighbour = edges[0].id;
    }
  });
};

export const getHalfEdgeMeshFromMesh = (mesh: Mesh, withNeighbours: boolean = false): HalfEdgeMesh => {
  // mapping all vertices to a record
  const vertices: { [k: string]: V3 } = Object.fromEntries(
    mesh.vertices.map((vertex) => [V3.getHash(vertex), { x: vertex.x, y: vertex.y, z: vertex.z }] as [string, V3])
  );

  interface rawHalfEdge {
    id: string;
    faceId: string;
    vId: string;
    vIdStart: string;
  }

  const allHalfEdges: HalfEdge[] = [];

  const vertexIndexMap = Object.fromEntries(mesh.vertices.map((v, i) => [V3.getHash(v), i]));
  const nestedEdgesMap: {
    [k: string]: {
      [k: string]: HalfEdge[];
    };
  } = {};

  // face wise construction of half edges
  const faces = Object.fromEntries(
    mesh.faces.map((f) => {
      const faceId = getRandomUUID();

      const rawEdges: rawHalfEdge[] = f.map((vIdx, i) => ({
        id: getRandomUUID(),
        faceId,
        vId: V3.getHash(mesh.vertices[vIdx]),
        vIdStart: V3.getHash(mesh.vertices[f[(i + f.length - 1) % f.length]]),
      }));

      // linking the half edges within a face
      const halfEdges: HalfEdge[] = rawEdges.map((rawEdge, i, arr) => {
        const halfEdge = {
          id: rawEdge.id,
          face: rawEdge.faceId,
          vertex: rawEdge.vId,
          next: arr[(i + 1) % arr.length].id,
          previous: arr[(i + arr.length - 1) % arr.length].id,
        } as HalfEdge;

        allHalfEdges.push(halfEdge);

        if (withNeighbours) {
          // figuring out neighbour situations for the half edge - causes a huge performance hit, needs to be tweaked!
          if (vertexIndexMap[rawEdge.vId] < vertexIndexMap[rawEdge.vIdStart]) {
            if (nestedEdgesMap[rawEdge.vId]) {
              if (nestedEdgesMap[rawEdge.vId][rawEdge.vIdStart]) nestedEdgesMap[rawEdge.vId][rawEdge.vIdStart].push(halfEdge);
              else nestedEdgesMap[rawEdge.vId][rawEdge.vIdStart] = [halfEdge];
            } else nestedEdgesMap[rawEdge.vId] = { [rawEdge.vIdStart]: [halfEdge] };
          } else {
            if (nestedEdgesMap[rawEdge.vIdStart]) {
              if (nestedEdgesMap[rawEdge.vIdStart][rawEdge.vId]) nestedEdgesMap[rawEdge.vIdStart][rawEdge.vId].push(halfEdge);
              else nestedEdgesMap[rawEdge.vIdStart][rawEdge.vId] = [halfEdge];
            } else nestedEdgesMap[rawEdge.vIdStart] = { [rawEdge.vId]: [halfEdge] };
          }
        }

        return halfEdge;
      });

      Object.values(nestedEdgesMap).forEach((edgesMap) =>
        Object.values(edgesMap).forEach((edges) => {
          if (edges.length === 2) {
            edges[0].neighbour = edges[1].id;
            edges[1].neighbour = edges[0].id;
          }
        })
      );

      return [
        faceId,
        {
          id: faceId,
          edge: halfEdges[0].id,
        },
      ];
    })
  );

  const halfEdges = Object.fromEntries(allHalfEdges.map((e) => [e.id, e]));

  // apparently above algorithm doesn't work yet for the joining, need to tweak it!
  linkingHalfEdges(halfEdges);

  return {
    faces,
    vertices,
    halfEdges,
  };
};

export const markFacesWithOneNakedEdge = (heMesh: HalfEdgeMesh): void => {
  Object.values(heMesh.faces).forEach((face) => {
    if (getFaceEdges(face, heMesh).filter((he) => !he.neighbour).length === 1) face.metaData = { voxelState: VoxelState.ONEDIRECTION };
  });
};

// iterates recursively at a node to find the first other naked halfedge, the assumption is that the currentEdge hasn't been added yet
// assumption is that there are not more that 10 edges at the same node ever
const getConsecutiveNakedEdge = (currentEdge: HalfEdge, heMesh: HalfEdgeMesh, iterationLevel = 0): undefined | HalfEdge => {
  if (iterationLevel > 40) return undefined;
  if (!currentEdge.neighbour) return currentEdge;
  const previousEdgeForNeighbour = heMesh.halfEdges[heMesh.halfEdges[currentEdge.neighbour].previous];
  if (!previousEdgeForNeighbour.neighbour) return previousEdgeForNeighbour;
  return getConsecutiveNakedEdge(previousEdgeForNeighbour, heMesh, iterationLevel + 1);
};

export const getBoundariesForHalfEdgeMesh = (heMesh: HalfEdgeMesh, searchOrder?: [HalfEdge, boolean][][]) => {
  // find all the naked edges
  const nakedEdges = Object.values(heMesh.halfEdges).filter((he) => !he.neighbour);
  const nakedEdgesNotAddedMap = Object.fromEntries(nakedEdges.map((he) => [he.id, true]));

  const invertedLoops: HalfEdge[][] = [];
  const localSearchOrderList: [HalfEdge, boolean][][] = searchOrder ?? [];

  let iterations = 0;
  while (true) {
    // take the first nakedEdge that hasn't been added yet
    const firstEdge = nakedEdges.find((he) => nakedEdgesNotAddedMap[he.id]);
    if (!firstEdge) break;

    const localSearchList: [HalfEdge, boolean][] = [[firstEdge, true]];

    const localInvertedLoop: HalfEdge[] = [firstEdge];
    nakedEdgesNotAddedMap[firstEdge.id] = false;

    let activeEdge = firstEdge;

    let nestedIterations = 0;
    // initialise the second while loop
    while (true) {
      // find the previous edge of the edge
      const previousEdge = getConsecutiveNakedEdge(heMesh.halfEdges[activeEdge.previous], heMesh);
      if (!previousEdge) {
        console.log('could not find consecutive edge, escaping while loop');
        iterations = 101;
        break;
      }

      localSearchList.push([previousEdge, true]);

      nakedEdgesNotAddedMap[previousEdge.id] = false;
      if (previousEdge.id === firstEdge.id) break;
      localInvertedLoop.push(previousEdge);
      activeEdge = previousEdge;

      nestedIterations++;
      if (nestedIterations > 100) {
        console.log('stuck in loop ...');
        break;
      }

      localSearchOrderList.push(localSearchList);
    }

    invertedLoops.push(localInvertedLoop);

    iterations++;
    if (iterations > 100) break;
  }

  return invertedLoops;
};
