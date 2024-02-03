/* eslint-disable */
import React from 'react';
import './App.css';
import { ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, MeshBuilder, Color3, PointLight } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import SceneComponent from './components/SceneComponent';
import {
  ArcExtrusionProfile,
  EllipseExtrusionProfile,
  ExtrusionProfileType,
  SquareExtrusionProfile,
  Voxel,
  meshToBabylonMesh,
  voxelToMesh,
} from './geometryGeneration/baseGeometry';
import { MalculmiusOneGeometry, Malculmiuses, createMalculmiusGeometry } from './geometryGeneration/voxelComplex';
/* eslint-disable */

// import model from "./assets/model2/scene.gltf";

const App: React.FC = () => {
  let model: any;

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

    MeshBuilder.CreateCylinder('box', { diameter: 0.2, height: 1 }, scene);

    const voxel: Voxel = {
      baseProfile: [new Vector3(0, 0, 1), new Vector3(1, 0, 1), new Vector3(1, 1, 1), new Vector3(0, 1, 1)],
      height: 1,
    };

    const profile: ArcExtrusionProfile = {
      type: ExtrusionProfileType.Arc,
      radiusTop: 0.1,
      insetTop: 0.1,
      insetBottom: 0.1,
      insetSides: 0.1,
    };

    const profileEllipse: EllipseExtrusionProfile = {
      type: ExtrusionProfileType.Ellipse,
      radius: 0.2,
      insetTop: 0.1,
      insetBottom: 0.1,
      insetSides: 0.1,
    };

    const profileSquare: SquareExtrusionProfile = {
      type: ExtrusionProfileType.Square,
      insetTop: 0.1,
      insetBottom: 0.1,
      insetSides: 0.1,
    };

    const geometry: MalculmiusOneGeometry = {
      type: Malculmiuses.One,
      circleRadius: 1,
      circleDivisions: 5,
      angleSplit: 0.5,
      offsetA: 0.1,
      offsetB: -0.1,
      innerRadius: 0.5,
    };

    const heightMap = [0, 2, 3, 4, 5];

    const mesh = createMalculmiusGeometry(geometry, new Vector3(0, 0, 0), heightMap, profileEllipse);
    // const mesh = voxelToMesh(voxel, profileEllipse);

    meshToBabylonMesh(mesh, scene);

    model = SceneLoader.Append('./assets/', 'parisThermes.glb', scene, function (scene) {});
  };

  const onRender = (scene: any) => {
    if (model !== undefined) {
      // console.log("hhh")
    }
  };

  return (
    <div>
      <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='my-canvas' />
    </div>
  );
};

export default App;
