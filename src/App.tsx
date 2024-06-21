/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { Mesh, PointLight, Scene, TransformNode } from '@babylonjs/core';
import './App.css';
import { ArcRotateCamera, Vector3, HemisphericLight, Color3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import SceneComponent from './components/SceneComponent';
import { GeometryBaseData } from './geometryGeneration/baseGeometry';
import { AddLampGeometryToScene, RenderMethod } from './geometryGeneration/geometryEntry';
import { CameraParameters } from './components/ViewCube';
/* eslint-disable */

// import model from "./assets/model2/scene.gltf";
export const BABYLON_CANVAS_ID = 'my-canvas';

type IAppProps = {
  gBD: GeometryBaseData;
  renderMethod?: RenderMethod;
  rerender: boolean;
  completedRerender: () => void;
  setActiveName: (s: string) => void;
  lastCameraParameters?: CameraParameters;
};

const App: React.FC<IAppProps> = ({ gBD, rerender, completedRerender, renderMethod, setActiveName, lastCameraParameters }) => {
  const [scene, setScene] = useState<null | Scene>(null);
  const [mesh, setMesh] = useState<null | Mesh | TransformNode>(null);
  const [camera, setCamera] = useState<null | ArcRotateCamera>(null);

  const updateGeometry = (gBD: GeometryBaseData, mesh: Mesh | TransformNode | null, renderMethod?: RenderMethod) => {
    if (!scene?.isReady()) return;

    setMesh(AddLampGeometryToScene(gBD, scene, mesh, renderMethod));
    completedRerender();
  };

  const onClickWindowClearActiveName = () => setActiveName('');

  const onSceneReady = (scene: any) => {
    const camera = new ArcRotateCamera('camera1', 1, 1, 50, new Vector3(0, 10.0, 0), scene);
    camera.lowerRadiusLimit = 0.6;
    camera.upperRadiusLimit = 200.0;
    camera.panningSensibility = 1000;

    setCamera(camera);

    const node = document.getElementById(BABYLON_CANVAS_ID);
    if (node) {
      node.addEventListener('click', onClickWindowClearActiveName);
      node.addEventListener('mousedown', onClickWindowClearActiveName);
      node.addEventListener('touchstart', onClickWindowClearActiveName);
    }

    const canvas = scene.getEngine().getRenderingCanvas();

    camera.attachControl(canvas, true);
    const light = new HemisphericLight('light', new Vector3(1, 1, 1), scene);
    light.intensity = 1;

    const lampLight = new PointLight('lampLight', new Vector3(0, 0.75, 0), scene);
    lampLight.intensity = 1;

    scene.clearColor = Color3.Red();

    setScene(scene);

    updateGeometry(gBD, mesh, renderMethod);
  };

  useEffect(() => {
    if (camera && lastCameraParameters) {
      camera.alpha = lastCameraParameters.alfa;
      camera.beta = lastCameraParameters.beta;
      camera.radius = lastCameraParameters.radius;
      camera.setTarget(new Vector3(lastCameraParameters.target.x, lastCameraParameters.target.y, lastCameraParameters.target.z));
    }
  }, [lastCameraParameters]);

  const onRender = (scene: Scene) => {};

  useEffect(() => {
    if (rerender) updateGeometry(gBD, mesh, renderMethod);
  }, [rerender, gBD, mesh, renderMethod]);

  return (
    <SceneComponent
      antialias
      onSceneReady={onSceneReady}
      onRender={onRender}
      id={BABYLON_CANVAS_ID}
      engineOptions={{ adaptToDeviceRatio: true, antialias: true }}
    />
  );
};

export default App;
