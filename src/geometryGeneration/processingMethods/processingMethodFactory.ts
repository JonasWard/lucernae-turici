import * as sin from './sinMethod';
import * as incremental from './incrementalMethod';
import { V3 } from '../v3';
import { ProcessingMethods } from './types/processingMethods';
import { ProcessingMethodCategory } from './types/processingMethodCategory';
import { getTwist, getWarp } from './basemethods';

export class ProcessingMethodFactory {
  public static getAngleMethod = (method: ProcessingMethods): ((v: V3) => number) => {
    switch (method.type) {
      case ProcessingMethodCategory.None:
        return (v: V3) => 1;
      case ProcessingMethodCategory.IncrementalMethod:
        return incremental.getAngle(method);
      case ProcessingMethodCategory.Sin:
        return sin.getAngle(method);
    }
  };

  public static getWarpMethod = (method: ProcessingMethods): ((v: V3) => V3) => {
    switch (method.type) {
      case ProcessingMethodCategory.None:
        return (v: V3) => v;
      case ProcessingMethodCategory.IncrementalMethod:
      case ProcessingMethodCategory.Sin:
        return getWarp(ProcessingMethodFactory.getAngleMethod(method), method.absolute ?? false);
    }
  };

  public static getTwistMethod = (method: ProcessingMethods): ((v: V3) => V3) => {
    switch (method.type) {
      case ProcessingMethodCategory.None:
        return (v: V3) => v;
      case ProcessingMethodCategory.IncrementalMethod:
      case ProcessingMethodCategory.Sin:
        return getTwist(ProcessingMethodFactory.getAngleMethod(method));
    }
  };
}
