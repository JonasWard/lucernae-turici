/* eslint-disable */
import React, { useState } from 'react';
import { Scene } from '@babylonjs/core';
import './App.css';
import { ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, MeshBuilder, Color3, PointLight } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import SceneComponent from './components/SceneComponent';
import { ExtrusionProfile, ExtrusionProfileType, MALCULMIUS_MESH_NAME, Voxel, meshToBabylonMesh, voxelToMesh } from './geometryGeneration/baseGeometry';
import { MalculmiusOneGeometry, Malculmiuses, createMalculmiusGeometry } from './geometryGeneration/voxelComplex';
import { DEFAULT_GEOMETRY_TYPES, DEFAULT_PROFILE_TYPES, InputRenderer } from './components/GeometricalInput';
/* eslint-disable */

// import model from "./assets/model2/scene.gltf";

const App: React.FC = () => {
  let model: any;
  const [scene, setScene] = useState<null | Scene>(null);

  const [heightMap, setHeightMap] = useState<number[]>([0, 200]);
  const [geometry, setGeometry] = useState<MalculmiusOneGeometry>(DEFAULT_GEOMETRY_TYPES[Malculmiuses.One]);
  const [profile, setProfile] = useState<ExtrusionProfile>(DEFAULT_PROFILE_TYPES[ExtrusionProfileType.Arc]);

  console.log({ geometry, profile });

  const updateGeometry = (geometry: MalculmiusOneGeometry) => {
    console.log('updateGeometry');
    if (!scene?.isReady()) return;
    setGeometry(geometry);
    rebuildModels(geometry, profile, scene);
  };

  const updateProfile = (profile: ExtrusionProfile) => {
    console.log('updateProfile');
    if (!scene?.isReady()) return;
    setProfile(profile);
    rebuildModels(geometry, profile, scene);
  };

  const onSceneReady = (scene: any) => {
    const camera = new ArcRotateCamera('camera1', 0.2, 0.3, 5, new Vector3(0, 1.5, 0), scene);
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 8.0;
    camera.panningSensibility = 0;

    const canvas = scene.getEngine().getRenderingCanvas();

    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 1;

    const lampLight = new PointLight('lampLight', new Vector3(0, 1.25, 0), scene);
    lampLight.intensity = 1;

    scene.clearColor = Color3.Black();

    // MeshBuilder.CreateCylinder('box', { diameter: 0.2, height: 1 }, scene);

    setScene(scene);

    // const voxel: Voxel = {
    //   baseProfile: [new Vector3(0, 0, 0), new Vector3(100, 0, 0), new Vector3(100, 100, 0), new Vector3(0, 100, 0)],
    //   height: 100,
    // };
    const mesh = createMalculmiusGeometry(geometry, new Vector3(0, 0, 0), heightMap, profile);
    // const mesh
    // const mesh = voxelToMesh(voxel, profile);

    meshToBabylonMesh(mesh, scene, new Vector3(0, 0, 0));

    model = SceneLoader.Append('./assets/', 'parisThermes.glb', scene, function (scene) {});
  };

  const onRender = (scene: any) => {
    if (model !== undefined) {
      // console.log("hhh")
    }
  };

  const rebuildModels = (geometry: MalculmiusOneGeometry, profile: ExtrusionProfile, scene: Scene) => {
    // remove the old mesh
    scene.meshes.forEach((m) => m.name === MALCULMIUS_MESH_NAME && m.dispose());

    const mesh = createMalculmiusGeometry(geometry, new Vector3(0, 0, 0), heightMap, profile);
    meshToBabylonMesh(mesh, scene, new Vector3(0, 0, 0));
  };

  return (
    <div>
      <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='my-canvas' />
      <InputRenderer extrusionProfile={profile} malcolmiusGeometry={geometry} setExtrusionProfile={updateProfile} setMalcolmiusGeometry={updateGeometry} />
    </div>
  );
};

export default App;
