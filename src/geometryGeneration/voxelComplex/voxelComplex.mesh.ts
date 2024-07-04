// these are the helper methods for filling the cells in the voxel complex

import { GeometryBaseData } from '../baseGeometry';
import { ExtrusionCategory } from '../extrusionProfiles/types/extrusionCategory';
import { HalfEdgeMesh } from '../geometrytypes';
import { V2 } from '../v2';
import { getHalfEdgeMeshFromMesh } from '../halfedge';
import { QuadFace, V3, Mesh } from '../v3';
import { gefFace, getCenterOfVoxelFace, isFaceInVoxelClosed } from './voxelComplex';
import { Voxel, VoxelComplex } from './type/voxelComplex';
import { VoxelState } from './type/voxelState';
import { ExtrusionProfileFactory } from '../extrusionProfiles/extrusionProfileFactory';

// helper interface that defines the four corner vertices of a frame to be filled in with the frames of the voxel
export class VoxelMesh {
  private static arcDivisionCount = import.meta.env.DEV ? 32 : 8; // keeping the resolution of archs low (it's still basically 32 for a full circle, because all current arcs are always 90 degrees)
  private static getTopVertexSideEdge = (v: Voxel, vX: VoxelComplex, i: number): V3 => vX.vertices[v.vertices[i + v.n]];
  private static getBottomVertexSideEdge = (v: Voxel, vX: VoxelComplex, i: number): V3 => vX.vertices[v.vertices[i]];
  private static getTopEdgeCenter = (v: Voxel, vX: VoxelComplex, i: number): V3 =>
    V3.mul(V3.add(VoxelMesh.getTopVertexSideEdge(v, vX, i), VoxelMesh.getTopVertexSideEdge(v, vX, (i + v.n - 1) % v.n)), 0.5);
  private static getBottomEdgeCenter = (v: Voxel, vX: VoxelComplex, i: number): V3 =>
    V3.mul(V3.add(VoxelMesh.getBottomVertexSideEdge(v, vX, i), VoxelMesh.getBottomVertexSideEdge(v, vX, (i + v.n - 1) % v.n)), 0.5);

  private static getTopFaceCenter = (v: Voxel, vX: VoxelComplex): V3 => getCenterOfVoxelFace(v, vX, 0);
  private static getBottomFaceCenter = (v: Voxel, vX: VoxelComplex): V3 => getCenterOfVoxelFace(v, vX, 1);

  public static getFaceVerticesForVoxel = (v: Voxel, vX: VoxelComplex, fId: number): V3[] => gefFace(v, fId).map((v) => vX.vertices[v]);

  public static getTopFaceVertexes = (v: Voxel, vX: VoxelComplex): V3[] => VoxelMesh.getFaceVerticesForVoxel(v, vX, 0);
  public static getBottomFaceVertexes = (v: Voxel, vX: VoxelComplex): V3[] => VoxelMesh.getFaceVerticesForVoxel(v, vX, 1);

  private static getLeftFrontFaceQuad = (v: Voxel, vX: VoxelComplex, i: number): QuadFace => ({
    v11: VoxelMesh.getBottomVertexSideEdge(v, vX, i),
    v10: VoxelMesh.getTopVertexSideEdge(v, vX, i),
    v01: VoxelMesh.getBottomEdgeCenter(v, vX, i),
    v00: VoxelMesh.getTopEdgeCenter(v, vX, i),
  });

  private static getRightFrontFaceQuad = (v: Voxel, vX: VoxelComplex, i: number): QuadFace => ({
    v11: VoxelMesh.getBottomVertexSideEdge(v, vX, i),
    v10: VoxelMesh.getTopVertexSideEdge(v, vX, i),
    v01: VoxelMesh.getBottomEdgeCenter(v, vX, (i + 1) % v.n),
    v00: VoxelMesh.getTopEdgeCenter(v, vX, (i + 1) % v.n),
  });

  private static getSideEdgeQuad = (v: Voxel, vX: VoxelComplex, i: number, v00: V3, v01: V3): QuadFace => ({
    v11: VoxelMesh.getBottomVertexSideEdge(v, vX, i),
    v10: VoxelMesh.getTopVertexSideEdge(v, vX, i),
    v01,
    v00,
  });

  public static getUVsForGeometryState = (gBD: GeometryBaseData): [V2[], V2[]] => ExtrusionProfileFactory.getUVPair(gBD.extrusion, VoxelMesh.arcDivisionCount);

  private static getClosingMesh = (f: QuadFace, profile: V3[], splitIndex: number, invert: boolean = false): Mesh => ({
    vertices: [...profile, f.v10, f.v00, f.v01, f.v11],
    faces: [
      [profile.length, profile.length + 1, 0],
      ...[...Array(splitIndex).keys()].map((i) => [profile.length, i, i + 1]),
      [profile.length + 3, profile.length, splitIndex],
      ...[...Array(profile.length - splitIndex - 1).keys()].map((i) => [profile.length + 3, splitIndex + i, splitIndex + i + 1]),
      [profile.length + 2, profile.length + 3, profile.length - 1],
    ].map((l) => (invert ? l.reverse() : l)),
  });

  private static getMeshForVoxelStandard = (voxel: Voxel, vX: VoxelComplex, uvs: V2[], splitIndex: number): Mesh => {
    // a voxel is filled in
    const meshes: Mesh[] = [];

    const v01 = VoxelMesh.getTopFaceCenter(voxel, vX);
    const v00 = VoxelMesh.getBottomFaceCenter(voxel, vX);

    for (let i = 0; i < voxel.n; i++) {
      const side = V3.curveForQuad(VoxelMesh.getSideEdgeQuad(voxel, vX, i, v01, v00), uvs);
      const leftFrontQuad = VoxelMesh.getLeftFrontFaceQuad(voxel, vX, i);
      const leftFrontProfile = V3.curveForQuad(leftFrontQuad, uvs);
      meshes.push(Mesh.makeLoft(side, leftFrontProfile, false));
      if (isFaceInVoxelClosed(voxel, vX, 2 + ((i + voxel.n - 1) % voxel.n))) meshes.push(VoxelMesh.getClosingMesh(leftFrontQuad, leftFrontProfile, splitIndex));
      const rightFrontQuad = VoxelMesh.getRightFrontFaceQuad(voxel, vX, i);
      const rightFrontProfile = V3.curveForQuad(rightFrontQuad, uvs);
      meshes.push(Mesh.makeLoft(rightFrontProfile, side, false));
      if (isFaceInVoxelClosed(voxel, vX, 2 + i)) meshes.push(VoxelMesh.getClosingMesh(rightFrontQuad, rightFrontProfile, splitIndex, true));
    }

    if (isFaceInVoxelClosed(voxel, vX, 0)) meshes.push(Mesh.makeFromPolygon(VoxelMesh.getTopFaceVertexes(voxel, vX)));
    if (isFaceInVoxelClosed(voxel, vX, 1)) meshes.push(Mesh.makeFromPolygon(VoxelMesh.getBottomFaceVertexes(voxel, vX)));

    return Mesh.joinMeshes(meshes);
  };

  private static getMeshForVoxelOneDirection = (voxel: Voxel, vX: VoxelComplex, uvs: V2[], splitIndex: number): Mesh => {
    if (voxel.n !== 4) return VoxelMesh.getMeshForVoxelStandard(voxel, vX, uvs, splitIndex);

    // find the side face that is not closed
    let openSide = -1;
    for (let i = 0; i < 4; i++) if (isFaceInVoxelClosed(voxel, vX, i + 2)) openSide = i;

    const meshes: Mesh[] = [];

    if (isFaceInVoxelClosed(voxel, vX, 0)) meshes.push(Mesh.makeFromPolygon(VoxelMesh.getTopFaceVertexes(voxel, vX)));
    if (isFaceInVoxelClosed(voxel, vX, 1)) meshes.push(Mesh.makeFromPolygon(VoxelMesh.getBottomFaceVertexes(voxel, vX)));

    const leftFrontQuad = VoxelMesh.getLeftFrontFaceQuad(voxel, vX, (openSide + 1) % voxel.n);
    const leftFrontProfile = V3.curveForQuad(leftFrontQuad, uvs);

    const rightBackQuad = VoxelMesh.getRightFrontFaceQuad(voxel, vX, (openSide + 2) % voxel.n);
    const rightBackProfile = V3.curveForQuad(rightBackQuad, uvs);
    meshes.push(Mesh.makeLoft(rightBackProfile, leftFrontProfile, false));
    meshes.push(VoxelMesh.getClosingMesh(leftFrontQuad, leftFrontProfile, splitIndex));

    const leftBackQuad = VoxelMesh.getLeftFrontFaceQuad(voxel, vX, (openSide + 3) % voxel.n);
    const leftBackProfile = V3.curveForQuad(leftBackQuad, uvs);

    const rightFrontQuad = VoxelMesh.getRightFrontFaceQuad(voxel, vX, openSide);
    const rightFrontProfile = V3.curveForQuad(rightFrontQuad, uvs);
    meshes.push(Mesh.makeLoft(rightFrontProfile, leftBackProfile, false));
    meshes.push(VoxelMesh.getClosingMesh(rightFrontQuad, rightFrontProfile, splitIndex, true));

    return Mesh.joinMeshes(meshes);
  };

  public static getMeshForVoxel = (voxel: Voxel, vX: VoxelComplex, uvs: V2[], splitIndex: number): Mesh => {
    switch (voxel.state) {
      case VoxelState.MASSIVE: // ToDo implement the massive voxel, will not work with open for now
      case VoxelState.OPEN:
        return VoxelMesh.getMeshForVoxelStandard(voxel, vX, uvs, splitIndex);
      case VoxelState.UNDEFINED:
      case VoxelState.NONE:
        return { vertices: [], faces: [] };
      case VoxelState.ONEDIRECTION:
        return VoxelMesh.getMeshForVoxelOneDirection(voxel, vX, uvs, splitIndex);
    }
  };

  public static getClosingTestMeshes = (): HalfEdgeMesh => {
    const baseFrameSquare: QuadFace = {
      v11: V3.add(V3.XAxis, V3.YAxis),
      v10: V3.XAxis,
      v01: V3.YAxis,
      v00: V3.Origin,
    };
    const squareGSM: GeometryBaseData = {
      extrusion: { type: ExtrusionCategory.Square, insetBottom: 0.1, insetSides: 0.1, insetTop: 0.1 },
    } as GeometryBaseData;

    const arcOrigin = { x: 2, y: 0, z: 0 };
    const baseFrameArc: QuadFace = {
      v11: V3.add(baseFrameSquare.v11, arcOrigin),
      v10: V3.add(baseFrameSquare.v10, arcOrigin),
      v01: V3.add(baseFrameSquare.v01, arcOrigin),
      v00: V3.add(baseFrameSquare.v00, arcOrigin),
    };
    const argGSM: GeometryBaseData = {
      extrusion: { type: ExtrusionCategory.Arc, insetBottom: 0.1, insetSides: 0.1, insetTop: 0.1, radiusTop: 0.4 },
    } as GeometryBaseData;

    const ellipseOrigin = { x: 4, y: 0, z: 0 };
    const baseFrameEllipse: QuadFace = {
      v11: V3.add(baseFrameSquare.v11, ellipseOrigin),
      v10: V3.add(baseFrameSquare.v10, ellipseOrigin),
      v01: V3.add(baseFrameSquare.v01, ellipseOrigin),
      v00: V3.add(baseFrameSquare.v00, ellipseOrigin),
    };
    const ellipseGSM: GeometryBaseData = {
      extrusion: { type: ExtrusionCategory.Ellipse, insetBottom: 0.1, insetSides: 0.1, insetTop: 0.1, radiusTop: 0.3 },
    } as GeometryBaseData;

    const squareUVs = VoxelMesh.getUVsForGeometryState(squareGSM);
    const arcUVs = VoxelMesh.getUVsForGeometryState(argGSM);
    const ellipseUVs = VoxelMesh.getUVsForGeometryState(ellipseGSM);

    return getHalfEdgeMeshFromMesh(
      Mesh.joinMeshes([
        VoxelMesh.getClosingMesh(baseFrameSquare, V3.curveForQuad(baseFrameSquare, squareUVs.flat()), squareUVs[0].length - 1),
        VoxelMesh.getClosingMesh(baseFrameArc, V3.curveForQuad(baseFrameArc, arcUVs.flat()), arcUVs[0].length - 1),
        VoxelMesh.getClosingMesh(baseFrameEllipse, V3.curveForQuad(baseFrameEllipse, ellipseUVs.flat()), ellipseUVs[0].length - 1),
      ])
    );
  };

  public static getMeshForVoxelComplex = (vX: VoxelComplex, gBD: GeometryBaseData): Mesh => {
    const uvss = VoxelMesh.getUVsForGeometryState(gBD);
    const mesh = Mesh.joinMeshes(Object.values(vX.voxels).map((v) => VoxelMesh.getMeshForVoxel(v, vX, uvss.flat(), uvss[0].length - 1)));
    return mesh;
  };

  public static getHalfEdgeMeshForVoxelComplex = (vX: VoxelComplex, gBD: GeometryBaseData): HalfEdgeMesh =>
    getHalfEdgeMeshFromMesh(VoxelMesh.getMeshForVoxelComplex(vX, gBD));
}
