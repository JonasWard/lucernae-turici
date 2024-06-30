import { Scene } from '@babylonjs/core';
import { OBJExport, STLExport } from 'babylonjs-serializers';
import { LAMP_MESH } from '../geometryEntry';

export const exportOBJ = (scene: Scene, fileName = 'lamp-geometry') => {
  const mesh = scene.getMeshByName(LAMP_MESH);
  const data = OBJExport.OBJ([mesh], true);

  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(new Blob([data], { type: 'text/plain' }));
  a.download = `${fileName}.obj`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const exportSTL = (scene: Scene, fileName = 'lamp-geometry') => {
  const mesh = scene.getMeshByName(LAMP_MESH);
  STLExport.CreateSTL([mesh], true, `${fileName}`);
};
