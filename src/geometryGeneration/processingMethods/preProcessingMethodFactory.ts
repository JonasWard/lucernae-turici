import { V3 } from '../v3';
import { ProcessingMethodCategory } from './types/processingMethodCategory';
import { PreProcessingMethods } from '../geometry';
import { ProcessingMethodFactory } from './processingMethodFactory';

export class PreProcessingMethodFactory {
  public static getPreProcessingMethod = (preProcessing: PreProcessingMethods): ((v: V3) => V3) => {
    if (preProcessing.warp.type === ProcessingMethodCategory.None && preProcessing.twist.type === ProcessingMethodCategory.None) return (v: V3) => v;

    if (preProcessing.warp.type === ProcessingMethodCategory.None) return ProcessingMethodFactory.getTwistMethod(preProcessing.twist);

    if (preProcessing.twist.type === ProcessingMethodCategory.None) return ProcessingMethodFactory.getWarpMethod(preProcessing.warp);

    const twistAngleMethod =
      preProcessing.twist.type === ProcessingMethodCategory.Sin
        ? ProcessingMethodFactory.getAngleMethod(preProcessing.twist, preProcessing.twist.min, preProcessing.twist.max - preProcessing.twist.min)
        : ProcessingMethodFactory.getAngleMethod(preProcessing.twist);

    const warpAngleMethod = ProcessingMethodFactory.getAngleMethod(preProcessing.warp);
    const warpAbsolute = preProcessing.warp.absolute ?? false;

    return (v: V3) => {
      const tAngle = twistAngleMethod(v);
      const wAngle = warpAngleMethod(v);

      const warpMax = preProcessing.warp.type === ProcessingMethodCategory.Sin ? preProcessing.warp.max : 0;
      const warpMin = preProcessing.warp.type === ProcessingMethodCategory.Sin ? preProcessing.warp.min : 0;

      const warp = warpMin + (0.5 + 0.5 * Math.sin(wAngle)) * (warpMax - warpMin) + (warpAbsolute ? 1 : 0);

      const c = (0.5 + 0.5 * Math.cos(tAngle)) * warp;
      const s = (0.5 + 0.5 * Math.sin(tAngle)) * warp;

      return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z };
    };
  };
}
