import React, { useEffect, useState } from 'react';
import { SemanticlyNestedDataEntry } from '../../urlAsState/types/semanticlyNestedDataEntry';
import { DataEntry } from '../../urlAsState/types/dataEntry';
import { DataEntryRenderer } from './dataentryrenderers/DataEntryRenderer';
import { VersionEnumSemantics } from '../../urlAsState/types/versionParser';
import { Button, Drawer, Popover } from 'antd';
import { IconRenderer, getIconForKey } from './IconRenderer';

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
          <div key={semantic} style={{ padding: 10, width: 'calc(100% - 20px)' }}>
            <DataEntryRenderer
              key={semantic}
              dataEntry={value as DataEntry}
              updateEntry={updateVersion && value.name === 'version' ? (v: DataEntry) => updateVersion(v.value as number) : updateEntry}
              versionEnumSemantics={versionEnumSemantics}
            />
          </div>
        ) : (
          <SemanticsRenderObject
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
          <div>{name}</div>
          {content}
        </div>
      );
    case DisplayType.POPOVER:
      return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'end' }}>
          <Popover
            placement='leftTop'
            open={open}
            onOpenChange={toggleOpen}
            trigger='click'
            content={
              <div style={{ width: 200 }}>
                {content}
                <Button onClick={() => toggleOpen(false)}>ok</Button>
              </div>
            }
            title={getIconForKey(name).mainIcon !== name ? <IconRenderer name={name} /> : name}
          >
            <Button style={{ margin: 10, width: 20 }}>
              <IconRenderer name={name} noName />
            </Button>
          </Popover>
        </div>
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
