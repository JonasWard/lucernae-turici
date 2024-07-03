import { Button, Drawer } from 'antd';
import React, { ReactNode } from 'react';
import { PopoverWrapper } from './PopoverWrapper';
import { getIconForKey, IconRenderer } from './IconRenderer';
import { DisplayType } from './SemanticsRenderObject';
import { DrawerWrapper } from './DrawerWrapper';

interface IViewWrapperProps {
  children: ReactNode;
  displayType: DisplayType;
  name: string;
  activeName: string;
  setActiveName: (name: string) => void;
  disabled: string[];
}

export const ViewWrapper: React.FC<IViewWrapperProps> = ({ children, displayType, name, activeName, setActiveName, disabled }) => {
  switch (displayType) {
    case DisplayType.NESTED:
      return <div style={{ margin: '4px 0' }}>{children}</div>;
    case DisplayType.POPOVER:
      return (
        <PopoverWrapper
          open={activeName === name}
          toggleOpen={(v: boolean) => setActiveName(v ? name : '')}
          children={children}
          title={getIconForKey(name).mainIcon !== name ? <IconRenderer name={name} /> : name}
          buttonIcon={<IconRenderer name={name} noName />}
          disabled={disabled.includes(name)}
        />
      );
    case DisplayType.DRAWER:
      return (
        <DrawerWrapper
          open={activeName === name}
          toggleOpen={(v: boolean) => setActiveName(v ? name : '')}
          children={children}
          title={getIconForKey(name).mainIcon !== name ? <IconRenderer name={name} /> : name}
          buttonIcon={<IconRenderer name={name} noName />}
          disabled={disabled.includes(name)}
        />
      );
    case DisplayType.HIDDEN:
      return <></>;
  }
};
