// these are the helper methods for filling the cells in the voxel complex

import { GeometryBaseData } from '../baseGeometry';
import { ExtrusionCategory } from '../extrusionProfiles/types/extrusionCategory';
import { getHalfEdgeMeshFromMesh } from '../halfEdge/halfedge';
import { QuadFace, V3, Mesh } from '../v3';
import { gefFace, getCenterOfVoxelFace, isFaceInVoxelClosed } from './voxelComplex';
import { Voxel, VoxelComplex } from './types/voxelComplex';
import { VoxelState } from './types/voxelState';
import { ExtrusionProfileFactory } from '../extrusionProfiles/extrusionProfileFactory';
import { VoxelComplexExtrusionParameters } from './types/voxelComplexExtrusionParameters';
import { HalfEdgeMesh } from '../halfEdge/types/HalfEdgeMesh';

// helper interface that defines the four corner vertices of a frame to be filled in with the frames of the voxel
export class VoxelMesh {
  private static MINIMUM_VERTICAL_COVERING = 1.5;
  private static MINIMUM_HORIZONTAL_COVERING = 3;

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

  private static getHorizontalInset = (v0: V3, d: V3, inset: number): V3 =>
    V3.add(
      v0,
      V3.getLength(d) * inset < VoxelMesh.MINIMUM_HORIZONTAL_COVERING ? V3.mul(V3.getUnit(d), VoxelMesh.MINIMUM_HORIZONTAL_COVERING) : V3.mul(d, inset)
    );

  private static getVerticalInset = (v0: V3, d: V3, inset: number): V3 =>
    V3.add(v0, V3.getLength(d) * inset < VoxelMesh.MINIMUM_VERTICAL_COVERING ? V3.mul(V3.getUnit(d), VoxelMesh.MINIMUM_VERTICAL_COVERING) : V3.mul(d, inset));

  private static getInsetQuad = (f: QuadFace, extrusionParameters: VoxelComplexExtrusionParameters): QuadFace => {
    // left side
    const v11a = VoxelMesh.getHorizontalInset(f.v11, V3.sub(f.v01, f.v11), extrusionParameters.insetSides);
    const v10a = VoxelMesh.getHorizontalInset(f.v10, V3.sub(f.v00, f.v10), extrusionParameters.insetSides);

    return {
      v11: VoxelMesh.getVerticalInset(v11a, V3.sub(v10a, v11a), extrusionParameters.insetBottom),
      v10: VoxelMesh.getVerticalInset(v10a, V3.sub(v11a, v10a), extrusionParameters.insetTop),
      v01: VoxelMesh.getVerticalInset(f.v01, V3.sub(f.v00, f.v01), extrusionParameters.insetBottom),
      v00: VoxelMesh.getVerticalInset(f.v00, V3.sub(f.v01, f.v00), extrusionParameters.insetTop),
    };
  };

  private static extrusionCurveForQuad = (f: QuadFace, extrusionParameters: VoxelComplexExtrusionParameters): V3[] => {
    const insetQuad = VoxelMesh.getInsetQuad(f, extrusionParameters);
    return V3.curveForQuad(insetQuad, extrusionParameters.uvs);
  };

  public static getUVsForGeometryState = (gBD: GeometryBaseData): VoxelComplexExtrusionParameters =>
    ExtrusionProfileFactory.getVoxelComplexExtrusionParameters(gBD.extrusion, VoxelMesh.arcDivisionCount);

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

  private static getMeshForVoxelStandard = (voxel: Voxel, vX: VoxelComplex, extrusionParameters: VoxelComplexExtrusionParameters, splitIndex: number): Mesh => {
    // a voxel is filled in
    const meshes: Mesh[] = [];

    const v01 = VoxelMesh.getTopFaceCenter(voxel, vX);
    const v00 = VoxelMesh.getBottomFaceCenter(voxel, vX);

    for (let i = 0; i < voxel.n; i++) {
      const side = VoxelMesh.extrusionCurveForQuad(VoxelMesh.getSideEdgeQuad(voxel, vX, i, v01, v00), extrusionParameters);
      const leftFrontQuad = VoxelMesh.getLeftFrontFaceQuad(voxel, vX, i);
      const leftFrontProfile = VoxelMesh.extrusionCurveForQuad(leftFrontQuad, extrusionParameters);
      meshes.push(Mesh.makeLoft(side, leftFrontProfile, false));
      if (isFaceInVoxelClosed(voxel, vX, 2 + ((i + voxel.n - 1) % voxel.n))) meshes.push(VoxelMesh.getClosingMesh(leftFrontQuad, leftFrontProfile, splitIndex));
      const rightFrontQuad = VoxelMesh.getRightFrontFaceQuad(voxel, vX, i);
      const rightFrontProfile = VoxelMesh.extrusionCurveForQuad(rightFrontQuad, extrusionParameters);
      meshes.push(Mesh.makeLoft(rightFrontProfile, side, false));
      if (isFaceInVoxelClosed(voxel, vX, 2 + i)) meshes.push(VoxelMesh.getClosingMesh(rightFrontQuad, rightFrontProfile, splitIndex, true));
    }

    if (isFaceInVoxelClosed(voxel, vX, 0)) meshes.push(Mesh.makeFromPolygon(VoxelMesh.getTopFaceVertexes(voxel, vX)));
    if (isFaceInVoxelClosed(voxel, vX, 1)) meshes.push(Mesh.makeFromPolygon(VoxelMesh.getBottomFaceVertexes(voxel, vX)));

    return Mesh.joinMeshes(meshes);
  };

  private static getMeshForVoxelOneDirection = (
    voxel: Voxel,
    vX: VoxelComplex,
    extrusionParameters: VoxelComplexExtrusionParameters,
    splitIndex: number
  ): Mesh => {
    if (voxel.n !== 4) return VoxelMesh.getMeshForVoxelStandard(voxel, vX, extrusionParameters, splitIndex);

    // find the side face that is not closed
    let openSide = -1;
    for (let i = 0; i < 4; i++) if (isFaceInVoxelClosed(voxel, vX, i + 2)) openSide = i;

    const meshes: Mesh[] = [];

    if (isFaceInVoxelClosed(voxel, vX, 0)) meshes.push(Mesh.makeFromPolygon(VoxelMesh.getTopFaceVertexes(voxel, vX)));
    if (isFaceInVoxelClosed(voxel, vX, 1)) meshes.push(Mesh.makeFromPolygon(VoxelMesh.getBottomFaceVertexes(voxel, vX)));

    const leftFrontQuad = VoxelMesh.getLeftFrontFaceQuad(voxel, vX, (openSide + 1) % voxel.n);
    const leftFrontProfile = VoxelMesh.extrusionCurveForQuad(leftFrontQuad, extrusionParameters);

    const rightBackQuad = VoxelMesh.getRightFrontFaceQuad(voxel, vX, (openSide + 2) % voxel.n);
    const rightBackProfile = VoxelMesh.extrusionCurveForQuad(rightBackQuad, extrusionParameters);
    meshes.push(Mesh.makeLoft(rightBackProfile, leftFrontProfile, false));
    meshes.push(VoxelMesh.getClosingMesh(leftFrontQuad, leftFrontProfile, splitIndex));

    const leftBackQuad = VoxelMesh.getLeftFrontFaceQuad(voxel, vX, (openSide + 3) % voxel.n);
    const leftBackProfile = VoxelMesh.extrusionCurveForQuad(leftBackQuad, extrusionParameters);

    const rightFrontQuad = VoxelMesh.getRightFrontFaceQuad(voxel, vX, openSide);
    const rightFrontProfile = VoxelMesh.extrusionCurveForQuad(rightFrontQuad, extrusionParameters);
    meshes.push(Mesh.makeLoft(rightFrontProfile, leftBackProfile, false));
    meshes.push(VoxelMesh.getClosingMesh(rightFrontQuad, rightFrontProfile, splitIndex, true));

    return Mesh.joinMeshes(meshes);
  };

  public static getMeshForVoxel = (voxel: Voxel, vX: VoxelComplex, extrusionParameters: VoxelComplexExtrusionParameters, splitIndex: number): Mesh => {
    switch (voxel.state) {
      case VoxelState.MASSIVE: // ToDo implement the massive voxel, will not work with open for now
      case VoxelState.OPEN:
        return VoxelMesh.getMeshForVoxelStandard(voxel, vX, extrusionParameters, splitIndex);
      case VoxelState.UNDEFINED:
      case VoxelState.NONE:
        return { vertices: [], faces: [] };
      case VoxelState.ONEDIRECTION:
        return VoxelMesh.getMeshForVoxelOneDirection(voxel, vX, extrusionParameters, splitIndex);
    }
  };

  public static getClosingTestMeshes = (): HalfEdgeMesh => {
    const scale = 25;

    const baseFrameSquare: QuadFace = {
      v11: V3.mul(V3.add(V3.XAxis, V3.YAxis), scale),
      v10: V3.mul(V3.XAxis, scale),
      v01: V3.mul(V3.YAxis, scale),
      v00: V3.mul(V3.Origin, scale),
    };
    const squareGSM: GeometryBaseData = {
      extrusion: { type: ExtrusionCategory.Square, insetBottom: 0.1, insetSides: 0.1, insetTop: 0.1 },
    } as GeometryBaseData;

    const arcOrigin = { x: 2 * scale, y: 0, z: 0 };
    const baseFrameArc: QuadFace = {
      v11: V3.add(baseFrameSquare.v11, arcOrigin),
      v10: V3.add(baseFrameSquare.v10, arcOrigin),
      v01: V3.add(baseFrameSquare.v01, arcOrigin),
      v00: V3.add(baseFrameSquare.v00, arcOrigin),
    };
    const argGSM: GeometryBaseData = {
      extrusion: { type: ExtrusionCategory.Arc, insetBottom: 0.1, insetSides: 0.1, insetTop: 0.1, radiusTop: 0.4 },
    } as GeometryBaseData;

    const ellipseOrigin = { x: 4 * scale, y: 0, z: 0 };
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
        VoxelMesh.getClosingMesh(baseFrameSquare, VoxelMesh.extrusionCurveForQuad(baseFrameSquare, squareUVs), squareUVs.bottomUVs.length - 1),
        VoxelMesh.getClosingMesh(baseFrameArc, VoxelMesh.extrusionCurveForQuad(baseFrameArc, arcUVs), arcUVs.bottomUVs.length - 1),
        VoxelMesh.getClosingMesh(baseFrameEllipse, VoxelMesh.extrusionCurveForQuad(baseFrameEllipse, ellipseUVs), ellipseUVs.bottomUVs.length - 1),
      ])
    );
  };

  public static getMeshForVoxelComplex = (vX: VoxelComplex, gBD: GeometryBaseData): Mesh => {
    const exParameters = VoxelMesh.getUVsForGeometryState(gBD);
    const mesh = Mesh.joinMeshes(Object.values(vX.voxels).map((v) => VoxelMesh.getMeshForVoxel(v, vX, exParameters, exParameters.bottomUVs.length - 1)));
    return mesh;
  };

  public static getHalfEdgeMeshForVoxelComplex = (vX: VoxelComplex, gBD: GeometryBaseData): HalfEdgeMesh =>
    getHalfEdgeMeshFromMesh(VoxelMesh.getMeshForVoxelComplex(vX, gBD));
}
