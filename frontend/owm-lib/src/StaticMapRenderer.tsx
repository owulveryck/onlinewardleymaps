import React from 'react';
import {UnifiedWardleyMap} from '../../src/types/unified/map';
import {MapTheme, Plain, Wardley, Colour, Dark, Handwritten, Octo} from '../../src/constants/mapstyles';
import {MapDimensions, EvolutionStages, EvoOffsets} from '../../src/constants/defaults';
import {MapElements} from '../../src/processing/MapElements';
import StaticMapContent from './StaticMapContent';
import StaticMapGraphics from './StaticMapGraphics';
import StaticMapGrid from './StaticMapGrid';
import StaticMapBackground from './StaticMapBackground';

export interface StaticMapRendererProps {
    wardleyMap: UnifiedWardleyMap;
    width?: number;
    height?: number;
    theme?: 'wardley' | 'plain' | 'colour' | 'dark' | 'handwritten' | 'octo';
}

const themeMap: Record<string, MapTheme> = {
    wardley: Wardley,
    plain: Plain,
    colour: Colour,
    dark: Dark,
    handwritten: Handwritten,
    octo: Octo,
};

export const StaticMapRenderer: React.FC<StaticMapRendererProps> = ({
    wardleyMap,
    width = 500,
    height = 600,
    theme = 'wardley',
}) => {
    // Determine the style from presentation or use default
    const presentationStyle = wardleyMap.presentation?.style || theme;
    const mapStyleDefs = themeMap[presentationStyle] || themeMap[theme] || Wardley;

    const mapDimensions: MapDimensions = {width, height};

    const evolutionStages: EvolutionStages = {
        genesis: {l1: 'Genesis', l2: ''},
        custom: {l1: 'Custom Built', l2: ''},
        product: {l1: 'Product', l2: '(+rental)'},
        commodity: {l1: 'Commodity', l2: '(+utility)'},
    };

    const evolutionOffsets = EvoOffsets;

    // Process map elements
    const mapElements = new MapElements(wardleyMap);

    // Calculate annotations presentation position
    const annotationsPresentation = wardleyMap.presentation?.annotations || {
        visibility: 0.72,
        maturity: 0.03,
    };

    // Get background fill based on theme
    const backgroundFill =
        mapStyleDefs.className === 'wardley'
            ? 'url(#wardleyGradient)'
            : mapStyleDefs.className === 'dark'
              ? '#353347'
              : mapStyleDefs.className === 'octo'
                ? 'url(#octoGradient)'
                : mapStyleDefs.containerBackground || 'white';

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{fontFamily: mapStyleDefs.fontFamily, display: 'block'}}>
            <StaticMapGraphics mapStyleDefs={mapStyleDefs} />
            <StaticMapBackground width={width} height={height} fill={backgroundFill} />
            <StaticMapGrid
                mapDimensions={mapDimensions}
                mapStyleDefs={mapStyleDefs}
                evolutionStages={evolutionStages}
            />
            <StaticMapContent
                wardleyMap={wardleyMap}
                mapElements={mapElements}
                mapDimensions={mapDimensions}
                mapStyleDefs={mapStyleDefs}
                evolutionOffsets={evolutionOffsets}
                annotationsPresentation={annotationsPresentation}
            />

            {/* Title */}
            {wardleyMap.title && (
                <text
                    x={10}
                    y={25}
                    fontSize="16px"
                    fontWeight="bold"
                    fill={mapStyleDefs.stroke}>
                    {wardleyMap.title}
                </text>
            )}
        </svg>
    );
};

export default StaticMapRenderer;
