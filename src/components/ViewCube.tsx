import React from 'react';
import { FaLocationArrow } from 'react-icons/fa';

export enum ViewCubeSide {
  NORTHEAST = 'NE',
  NORTHWEST = 'NW',
  SOUTHEAST = 'SE',
  SOUTHWEST = 'SW',
}

export interface CameraParameters {
  alfa: number;
  beta: number;
  radius: number;
  target: { x: number; y: number; z: number };
}

interface IViewCubeProps {
  size?: number;
  onSideChange: (cameraParameters: CameraParameters | undefined) => void;
}

export const ViewCube: React.FC<IViewCubeProps> = ({ onSideChange, size = 20 }) => {
  const setSide = (side: ViewCubeSide) => {
    const target = { x: 0, y: 8, z: 0 };
    const radius = 40;
    const beta = 1.2;

    switch (side) {
      case ViewCubeSide.NORTHEAST:
        onSideChange({ alfa: 0.25 * Math.PI, beta, radius, target });
        break;
      case ViewCubeSide.NORTHWEST:
        onSideChange({ alfa: 0.75 * Math.PI, beta, radius, target });
        break;
      case ViewCubeSide.SOUTHEAST:
        onSideChange({ alfa: 1.75 * Math.PI, beta, radius, target });
        break;
      case ViewCubeSide.SOUTHWEST:
        onSideChange({ alfa: 1.25 * Math.PI, beta, radius, target });
        break;
    }
  };

  return (
    <div style={{ position: 'absolute', left: size * 1.5, bottom: size * 1.2, width: size * 2.25, height: size * 2.25 }}>
      <Arrow size={size} setSide={setSide} side={ViewCubeSide.NORTHEAST} />
      <Arrow size={size} setSide={setSide} side={ViewCubeSide.NORTHWEST} />
      <Arrow size={size} setSide={setSide} side={ViewCubeSide.SOUTHEAST} />
      <Arrow size={size} setSide={setSide} side={ViewCubeSide.SOUTHWEST} />
    </div>
  );
};

interface IArrowProps {
  size?: number;
  setSide: (side: ViewCubeSide) => void;
  side: ViewCubeSide;
}

const getAngleForSide = (side: ViewCubeSide) => {
  switch (side) {
    case ViewCubeSide.NORTHEAST:
      return 0;
    case ViewCubeSide.SOUTHEAST:
      return 0.25;
    case ViewCubeSide.SOUTHWEST:
      return 0.5;
    case ViewCubeSide.NORTHWEST:
      return 0.75;
  }
};

const getStyleAlignmentForSide = (side: ViewCubeSide) => {
  switch (side) {
    case ViewCubeSide.NORTHEAST:
      return { arrowPosition: { right: 0, top: 0 }, arrowTransform: { transform: `rotate(${getAngleForSide(side)}turn)` }, text: { left: 0, bottom: 0 } };
    case ViewCubeSide.NORTHWEST:
      return { arrowPosition: { left: 0, top: 0 }, arrowTransform: { transform: `rotate(${getAngleForSide(side)}turn)` }, text: { right: 0, bottom: 0 } };
    case ViewCubeSide.SOUTHWEST:
      return { arrowPosition: { left: 0, bottom: 0 }, arrowTransform: { transform: `rotate(${getAngleForSide(side)}turn)` }, text: { right: 0, top: 0 } };
    case ViewCubeSide.SOUTHEAST:
      return { arrowPosition: { right: 0, bottom: 0 }, arrowTransform: { transform: `rotate(${getAngleForSide(side)}turn)` }, text: { left: 0, top: 0 } };
  }
};

export const Arrow: React.FC<IArrowProps> = ({ setSide, side, size = 20 }) => {
  const color = 'blue';
  const { arrowPosition, arrowTransform, text } = getStyleAlignmentForSide(side);

  return (
    <div style={{ position: 'absolute', ...arrowPosition, cursor: 'pointer' }} onClick={() => setSide(side)}>
      <FaLocationArrow size={size} fill={color} style={{ position: 'absolute', ...arrowTransform, ...arrowPosition }} />
      <span style={{ position: 'absolute', textAnchor: 'middle', verticalAlign: 'middle', color, ...text }}>{side}</span>
    </div>
  );
};
