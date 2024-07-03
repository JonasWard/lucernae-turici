import React, { ReactNode } from 'react';
import { DataType } from '../../../urlAsState/enums/dataTypes';
import { CiLineHeight } from 'react-icons/ci';
import { FaArchway, FaCog, FaVectorSquare } from 'react-icons/fa';
import { FaRegSquareFull, FaRegCircle } from 'react-icons/fa6';
import { PiCubeFocusFill, PiRainbowLight, PiStackPlusFill, PiWaveSine } from 'react-icons/pi';
import { BsFillGrid3X3GapFill } from 'react-icons/bs';
import { TbCylinder, TbHexagonalPrism, TbHexagons, TbSum } from 'react-icons/tb';
import { GiArabicDoor, GiBridge, GiColumnVase, GiFootprint, GiPoolTriangle } from 'react-icons/gi';
import { MdFormatListNumbered } from 'react-icons/md';

export interface IconRendererProps {
  name: string;
  type?: DataType;
  noName?: boolean;
  size?: number;
}

export const getIconForKey = (
  name: string,
  type?: DataType,
  size?: number
): {
  mainIcon: ReactNode;
  subscript?: string;
  superscript?: string;
} => {
  if (type !== undefined)
    switch (name) {
      default:
        switch (type) {
          case DataType.INT:
            return { mainIcon: 'i', subscript: name };
          case DataType.FLOAT:
            return { mainIcon: 'f', subscript: name };
          case DataType.BOOLEAN:
            return { mainIcon: 'b', subscript: name };
          case DataType.VERSION:
            return { mainIcon: 'v', subscript: name };
        }
    }
  switch (name) {
    case 'extrusion':
      return { mainIcon: <FaArchway size={size} /> };
    case 'footprint':
      return { mainIcon: <GiFootprint size={size} /> };
    case 'heights':
      return { mainIcon: <CiLineHeight size={size} /> };
    case 'Square Extrusion':
      return { mainIcon: <FaRegSquareFull size={size} /> };
    case 'Arc Extrusion':
      return { mainIcon: <PiRainbowLight size={size} /> };
    case 'Ellipse Extrusion':
      return { mainIcon: <FaRegCircle size={size} /> };
    case 'Gothic Arc Extrusion':
      return { mainIcon: <GiBridge size={size} /> };
    case 'Nested Arc Extrusion':
      return { mainIcon: <GiArabicDoor size={size} /> };
    case 'Square Footprint':
      return { mainIcon: <FaVectorSquare size={size} /> };
    case 'Square Grid Footprint':
      return { mainIcon: <BsFillGrid3X3GapFill size={size} /> };
    case 'Triangle Grid Footprint':
      return { mainIcon: <GiPoolTriangle size={size} /> };
    case 'Hex Grid Footprint':
      return { mainIcon: <TbHexagons size={size} /> };
    case 'Cylinder Footprint':
      return { mainIcon: <TbCylinder size={size} /> };
    case 'Malculmius One Footprint':
      return { mainIcon: <TbHexagonalPrism size={size} /> };
    case 'Incremental Method':
      return { mainIcon: <TbSum size={size} /> };
    case 'Sin Method':
      return { mainIcon: <PiWaveSine size={size} /> };
    case 'None Method':
      return { mainIcon: <PiStackPlusFill size={size} /> };
    case 'heightProcessingMethod':
      return { mainIcon: <PiStackPlusFill size={size} /> };
    case 'alpha':
      return { mainIcon: 'α' };
    case 'beta':
      return { mainIcon: 'β' };
    case 'gamma':
      return { mainIcon: 'γ' };
    case 'delta':
      return { mainIcon: 'δ' };
    case 'settings':
      return { mainIcon: <FaCog size={size} /> };
    case 'version':
      return { mainIcon: <MdFormatListNumbered size={size} /> };
    case 'base':
      return { mainIcon: <GiColumnVase size={size} /> };
    case 'shapePostProcessing':
      return { mainIcon: <PiCubeFocusFill size={size} /> };
    default:
      return { mainIcon: name };
  }
};

export const IconRenderer: React.FC<IconRendererProps> = ({ name, type, noName = false, size = 20 }) => {
  const { mainIcon, subscript, superscript } = getIconForKey(name, type, size);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: size * 1.3 }}>
      <div style={{ fontSize: size, alignItems: 'center' }}>{mainIcon}</div>
      {superscript || subscript ? (
        <div style={{ fontSize: size * 0.5, display: 'flex', flexDirection: 'column' }}>
          {superscript ? <div key='superscript'>{superscript}</div> : <div style={{ height: '50%' }} />}
          {subscript ? <div key='subscript'>{subscript}</div> : <div style={{ height: '50%' }} />}
        </div>
      ) : noName ? null : (
        <span style={{ marginLeft: 10 }}>{name}</span>
      )}
    </div>
  );
};
