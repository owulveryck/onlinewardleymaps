import React from 'react';
import {MapTheme} from '../../src/constants/mapstyles';

export interface StaticMapGraphicsProps {
    mapStyleDefs: MapTheme;
}

const StaticMapGraphics: React.FC<StaticMapGraphicsProps> = ({mapStyleDefs}) => (
    <defs>
        {/* Gradient for wardley style background */}
        <linearGradient
            gradientUnits="objectBoundingBox"
            id="wardleyGradient"
            spreadMethod="pad"
            x1="0%"
            x2="100%"
            y1="0%"
            y2="0%">
            <stop offset="0%" style={{stopColor: 'rgb(196, 196, 196)', stopOpacity: 1}} />
            <stop offset="0.3" style={{stopColor: 'white', stopOpacity: 1}} />
            <stop offset="0.7" style={{stopColor: 'white'}} />
            <stop offset={1} style={{stopColor: 'rgb(196, 196, 196)'}} />
        </linearGradient>

        {/* Gradient for octo style background - very subtle */}
        <linearGradient
            gradientUnits="objectBoundingBox"
            id="octoGradient"
            spreadMethod="pad"
            x1="0%"
            x2="100%"
            y1="0%"
            y2="0%">
            <stop offset="0%" style={{stopColor: '#E7E9EE', stopOpacity: 1}} />
            <stop offset="0.3" style={{stopColor: 'white', stopOpacity: 1}} />
            <stop offset="0.7" style={{stopColor: 'white', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#E7E9EE', stopOpacity: 1}} />
        </linearGradient>

        {/* Arrow gradient */}
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 1}} />
            <stop offset="40%" style={{stopColor: '#808080', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#808080', stopOpacity: 1}} />
        </linearGradient>

        {/* Accelerator gradient */}
        <linearGradient spreadMethod="pad" id="accelGradient" x1="0%" y1="64%" x2="76%" y2="0%">
            <stop offset="0%" style={{stopColor: 'white', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#8c8995', stopOpacity: 1}} />
        </linearGradient>

        {/* Ecosystem stripes pattern */}
        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M 3,-1 l 2,2 M 0,0 l 4,4 M -1,3 l 2,2" stroke="grey" strokeWidth="1" opacity=".5" />
        </pattern>

        {/* Arrow markers */}
        <marker
            id="arrow"
            markerWidth="12"
            markerHeight="12"
            refX="15"
            refY="0"
            viewBox="0 -5 10 10"
            orient="0">
            <path d="M0,-5L10,0L0,5" fill={mapStyleDefs.link?.evolvedStroke || 'red'} />
        </marker>

        <marker
            id="graphArrow"
            markerWidth={12 / (mapStyleDefs.strokeWidth ?? 1)}
            markerHeight={12 / (mapStyleDefs.strokeWidth ?? 1)}
            refX="9"
            refY="0"
            viewBox="0 -5 10 10"
            orient="0">
            <path d="M0,-5L10,0L0,5" fill={mapStyleDefs.stroke} />
        </marker>

        <marker
            id="pipelineArrow"
            markerWidth={mapStyleDefs.pipelineArrowWidth || 5}
            markerHeight={mapStyleDefs.pipelineArrowHeight || 5}
            refX="9"
            refY="0"
            viewBox="0 -5 10 10"
            orient="0">
            <path d="M0,-5L10,0L0,5" fill={mapStyleDefs.pipelineArrowStroke} />
        </marker>

        {/* Anchor glow filter */}
        <filter id="anchorGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#7C3AED" floodOpacity="0.6" />
        </filter>
    </defs>
);

export default StaticMapGraphics;
