import { Color3, Material, Mesh, Scene, StandardMaterial } from '@babylonjs/core';
import { MaterialOptions } from './material';

export class MaterialFactory {
  private static create = (scene: Scene, materialOptions: MaterialOptions): Material => {
    const material = scene.getMaterialByName(materialOptions.name);
    if (material) return material;
    const newMaterial = new StandardMaterial(materialOptions.name, scene);
    if (materialOptions.backFaceCulling !== undefined) newMaterial.backFaceCulling = materialOptions.backFaceCulling;
    if (materialOptions.wireframe !== undefined) newMaterial.wireframe = materialOptions.wireframe;
    if (materialOptions.emissiveColor !== undefined) newMaterial.emissiveColor = materialOptions.emissiveColor;
    if (materialOptions.diffuseColor !== undefined) newMaterial.diffuseColor = materialOptions.diffuseColor;
    if (materialOptions.alpha) newMaterial.alpha = materialOptions.alpha;
    return newMaterial;
  };

  private static lampMaterialOptions: MaterialOptions = {
    name: 'lampMaterial',
    emissiveColor: new Color3(0.67, 0.64, 0.49),
    wireframe: false,
  };

  public static getLampMaterial = (scene: Scene): Material => MaterialFactory.create(scene, MaterialFactory.lampMaterialOptions);

  private static getMaterialOptionsForUuid = (uuid: string, precedingString: string, backFaceCulling?: boolean): MaterialOptions => {
    const sixCharacters = uuid.slice(0, 6);

    return {
      name: `${precedingString}${sixCharacters}`,
      emissiveColor: Color3.FromHexString(`#${sixCharacters}`),
      backFaceCulling,
    };
  };

  public static getMaterialForUuid = (scene: Scene, uuid: string, precedingString: string = 'uuidMaterial-', backFaceCulling?: boolean): Material =>
    MaterialFactory.create(scene, MaterialFactory.getMaterialOptionsForUuid(uuid, precedingString, backFaceCulling));

  private static defaultMaterialOptions = {
    name: 'defaultMaterial',
    wireframe: false,
    diffuseColor: new Color3(1, 1, 1),
  };

  public static getDefaultMaterial = (scene: Scene): Material => MaterialFactory.create(scene, MaterialFactory.defaultMaterialOptions);

  private static wireframeMaterialOptions = {
    name: 'wireframeMaterial',
    wireframe: true,
  };

  public static getWireframeMaterial = (scene: Scene): Material => MaterialFactory.create(scene, MaterialFactory.wireframeMaterialOptions);
}
