import { Color3, Material, Scene, StandardMaterial } from '@babylonjs/core';
import { MaterialOptions } from './material';
import { VIRIDIS } from './materialColors/viridis';
import { TWILIGHT } from './materialColors/twilight';

export enum MaterialUUIDColorStates {
  RED,
  GREEN,
  BLUE,
  RGB,
  BLACK_AND_WHITE,
  VIRIDIS,
  TWILIGHT,
}

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

  public static UUIDColorOptions: MaterialUUIDColorStates = MaterialUUIDColorStates.VIRIDIS;

  // red hui
  private static getColorFromUUIDRed = (s: string) => Color3.FromHexString(`#ff${s.slice(0, 2)}${s.slice(0, 2)}`);
  // green hui
  private static getColorFromUUIDGreen = (s: string) => Color3.FromHexString(`#${s.slice(0, 2)}ff${s.slice(0, 2)}`);
  // blue hui
  private static getColorFromUUIDBlue = (s: string) => Color3.FromHexString(`#${s.slice(0, 2)}${s.slice(0, 2)}ff`);
  // normal colors
  private static getColorFromUUIDRGB = (s: string) => Color3.FromHexString(`#${s.slice(0, 6)}`);
  // black and white
  private static getColorFromUUIDBlackAndWhite = (s: string) => Color3.FromHexString(`#${s.slice(0, 2)}${s.slice(0, 2)}${s.slice(0, 2)}`);

  private static maxValue = 2 ** 24 - 1;
  private static inverseMaxValue = 1 / MaterialFactory.maxValue;

  //
  private static getColorInArray = (s: string, a: [number, number, number][]): Color3 => {
    const v = parseInt(s, 16) * MaterialFactory.inverseMaxValue;
    const index = v * (a.length - 1);
    const i0 = Math.floor(index);
    const i1 = Math.ceil(index);

    if (i0 === i1) return new Color3(...a[i0]);
    const f = index - i0;
    return new Color3(a[i0][0] * (1 - f) + a[i1][0] * f, a[i0][1] * (1 - f) + a[i1][1] * f, a[i0][2] * (1 - f) + a[i1][2] * f);
  };

  private static getColorFromUUIDViridis = (s: string) => MaterialFactory.getColorInArray(s, VIRIDIS);
  private static getColorFromUUIDTwilight = (s: string) => MaterialFactory.getColorInArray(s, TWILIGHT);

  private static getColorFromUUID = (s: string) => {
    switch (MaterialFactory.UUIDColorOptions) {
      case MaterialUUIDColorStates.RGB:
        return MaterialFactory.getColorFromUUIDRGB(s);
      case MaterialUUIDColorStates.RED:
        return MaterialFactory.getColorFromUUIDRed(s);
      case MaterialUUIDColorStates.GREEN:
        return MaterialFactory.getColorFromUUIDGreen(s);
      case MaterialUUIDColorStates.BLUE:
        return MaterialFactory.getColorFromUUIDBlue(s);
      case MaterialUUIDColorStates.BLACK_AND_WHITE:
        return MaterialFactory.getColorFromUUIDBlackAndWhite(s);
      case MaterialUUIDColorStates.VIRIDIS:
        return MaterialFactory.getColorFromUUIDViridis(s);
      case MaterialUUIDColorStates.TWILIGHT:
        return MaterialFactory.getColorFromUUIDTwilight(s);
    }
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
      emissiveColor: MaterialFactory.getColorFromUUID(sixCharacters),
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
