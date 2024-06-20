import { Engine, EngineOptions, Scene } from '@babylonjs/core';
import React from 'react';
import { useEffect, useRef } from 'react';

export default (props: any) => {
  const reactCanvas = useRef(null);
  const { antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady, ...rest } = props;

  useEffect(() => {
    if (reactCanvas.current) {
      const engine = new Engine(reactCanvas.current, antialias, engineOptions as EngineOptions, adaptToDeviceRatio);
      const scene = new Scene(engine, sceneOptions);

      if (scene.isReady()) props.onSceneReady(scene);
      else scene.onReadyObservable.addOnce((scene) => props.onSceneReady(scene));

      engine.runRenderLoop(() => {
        if (typeof onRender === 'function') onRender(scene);

        scene.render();
      });

      const resize = () => scene.getEngine().resize();

      window.addEventListener('resize', resize);

      return () => {
        scene.getEngine().dispose();
        window.removeEventListener('resize', resize);
      };
    }
  }, [reactCanvas]);

  return <canvas className='babylon-scene' ref={reactCanvas} {...rest} />;
};
