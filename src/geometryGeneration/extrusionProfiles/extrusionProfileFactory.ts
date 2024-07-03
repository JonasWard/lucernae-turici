import * as square from './square';
import * as arc from './arc';
import * as ellipse from './ellipse';
import * as gothic from './gothic';
import * as nested from './nested';
import { ExtrusionCategory } from './types/extrusionCategory';
import { ExtrusionProfileType } from './types/extrusionProfileType';
import { V2 } from '../v2';

export class ExtrusionProfileFactory {
  public static getUVPair = (profile: ExtrusionProfileType, divisions?: number): [V2[], V2[]] => {
    switch (profile.type) {
      case ExtrusionCategory.Square:
        return square.getExtrusionProfile(profile);
      case ExtrusionCategory.Arc:
        return arc.getExtrusionProfile(profile, divisions);
      case ExtrusionCategory.Ellipse:
        return ellipse.getExtrusionProfile(profile, divisions);
      case ExtrusionCategory.Gothic:
        return gothic.getExtrusionProfile(profile, divisions);
      case ExtrusionCategory.Nested:
        return nested.getExtrusionProfile(profile);
    }
  };
}
