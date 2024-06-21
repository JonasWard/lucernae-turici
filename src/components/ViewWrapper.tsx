import { Button, Drawer } from 'antd';
import React, { ReactNode } from 'react';
import { PopoverWrapper } from './PopoverWrapper';
import { getIconForKey, IconRenderer } from './semantics/IconRenderer';
import { DisplayType } from './semantics/SemanticsRenderObject';

interface IViewWrapperProps {
  children: ReactNode;
  displayType: DisplayType;
  name: string;
  activeName: string;
  setActiveName: (name: string) => void;
}

export const ViewWrapper: React.FC<IViewWrapperProps> = ({ children, displayType, name, activeName, setActiveName }) => {
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
        />
      );
    case DisplayType.DRAWER:
      return (
        <>
          <Button onClick={() => setActiveName(name)}>{name}</Button>
          <Drawer children={children} open={activeName === name} title={name} onClose={() => setActiveName('')} />
        </>
      );
  }
};
