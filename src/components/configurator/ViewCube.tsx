import React from 'react';
import { GiBeastEye } from 'react-icons/gi';
import { PiEyes } from 'react-icons/pi';

export enum ViewCubeSide {
  NORTHEAST = 'NE',
  NORTHWEST = 'NW',
  SOUTHEAST = 'SE',
  SOUTHWEST = 'SW',
}

export enum ViewCubePosition {
  LeftBottomCorner = 'LeftCorner',
  AllCorners = 'AllCorners',
}

export interface CameraParameters {
  alfa: number;
  beta: number;
  radius: number;
  target: { x: number; y: number; z: number };
}

interface IViewCubeProps {
  viewCubePosition?: ViewCubePosition;
  size?: number;
  onSideChange: (cameraParameters: CameraParameters | undefined) => void;
}

export const ViewCube: React.FC<IViewCubeProps> = ({ onSideChange, viewCubePosition = ViewCubePosition.AllCorners, size = 15 }) => {
  const setSide = (side: ViewCubeSide) => {
    const target = { x: 0, y: 8, z: 0 };
    const radius = 80;
    const beta = 1.2;

    switch (side) {
      case ViewCubeSide.NORTHEAST:
        return onSideChange({ alfa: 0.25 * Math.PI, beta, radius, target });
      case ViewCubeSide.NORTHWEST:
        return onSideChange({ alfa: 0.75 * Math.PI, beta, radius, target });
      case ViewCubeSide.SOUTHEAST:
        return onSideChange({ alfa: 1.75 * Math.PI, beta, radius, target });
      case ViewCubeSide.SOUTHWEST:
        return onSideChange({ alfa: 1.25 * Math.PI, beta, radius, target });
    }
  };

  const position: React.CSSProperties =
    viewCubePosition === ViewCubePosition.LeftBottomCorner
      ? { position: 'absolute', left: size * (0.5 + 2.3), bottom: size * (0.5 + 2), width: 0, height: 0 }
      : {};

  return (
    <div style={position}>
      <Arrow size={size} setSide={setSide} side={ViewCubeSide.NORTHEAST} viewCubePosition={viewCubePosition} />
      <Arrow size={size} setSide={setSide} side={ViewCubeSide.NORTHWEST} viewCubePosition={viewCubePosition} />
      <Arrow size={size} setSide={setSide} side={ViewCubeSide.SOUTHEAST} viewCubePosition={viewCubePosition} />
      <Arrow size={size} setSide={setSide} side={ViewCubeSide.SOUTHWEST} viewCubePosition={viewCubePosition} />
    </div>
  );
};

interface IArrowProps {
  size: number;
  setSide: (side: ViewCubeSide) => void;
  side: ViewCubeSide;
  viewCubePosition: ViewCubePosition;
}

const getAngleForSide = (side: ViewCubeSide, viewCubePosition: ViewCubePosition) => {
  switch (side) {
    case ViewCubeSide.NORTHEAST:
      return (viewCubePosition === ViewCubePosition.LeftBottomCorner ? -0.125 : 0.375) + 0.5;
    case ViewCubeSide.SOUTHEAST:
      return (viewCubePosition === ViewCubePosition.LeftBottomCorner ? -0.125 : 0.375) + 0.75;
    case ViewCubeSide.SOUTHWEST:
      return (viewCubePosition === ViewCubePosition.LeftBottomCorner ? -0.125 : 0.375) + 1;
    case ViewCubeSide.NORTHWEST:
      return (viewCubePosition === ViewCubePosition.LeftBottomCorner ? -0.125 : 0.375) + 1.25;
  }
};

const getStyleAlignmentForSide = (side: ViewCubeSide, size: number, viewCubePosition: ViewCubePosition) => {
  const arrowInset = (viewCubePosition === ViewCubePosition.LeftBottomCorner ? 0.75 : 0.125) * size;
  const textInset = (viewCubePosition === ViewCubePosition.LeftBottomCorner ? 1.1 : -0.125) * size;

  switch (side) {
    case ViewCubeSide.NORTHEAST:
      return {
        arrowPosition: { right: arrowInset, top: arrowInset },
        arrowTransform: { transform: `rotate(${getAngleForSide(side, viewCubePosition)}turn)` },
        text: { left: textInset, bottom: textInset },
      };
    case ViewCubeSide.NORTHWEST:
      return {
        arrowPosition: { left: arrowInset, top: arrowInset },
        arrowTransform: { transform: `rotate(${getAngleForSide(side, viewCubePosition)}turn)` },
        text: { right: textInset, bottom: textInset },
      };
    case ViewCubeSide.SOUTHWEST:
      return {
        arrowPosition: { left: arrowInset, bottom: arrowInset },
        arrowTransform: { transform: `rotate(${getAngleForSide(side, viewCubePosition)}turn)` },
        text: { right: textInset, top: textInset },
      };
    case ViewCubeSide.SOUTHEAST:
      return {
        arrowPosition: { right: arrowInset, bottom: arrowInset },
        arrowTransform: { transform: `rotate(${getAngleForSide(side, viewCubePosition)}turn)` },
        text: { left: textInset, top: textInset },
      };
  }
};

export const Arrow: React.FC<IArrowProps> = ({ setSide, side, size, viewCubePosition }) => {
  const color = 'blue';
  const { arrowPosition, arrowTransform, text } = getStyleAlignmentForSide(side, size, viewCubePosition);

  const height = size * (1.8 + (viewCubePosition === ViewCubePosition.AllCorners ? 0.25 : 0));
  const width = size * (2.1 + (viewCubePosition === ViewCubePosition.AllCorners ? 0.25 : 0));

  return (
    <div style={{ position: 'absolute', ...arrowPosition, cursor: 'pointer', height, width }} onClick={() => setSide(side)}>
      <PiEyes size={size * 1.2} fill={color} style={{ position: 'absolute', ...arrowTransform, ...arrowPosition }} />
      <span style={{ position: 'absolute', textAnchor: 'middle', verticalAlign: 'middle', color, ...text, fontSize: size * 0.9 }}>{side}</span>
    </div>
  );
};
