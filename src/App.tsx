/* eslint-disable */
import React, { useState } from 'react';
import { Scene } from '@babylonjs/core';
import './App.css';
import { ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, StandardMaterial, Color3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import SceneComponent from './components/SceneComponent';
import {
  ExtrusionProfile,
  ExtrusionProfileType,
  HalfEdgeRenderMethod,
  MALCULMIUS_MESH_NAME,
  MALCULMIUS_SHADE_NAME,
  renderHalfEdgeMesh,
  BaseFrameFactory,
} from './geometryGeneration/baseGeometry';
import { MalculmiusOneGeometry, Malculmiuses, createCellComplexFromMalculmiusGeometry, createMalculmiusGeometry } from './geometryGeneration/geometry';
import { DEFAULT_GEOMETRY_TYPES, DEFAULT_PROFILE_TYPES, InputRenderer } from './components/geometry/GeometryParentComponent';
import { VoxelFactory } from './geometryGeneration/voxelComplex.factory';
import { getHalfEdgeMeshForVoxelEnclosure } from './geometryGeneration/voxelComplex';
import { setVoxelComplexState } from './geometryGeneration/voxelComplex.states';
import { V3 } from './geometryGeneration/v3';
import { VoxelMesh } from './geometryGeneration/voxelComplex.mesh';
import { GeometryStateMap } from './geometryGeneration/voxelComplex.type';
import { HalfEdgeMeshRenderer } from './geometryGeneration/halfedge.artists';
import { HalfEdgeMeshFactory } from './geometryGeneration/halfedge.factory';
import { VoxelComplexMeshArtist } from './geometryGeneration/voxelComplex.artists';
import { DataToURLFactory } from './geometryGeneration/dataStringParsing';
import { CreateDefaultURL, ParseURLData } from './geometryGeneration/dataObject';
/* eslint-disable */

// import model from "./assets/model2/scene.gltf";

const App: React.FC = () => {
  let model: any;
  const [scene, setScene] = useState<null | Scene>(null);
  const [material, setMaterial] = useState<null | StandardMaterial>(null);

  const [geometry, setGeometry] = useState<MalculmiusOneGeometry>(DEFAULT_GEOMETRY_TYPES[Malculmiuses.One]);
  const [profile, setProfile] = useState<ExtrusionProfile>(DEFAULT_PROFILE_TYPES[ExtrusionProfileType.Arc]);

  const updateGeometry = (geometry: MalculmiusOneGeometry) => {
    if (!scene?.isReady()) return;
    setGeometry(geometry);
    rebuildModels(geometry, profile, scene);
  };

  const updateProfile = (profile: ExtrusionProfile) => {
    if (!scene?.isReady()) return;
    setProfile(profile);
    rebuildModels(geometry, profile, scene);
  };

  const onSceneReady = (scene: any) => {
    const camera = new ArcRotateCamera('camera1', 0, 0, 0, new Vector3(0, 1.0, 0), scene);
    camera.lowerRadiusLimit = 0.6;
    camera.upperRadiusLimit = 8.0;
    camera.panningSensibility = 1000;

    const canvas = scene.getEngine().getRenderingCanvas();

    camera.attachControl(canvas, true);
    const light = new HemisphericLight('light', new Vector3(1, 1, 1), scene);
    light.intensity = 1.5;

    // const lampLight = new PointLight('lampLight', new Vector3(0, 0.75, 0), scene);
    // lampLight.intensity = 1;

    scene.clearColor = Color3.Black();

    setScene(scene);

    const material = new StandardMaterial('material', scene);
    material.ambientColor = new Color3(0.23, 0.23, 0.23);
    material.indexOfRefraction = 0.52;
    material.alpha = 1;
    material.cameraExposure = 0.3;
    material.cameraContrast = 1.2;
    material.emissiveColor = new Color3(0.67, 0.64, 0.49);
    // material.wireframe = true;
    // material.backFaceCulling = false;
    setMaterial(material);

    const cellBase = HalfEdgeMeshFactory.createPolygon(20, 0.2, new Vector3(0, 0, 0.3));
    const cellDir = { x: 0, y: 0, z: 0.2 };
    const cellComplex = VoxelFactory.extrudeHalfEdgeMesh(cellBase, cellDir);

    // console.log(cellComplex.vertices);
    // cellComplex.vertices = Object.fromEntries(
    //   Object.entries(cellComplex.vertices).map(([k, v]) =>
    //     v.z === 500 ? [k, { x: v.x * -3, y: v.y * 3, z: v.z - 100 }] : [k, { x: v.x * -1, y: v.y, z: v.z }]
    //   )
    // );

    // MeshBuilder.CreateCylinder('pedistel', { diameterTop: 0.25, diameterBottom: 0.5, height: 1 }, scene);

    const { building, shade } = createMalculmiusGeometry(geometry, new Vector3(0, 0, 0), profile);

    const buildingCellComplex = createCellComplexFromMalculmiusGeometry(geometry);

    const sdfMethod = (v: V3) => Math.cos(v.x * 4) * Math.sin(v.y * 4) - v.z + 2;
    const baseFrames = BaseFrameFactory.getBaseFramArrayAlongDirection({ x: 0, y: 0, z: 1 }, 5, 0.25);

    const simpleGrid = HalfEdgeMeshFactory.createGrid(4, 0.25, 10, 10);
    // const voxelComplex = VoxelFactory.getCylinder([0.8, 0.7, 0.2, 0.1], [0.5, 2], 3);

    const voxelComplex = VoxelFactory.getCylinder(
      [1.0, 0.9, 0.7, 0.65, 0.45, 0.25],
      [0.5, 0.65, 0.9, 1.05, 1.4, 1.8, 2, 2.5, 2.75, 3.1, 3.25, 4.2, 4.45, 4.7],
      25
    );
    // const voxelComplex = VoxelFactory.sweepHalfEdgeMesh(simpleGrid, baseFrames);
    // setVoxelComplexState(voxelComplex, sdfMethod);

    Object.entries(buildingCellComplex.vertices).forEach(([k, v]) => {
      buildingCellComplex.vertices[k] = { x: v.x * 0.001, y: -v.y * 0.001, z: v.z * 0.001 };
    });

    // const bottomCellComplex = CellFactory.sweepHalfEdgeMesh(shade, baseFrames);
    const shellHEMesh = getHalfEdgeMeshForVoxelEnclosure(voxelComplex);

    const gSM: GeometryStateMap = {
      extrusionProfile: {
        type: ExtrusionProfileType.Ellipse,
        insetTop: 0.15,
        insetBottom: 0.15,
        insetSides: 0.25,
        radiusTop: 0.3,
      },
      // extrusionProfile: profile,
    };

    const defaultMaterial = new StandardMaterial('normalMaterial', scene);
    // VoxelComplexMeshArtist.render(voxelComplex, scene, gSM, defaultMaterial);

    // console.log(voxelComplex.voxels);

    // const closed = VoxelMesh.getHalfEdgeMeshForVoxelComplex(voxelComplex, gSM);

    // HalfEdgeMeshRenderer.render(VoxelMesh.getClosingTestMeshes(), scene);

    // const uvs = VoxelMesh.getUVsForGeometryState(gSM);

    // defaultMaterial.wireframe = true;

    // HalfEdgeMeshRenderer.render(closed, scene, defaultMaterial);

    // Object.values(closed.halfEdges).forEach((he) => renderHalfEdge(he, closed, scene));

    // Object.values(shellHEMesh.halfEdges).forEach((he) => renderHalfEdge(he, shellHEMesh, scene));

    // getMeshRepresentationOfVoxelComplexGraph(voxelComplex, scene);

    // meshToBabylonMesh(building, scene, new Vector3(0, 0.5, 0), MALCULMIUS_MESH_NAME, material ?? undefined);
    // renderHalfEdgeMesh(shade, scene, MALCULMIUS_SHADE_NAME, HalfEdgeRenderMethod.Coloured, material);
    // const localHeMesh = getHalfEdgeMeshFromMesh(building);

    DataToURLFactory.test();

    // const testMesh = HalfEdgeMeshFactory.createGrid(4, 240, 1, 2);
    // const localHeMesh = getHalfEdgeMeshFromMesh(testMesh);
    const localHeMesh = shade;
    // renderHalfEdgeMesh(localHeMesh, scene, MALCULMIUS_SHADE_NAME, HalfEdgeRenderMethod.Coloured, material);
    // console.log(localHeMesh);
    const nakedEdges = Object.values(localHeMesh.halfEdges).filter((he) => !he.neighbour);
    // runRingSearchingTest();

    SceneLoader.ShowLoadingScreen = false;

    const url = CreateDefaultURL(0);
    console.log(url);
    const parseUrl = ParseURLData(url);
    console.log(parseUrl);

    // model = SceneLoader.Append('./assets/', 'parisThermes.glb', scene, function (scene) {});
  };

  const onRender = (scene: any) => {
    if (model !== undefined) {
    }
  };

  const rebuildModels = (geometry: MalculmiusOneGeometry, profile: ExtrusionProfile, scene: Scene) => {
    scene.meshes.forEach((m) => m.name === MALCULMIUS_MESH_NAME && m.dispose());

    const { building, shade } = createMalculmiusGeometry(geometry, new Vector3(0, 0, 0), profile);
    // meshToBabylonMesh(building, scene, new Vector3(0, 0.5, 0), MALCULMIUS_MESH_NAME, material ?? undefined);
    renderHalfEdgeMesh(shade, scene, MALCULMIUS_SHADE_NAME, HalfEdgeRenderMethod.Coloured);
  };

  return (
    <div>
      <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='my-canvas' />
      <InputRenderer extrusionProfile={profile} malcolmiusGeometry={geometry} setExtrusionProfile={updateProfile} setMalcolmiusGeometry={updateGeometry} />
    </div>
  );
};

export default App;
