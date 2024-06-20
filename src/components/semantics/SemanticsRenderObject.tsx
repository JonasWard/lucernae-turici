import React, { useEffect, useState } from 'react';
import { SemanticlyNestedDataEntry } from '../../urlAsState/types/semanticlyNestedDataEntry';
import { DataEntry } from '../../urlAsState/types/dataEntry';
import { DataEntryRenderer } from './dataentryrenderers/DataEntryRenderer';
import { VersionEnumSemantics } from '../../urlAsState/types/versionParser';
import { Button, Drawer, Popover } from 'antd';
import { IconRenderer, getIconForKey } from './IconRenderer';
import { PopoverWrapper } from './PopoverWrapper';

export enum DisplayType {
  NESTED,
  POPOVER,
  DRAWER,
}

const getDisplayType = (key: string, displayTypeMap?: { [key: string]: DisplayType }) => {
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
  displayType = DisplayType.NESTED,
  name,
  activeName,
  setActiveName,
  updateVersion,
  asSlider,
}) => {
  const [open, setOpen] = useState(name === activeName);

  const toggleOpen = (open: boolean) => {
    setOpen(open);
    if (!open) setActiveName('');
    setActiveName(name);
  };

  useEffect(() => {
    if (activeName !== name) setOpen(false);
  }, [activeName, name]);

  const content = (
    <>
      {Object.entries(semantics).map(([semantic, value]) => {
        const localDisplayType = getDisplayType(semantic, displayTypeMap);

        return value.hasOwnProperty('type') ? (
          <div key={semantic} style={{ padding: 8 }}>
            <DataEntryRenderer
              asSlider={asSlider}
              key={semantic}
              dataEntry={value as DataEntry}
              updateEntry={updateVersion && value.name === 'version' ? (v: DataEntry) => updateVersion(v.value as number) : updateEntry}
              versionEnumSemantics={versionEnumSemantics}
            />
          </div>
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
    </>
  );

  switch (displayType) {
    case DisplayType.NESTED:
      return (
        <div key={name}>
          <div style={{ margin: '3px 8px', paddingBottom: 3, borderBottom: '1px solid #00000033' }}>{name}</div>
          {content}
        </div>
      );
    case DisplayType.POPOVER:
      return (
        <PopoverWrapper
          open={open}
          toggleOpen={toggleOpen}
          content={content}
          title={getIconForKey(name).mainIcon !== name ? <IconRenderer name={name} /> : name}
          buttonIcon={<IconRenderer name={name} noName />}
        />
      );
    case DisplayType.DRAWER:
      return (
        <>
          <Button onClick={() => toggleOpen(true)}>{name}</Button>
          <Drawer open={open} title={name} onClose={() => toggleOpen(false)}>
            {content}
          </Drawer>
        </>
      );
  }
};
