import React, { useEffect, useState } from 'react';
import { SemanticlyNestedDataEntry } from '../../../urlAsState/types/semanticlyNestedDataEntry';
import { DataEntry } from '../../../urlAsState/types/dataEntry';
import { DataEntryRenderer } from './dataentryrenderers/DataEntryRenderer';
import { VersionEnumSemantics } from '../../../urlAsState/types/versionParser';
import { Button, Drawer } from 'antd';
import { IconRenderer, getIconForKey } from './IconRenderer';
import { PopoverWrapper } from './PopoverWrapper';
import { ViewWrapper } from './ViewWrapper';

export enum DisplayType {
  NESTED,
  POPOVER,
  DRAWER,
}

export const getDisplayType = (key: string, displayTypeMap?: { [key: string]: DisplayType }) => {
  if (displayTypeMap?.hasOwnProperty(key)) return displayTypeMap[key];
  return DisplayType.NESTED;
};

export interface ISemtanticsRenderObjectProps {
  semantics: SemanticlyNestedDataEntry;
  name: string;
  updateEntry: (dataEntry: DataEntry) => void;
  versionEnumSemantics?: VersionEnumSemantics;
  displayTypeMap?: { [key: string]: DisplayType };
  displayType?: DisplayType;
  activeName: string;
  setActiveName: (name: string) => void;
  updateVersion?: (version: number) => void;
  asSlider?: boolean;
}

export const SemanticsRenderObject: React.FC<ISemtanticsRenderObjectProps> = ({
  semantics,
  updateEntry,
  versionEnumSemantics,
  displayTypeMap,
  name,
  activeName,
  setActiveName,
  updateVersion,
  asSlider,
}) => {
  return (
    <ViewWrapper displayType={getDisplayType(name, displayTypeMap)} name={name} activeName={activeName} setActiveName={setActiveName}>
      {Object.entries(semantics).map(([semantic, value]) => {
        const localDisplayType = getDisplayType(semantic, displayTypeMap);

        return value.hasOwnProperty('type') ? (
          <ViewWrapper displayType={getDisplayType(semantic, displayTypeMap)} name={semantic} activeName={activeName} setActiveName={setActiveName}>
            <DataEntryRenderer
              asSlider={asSlider}
              key={semantic}
              dataEntry={value as DataEntry}
              updateEntry={updateVersion && value.name === 'version' ? (v: DataEntry) => updateVersion(v.value as number) : updateEntry}
              versionEnumSemantics={versionEnumSemantics}
            />
          </ViewWrapper>
        ) : (
          <SemanticsRenderObject
            asSlider={asSlider}
            key={`${semantic}-subdata`}
            name={semantic}
            semantics={value as SemanticlyNestedDataEntry}
            versionEnumSemantics={versionEnumSemantics}
            updateEntry={updateEntry}
            displayType={localDisplayType}
            displayTypeMap={displayTypeMap}
            activeName={activeName}
            setActiveName={setActiveName}
          />
        );
      })}
    </ViewWrapper>
  );
};
