/* eslint-disable */
import React, { useState } from 'react';
import { Scene } from '@babylonjs/core';
import './App.css';
import { ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, StandardMaterial, Color3, MeshBuilder, PointLight } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import SceneComponent from './components/SceneComponent';
import {
  ExtrusionProfile,
  ExtrusionProfileType,
  HalfEdgeRenderMethod,
  MALCULMIUS_MESH_NAME,
  MALCULMIUS_SHADE_NAME,
  renderHalfEdgeMesh,
} from './geometryGeneration/baseGeometry';
import { MalculmiusOneGeometry, Malculmiuses, createMalculmiusGeometry } from './geometryGeneration/voxelComplex';
import { DEFAULT_GEOMETRY_TYPES, DEFAULT_PROFILE_TYPES, InputRenderer } from './components/geometry/GeometryParentComponent';
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
    const camera = new ArcRotateCamera('camera1', 0.3, 1.5, 2.5, new Vector3(0, 1.0, 0), scene);
    camera.lowerRadiusLimit = 0.6;
    camera.upperRadiusLimit = 8.0;
    camera.panningSensibility = 0;

    const canvas = scene.getEngine().getRenderingCanvas();

    camera.attachControl(canvas, true);
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.2;

    const lampLight = new PointLight('lampLight', new Vector3(0, 0.75, 0), scene);
    lampLight.intensity = 1;

    scene.clearColor = Color3.Black();

    setScene(scene);

    const material = new StandardMaterial('material', scene);
    material.ambientColor = new Color3(0.23, 0.23, 0.23);
    material.indexOfRefraction = 0.52;
    material.alpha = 1;
    material.cameraExposure = 0.66;
    material.cameraContrast = 1.66;
    material.emissiveColor = new Color3(0.67, 0.64, 0.49);
    setMaterial(material);

    // MeshBuilder.CreateCylinder('pedistel', { diameterTop: 0.25, diameterBottom: 0.5, height: 1 }, scene);

    const { building, shade } = createMalculmiusGeometry(geometry, new Vector3(0, 0, 0), profile);

    // meshToBabylonMesh(building, scene, new Vector3(0, 0.5, 0), MALCULMIUS_MESH_NAME, material ?? undefined);
    renderHalfEdgeMesh(shade, scene, MALCULMIUS_SHADE_NAME, HalfEdgeRenderMethod.Coloured);

    SceneLoader.ShowLoadingScreen = false;

    model = SceneLoader.Append('./assets/', 'parisThermes.glb', scene, function (scene) {});
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
