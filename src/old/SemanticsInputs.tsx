import React from 'react';
import { getBoundsObjectFromDataObject, getVersionObjectFromDataObject } from './dataObject';
import { SemanticValueString } from './dataSemanticsEnums';
import { NestedBoundsObject, NestedValueObject, SemanticValues } from './dataStringParsing';
import { SemanticsRenderObject } from '../components/semantics/SemanticsRenderObject';
import { SemanticsPopover } from '../components/semantics/SemanticsPopover';

export interface IISemanticsInputsProps {
  semantics: SemanticValues;
  setSemantics: (semantics: SemanticValues) => void;
}

const semanticsOrder = [
  SemanticValueString.version,
  SemanticValueString.extrusionTypeParameters,
  SemanticValueString.floorTypeParameters,
  SemanticValueString.heightMethodParameters,
];

const VersionRenderer: React.FC<{ version: string }> = ({ version }) => <div style={{ position: 'absolute', left: 10, top: 10 }}>{`Version: ${version}`}</div>;

export const SemanticsInputs: React.FC<IISemanticsInputsProps> = ({ semantics, setSemantics }) => {
  const versionObject = getVersionObjectFromDataObject(semantics);
  const boundsObject = getBoundsObjectFromDataObject(semantics, versionObject);

  return (
    <div>
      {semanticsOrder.map((semantic, i) => {
        switch (semantic) {
          case SemanticValueString.version:
            return <VersionRenderer version={versionObject.versionName} />;
          case SemanticValueString.extrusionTypeParameters:
            return (
              <SemanticsPopover title={SemanticValueString.extrusionTypeParameters} relativePosition={i}>
                <SemanticsRenderObject
                  semantics={semantics.extrusionTypeParameters as NestedValueObject}
                  boundsObject={boundsObject.extrusionTypeParameters as NestedBoundsObject}
                  setSemantics={() => {}}
                />
              </SemanticsPopover>
            );
          case SemanticValueString.floorTypeParameters:
            return (
              <SemanticsPopover title={SemanticValueString.floorTypeParameters} relativePosition={i}>
                <SemanticsRenderObject
                  semantics={semantics.floorTypeParameters as NestedValueObject}
                  boundsObject={boundsObject.floorTypeParameters as NestedBoundsObject}
                  setSemantics={() => {}}
                />
              </SemanticsPopover>
            );
          case SemanticValueString.heightMethodParameters:
            return (
              <SemanticsPopover title={SemanticValueString.heightMethodParameters} relativePosition={i}>
                <SemanticsRenderObject
                  semantics={semantics.heightMethodParameters as NestedValueObject}
                  boundsObject={boundsObject.heightMethodParameters as NestedBoundsObject}
                  setSemantics={() => {}}
                />
              </SemanticsPopover>
            );
          default:
            return <div>{`Unknown Semantic: ${semantic}`}</div>;
        }
      })}
    </div>
  );
};
