import { HalfEdge } from '../geometryGeneration/geometrytypes';
import { getBoundariesForHalfEdgeMesh } from '../geometryGeneration/halfedge';

const ringSearchingTest = {
  faces: {
    f0: {
      id: 'f0',
      edge: 'h0',
    },
    f1: {
      id: 'f1',
      edge: 'h2',
    },
    f2: {
      id: 'f2',
      edge: 'h4',
    },
    f3: {
      id: 'f3',
      edge: 'h7',
    },
  },
  vertices: {
    '0_0_0': {
      x: 0,
      y: 0,
      z: 0,
    },
    '2_0_0': {
      x: 2,
      y: 0,
      z: 0,
    },
    '1_1_0': {
      x: 1,
      y: 1,
      z: 0,
    },
    '3_1_0': {
      x: 3,
      y: 1,
      z: 0,
    },
    '0_2_0': {
      x: 0,
      y: 2,
      z: 0,
    },
    '2_2_0': {
      x: 2,
      y: 2,
      z: 0,
    },
  },
  halfEdges: {
    h0: {
      id: 'h0',
      face: 'f0',
      vertex: '2_0_0',
      next: 'h1',
      previous: 'h10',
    },
    h1: {
      id: 'h1',
      face: 'f0',
      vertex: '1_1_0',
      next: 'h10',
      previous: 'h0',
      neighbour: 'h11',
    },
    h10: {
      id: 'h10',
      face: 'f0',
      vertex: '0_0_0',
      next: 'h0',
      previous: 'h1',
    },
    h2: {
      id: 'h2',
      face: 'f1',
      vertex: '3_1_0',
      next: 'h3',
      previous: 'h11',
    },
    h3: {
      id: 'h3',
      face: 'f1',
      vertex: '1_1_0',
      next: 'h11',
      previous: 'h2',
      neighbour: 'h7',
    },
    h11: {
      id: 'h11',
      face: 'f1',
      vertex: '2_0_0',
      next: 'h2',
      previous: 'h3',
      neighbour: 'h1',
    },
    h4: {
      id: 'h4',
      face: 'f2',
      vertex: '2_2_0',
      next: 'h5',
      previous: 'h6',
      neighbour: 'h9',
    },
    h5: {
      id: 'h5',
      face: 'f2',
      vertex: '0_2_0',
      next: 'h6',
      previous: 'h4',
    },
    h6: {
      id: 'h6',
      face: 'f2',
      vertex: '1_1_0',
      next: 'h4',
      previous: 'h5',
    },
    h7: {
      id: 'h7',
      face: 'f3',
      vertex: '3_1_0',
      next: 'h8',
      previous: 'h9',
      neighbour: 'h3',
    },
    h8: {
      id: 'h8',
      face: 'f3',
      vertex: '2_2_0',
      next: 'h9',
      previous: 'h7',
    },
    h9: {
      id: 'h9',
      face: 'f3',
      vertex: '1_1_0',
      next: 'h7',
      previous: 'h8',
      neighbour: 'h4',
    },
  },
};

export const runRingSearchingTest = () => {
  console.log(runRingSearchingTest.name);
  const searchOrder: [HalfEdge, boolean][][] = [];

  console.log(getBoundariesForHalfEdgeMesh(ringSearchingTest, searchOrder));
  console.log(searchOrder);
};
