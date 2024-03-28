import { Button, Drawer } from 'antd';
import { useState } from 'react';
import { GeometryRenderer } from './GeometryRenderer';
import { ExtrusionRenderer } from './GeometryExtrusionSettings';
import { IInputProps } from './GeometryParentComponent';

export const inputButtonStyle: React.CSSProperties = { position: 'fixed', left: 80, top: 6 };

export const InputDrawer: React.FC<IInputProps> = ({ extrusionProfile, malcolmiusGeometry, setExtrusionProfile, setMalcolmiusGeometry }) => {
  const [showDrawer, setShowDrawer] = useState<boolean>(false);

  return (
    <>
      <Button style={inputButtonStyle} onClick={() => setShowDrawer(!showDrawer)}>
        Toggle Drawer
      </Button>
      <Drawer onClose={() => setShowDrawer(false)} open={showDrawer} placement='left'>
        <ExtrusionRenderer extrusionProfile={extrusionProfile} setExtrusionProfile={setExtrusionProfile} />
        <GeometryRenderer malcolmiusGeometry={malcolmiusGeometry} setMalcolmiusGeometry={setMalcolmiusGeometry} />
      </Drawer>
    </>
  );
};
