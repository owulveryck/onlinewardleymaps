import React from 'react';
import {MapTheme} from '../../src/constants/mapstyles';
import {MapDimensions, EvolutionStages} from '../../src/constants/defaults';

export interface StaticMapGridProps {
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    evolutionStages: EvolutionStages;
}

const StaticMapGrid: React.FC<StaticMapGridProps> = ({mapDimensions, mapStyleDefs, evolutionStages}) => {
    const {width, height} = mapDimensions;
    const strokeColor = mapStyleDefs.evolutionSeparationStroke || '#b8b8b8';
    const textColor = mapStyleDefs.mapGridTextColor || mapStyleDefs.stroke || 'black';
    const fontSize = mapStyleDefs.fontSize || '13px';

    // Evolution axis positions (25% intervals)
    const evolutionPositions = [0, 0.25, 0.5, 0.75, 1].map(p => p * width);

    // Y-axis labels
    const yAxisTop = 40; // Leave room for title
    const yAxisBottom = height - 30;
    const usableHeight = yAxisBottom - yAxisTop;

    return (
        <g id="grid">
            {/* Y-axis (Value Chain) */}
            <text
                x={15}
                y={yAxisTop + usableHeight / 2}
                fontSize={fontSize}
                fill={textColor}
                transform={`rotate(-90, 15, ${yAxisTop + usableHeight / 2})`}
                textAnchor="middle">
                Value Chain
            </text>

            {/* Visible line on left */}
            <line x1={30} y1={yAxisTop} x2={30} y2={yAxisBottom} stroke={strokeColor} strokeWidth={1} />

            {/* Arrow on left */}
            <polygon points={`25,${yAxisTop + 5} 30,${yAxisTop - 5} 35,${yAxisTop + 5}`} fill={strokeColor} />

            {/* Invisible text */}
            <text x={35} y={yAxisTop + 15} fontSize="10px" fill={textColor}>
                Invisible
            </text>

            {/* Visible text */}
            <text x={35} y={yAxisBottom - 5} fontSize="10px" fill={textColor}>
                Visible
            </text>

            {/* X-axis (Evolution) */}
            <line x1={30} y1={yAxisBottom} x2={width - 10} y2={yAxisBottom} stroke={strokeColor} strokeWidth={1} />

            {/* Arrow on right */}
            <polygon
                points={`${width - 15},${yAxisBottom - 5} ${width - 5},${yAxisBottom} ${width - 15},${yAxisBottom + 5}`}
                fill={strokeColor}
            />

            {/* Evolution stage separators */}
            {evolutionPositions.slice(1, -1).map((x, i) => (
                <line
                    key={i}
                    x1={30 + x * ((width - 40) / width)}
                    y1={yAxisTop}
                    x2={30 + x * ((width - 40) / width)}
                    y2={yAxisBottom}
                    stroke={strokeColor}
                    strokeWidth={1}
                    strokeDasharray="5,5"
                />
            ))}

            {/* Evolution stage labels */}
            <g id="evolutionLabels" fontSize="11px" fill={textColor}>
                <text x={30 + ((width - 40) * 0.125)} y={yAxisBottom + 15} textAnchor="middle">
                    {evolutionStages.genesis.l1}
                </text>
                <text x={30 + ((width - 40) * 0.375)} y={yAxisBottom + 15} textAnchor="middle">
                    {evolutionStages.custom.l1}
                </text>
                <text x={30 + ((width - 40) * 0.625)} y={yAxisBottom + 15} textAnchor="middle">
                    {evolutionStages.product.l1}
                </text>
                <text x={30 + ((width - 40) * 0.875)} y={yAxisBottom + 15} textAnchor="middle">
                    {evolutionStages.commodity.l1}
                </text>
            </g>

            {/* Evolution label */}
            <text x={width / 2} y={height - 5} fontSize={fontSize} fill={textColor} textAnchor="middle">
                Evolution
            </text>
        </g>
    );
};

export default StaticMapGrid;
