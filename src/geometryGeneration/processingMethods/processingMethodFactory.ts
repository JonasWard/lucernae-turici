import * as sin from './sinMethod';
import * as incremental from './incrementalMethod';
import { V3 } from '../v3';
import { ProcessingMethods } from './types/processingMethods';
import { ProcessingMethodCategory } from './types/processingMethodCategory';
import { getTwist, getWarp } from './basemethods';

export class ProcessingMethodFactory {
  public static getAngleMethod = (method: ProcessingMethods, min = 0, delta = 1): ((v: V3) => number) => {
    switch (method.type) {
      case ProcessingMethodCategory.None:
        return (v: V3) => 1;
      case ProcessingMethodCategory.IncrementalMethod:
        return incremental.getAngle(method);
      case ProcessingMethodCategory.Sin:
        return sin.getAngle(method, min, delta);
    }
  };

  public static getWarpMethod = (method: ProcessingMethods): ((v: V3) => V3) => {
    switch (method.type) {
      case ProcessingMethodCategory.None:
        return (v: V3) => v;
      case ProcessingMethodCategory.IncrementalMethod:
        return getWarp(ProcessingMethodFactory.getAngleMethod(method), method.absolute ?? false);
      case ProcessingMethodCategory.Sin:
        return getWarp(ProcessingMethodFactory.getAngleMethod(method), method.absolute ?? false, method.min, method.max - method.min);
    }
  };

  public static getTwistMethod = (method: ProcessingMethods): ((v: V3) => V3) => {
    switch (method.type) {
      case ProcessingMethodCategory.None:
        return (v: V3) => v;
      case ProcessingMethodCategory.IncrementalMethod:
        return getTwist(ProcessingMethodFactory.getAngleMethod(method));
      case ProcessingMethodCategory.Sin:
        return getTwist(ProcessingMethodFactory.getAngleMethod(method, method.min, method.max - method.min));
    }
  };
}
