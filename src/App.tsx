/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { Mesh, PointLight, Scene, TransformNode } from '@babylonjs/core';
import './App.css';
import { ArcRotateCamera, Vector3, HemisphericLight, Color3 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import SceneComponent from './components/SceneComponent';
import { GeometryBaseData } from './geometryGeneration/baseGeometry';
import { AddLampGeometryToScene, RenderMethod } from './geometryGeneration/geometryEntry';
/* eslint-disable */

// import model from "./assets/model2/scene.gltf";

type IAppProps = {
  gBD: GeometryBaseData;
  renderMethod?: RenderMethod;
  rerender: boolean;
  completedRerender: () => void;
};

const App: React.FC<IAppProps> = ({ gBD, rerender, completedRerender, renderMethod }) => {
  const [scene, setScene] = useState<null | Scene>(null);
  const [mesh, setMesh] = useState<null | Mesh | TransformNode>(null);

  const updateGeometry = (gBD: GeometryBaseData, mesh: Mesh | TransformNode | null, renderMethod?: RenderMethod) => {
    if (!scene?.isReady()) return;

    setMesh(AddLampGeometryToScene(gBD, scene, mesh, renderMethod));
    completedRerender();
  };

  const onSceneReady = (scene: any) => {
    const camera = new ArcRotateCamera('camera1', 0, 0, 0, new Vector3(0, 3.0, 0), scene);
    camera.lowerRadiusLimit = 0.6;
    camera.upperRadiusLimit = 100.0;
    camera.panningSensibility = 1000;

    const canvas = scene.getEngine().getRenderingCanvas();

    camera.attachControl(canvas, true);
    const light = new HemisphericLight('light', new Vector3(1, 1, 1), scene);
    light.intensity = 3;

    const lampLight = new PointLight('lampLight', new Vector3(0, 0.75, 0), scene);
    lampLight.intensity = 1;

    scene.clearColor = Color3.Red();

    setScene(scene);

    updateGeometry(gBD, mesh, renderMethod);
  };

  const onRender = (scene: Scene) => {};

  useEffect(() => {
    if (rerender) updateGeometry(gBD, mesh, renderMethod);
  }, [rerender, gBD, mesh, renderMethod]);

  return <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id='my-canvas' />;
};

export default App;
