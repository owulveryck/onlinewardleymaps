import React from 'react';

export interface StaticMapBackgroundProps {
    width: number;
    height: number;
    fill: string;
}

const StaticMapBackground: React.FC<StaticMapBackgroundProps> = ({width, height, fill}) => (
    <rect x="0" y="0" width={width} height={height} fill={fill} />
);

export default StaticMapBackground;
