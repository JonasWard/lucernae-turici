import { Button, Popover } from 'antd';
import React, { ReactNode } from 'react';

interface IPopoverWrapperProps {
  open: boolean;
  toggleOpen: (open: boolean) => void;
  content: ReactNode;
  title: ReactNode;
  buttonIcon: ReactNode;
}

export const PopoverWrapper: React.FC<IPopoverWrapperProps> = ({ open, toggleOpen, content, title, buttonIcon }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'end' }}>
      <Popover
        placement='leftTop'
        open={open}
        onOpenChange={toggleOpen}
        trigger='click'
        color='#ffffffb0'
        content={
          <div style={{ width: 250 }}>
            {content}
            <Button style={{ margin: 8 }} onClick={() => toggleOpen(false)}>
              ok
            </Button>
          </div>
        }
        title={<div style={{ margin: '8px 8px 4px 8px', paddingBottom: '6px', width: 250 - 16, borderBottom: '1px solid black' }}>{title}</div>}
      >
        <Button style={{ margin: 8, width: 20 }}>{buttonIcon}</Button>
      </Popover>
    </div>
  );
};
