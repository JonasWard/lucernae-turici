import { Button, Popover } from 'antd';
import React from 'react';
import { ReactNode } from 'react';

interface ISemanticsPopoverProps {
  children: ReactNode;
  title: string;
  relativePosition: number;
}

export const SemanticsPopover: React.FC<ISemanticsPopoverProps> = ({ children, title, relativePosition }) => (
  <Popover content={children} title={title} placement='right'>
    <Button style={{ position: 'absolute', left: 0, top: relativePosition * 50 }}>{title}</Button>
  </Popover>
);
