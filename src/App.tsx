/* eslint-disable */
import React from 'react';
import './App.css';
import { ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, MeshBuilder, Color3, PointLight } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import SceneComponent from './components/SceneComponent';
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
    light.intensity = 0.02;

    const lampLight = new PointLight('lampLight', new Vector3(0, 1.25, 0), scene);
    lampLight.intensity = 1;

    scene.clearColor = Color3.Black();

    MeshBuilder.CreateCylinder('box', { diameter: 0.2, height: 1 }, scene);

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
