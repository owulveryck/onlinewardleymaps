import React from 'react';
import {UnifiedWardleyMap} from '../../src/types/unified/map';
import {UnifiedComponent} from '../../src/types/unified';
import {MapAnnotation, MapAnnotations} from '../../src/types/base';
import {MapTheme} from '../../src/constants/mapstyles';
import {MapDimensions, Offsets} from '../../src/constants/defaults';
import {MapElements} from '../../src/processing/MapElements';
import {getColorForDistance, getOpacityForDistance} from '../../src/utils/hopDistanceCalculator';

export interface StaticMapContentProps {
    wardleyMap: UnifiedWardleyMap;
    mapElements: MapElements;
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    evolutionOffsets: Offsets;
    annotationsPresentation: {visibility: number; maturity: number};
}

// Helper to convert visibility/maturity to x/y coordinates
const toX = (maturity: number, width: number): number => {
    const leftMargin = 30;
    const rightMargin = 10;
    const usableWidth = width - leftMargin - rightMargin;
    return leftMargin + maturity * usableWidth;
};

const toY = (visibility: number, height: number): number => {
    const topMargin = 40;
    const bottomMargin = 30;
    const usableHeight = height - topMargin - bottomMargin;
    // Invert: high visibility = low Y
    return topMargin + (1 - visibility) * usableHeight;
};

const StaticMapContent: React.FC<StaticMapContentProps> = ({
    wardleyMap,
    mapElements,
    mapDimensions,
    mapStyleDefs,
    evolutionOffsets,
    annotationsPresentation,
}) => {
    const {width, height} = mapDimensions;
    const allComponents = mapElements.getMergedComponents();
    const anchors = wardleyMap.anchors || [];
    const links = wardleyMap.links || [];
    const notes = wardleyMap.notes || [];
    const annotations = wardleyMap.annotations || [];

    // Find component by name
    const findComponent = (name: string): UnifiedComponent | undefined => {
        return allComponents.find(c => c.name === name) || anchors.find(a => a.name === name);
    };

    // Render a component circle
    const renderComponent = (component: UnifiedComponent, index: number) => {
        const x = toX(component.maturity, width);
        const y = toY(component.visibility, height);
        const isEvolved = component.evolved || false;
        const styles = mapStyleDefs.component;

        const labelX = x + (component.label?.x || 5);
        const labelY = y + (component.label?.y || -10);

        // Get hop distance color and opacity
        const hopColor = getColorForDistance(component.hopDistance);
        const opacity = getOpacityForDistance(component.hopDistance);

        // Determine stroke color: evolved uses red, otherwise use hop color or default
        const strokeColor = isEvolved
            ? styles?.evolved || 'red'
            : hopColor || styles?.stroke || 'black';

        // Text stays black for readability (only evolved components use red text)
        const textColor = isEvolved
            ? styles?.evolvedTextColor || 'red'
            : styles?.textColor || 'black';

        return (
            <g key={`component-${index}`} id={`component-${component.id}`} opacity={opacity}>
                {/* Component circle */}
                <circle
                    cx={x}
                    cy={y}
                    r={styles?.radius || 5}
                    fill={isEvolved ? styles?.evolvedFill || 'white' : styles?.fill || 'white'}
                    stroke={strokeColor}
                    strokeWidth={styles?.strokeWidth || 1}
                />
                {/* Component label */}
                <text
                    x={labelX}
                    y={labelY}
                    fontSize={styles?.fontSize || '12px'}
                    fill={textColor}>
                    {component.name}
                </text>
            </g>
        );
    };

    // Render an anchor
    const renderAnchor = (anchor: UnifiedComponent, index: number) => {
        const x = toX(anchor.maturity, width);
        const y = toY(anchor.visibility, height);
        const styles = mapStyleDefs.anchor;

        return (
            <g key={`anchor-${index}`} id={`anchor-${anchor.id}`}>
                {/* Anchor circle with glow */}
                <circle cx={x} cy={y} r={8} fill="#F59E0B" stroke="#D97706" strokeWidth={2} filter="url(#anchorGlow)" />
                {/* Anchor label */}
                <text
                    x={x + (anchor.label?.x || 10)}
                    y={y + (anchor.label?.y || -10)}
                    fontSize={styles?.fontSize || '14px'}
                    fontWeight="bold"
                    fill={mapStyleDefs.stroke}>
                    {anchor.name}
                </text>
            </g>
        );
    };

    // Render a link
    const renderLink = (link: {start: string; end: string}, index: number) => {
        const startComponent = findComponent(link.start);
        const endComponent = findComponent(link.end);

        if (!startComponent || !endComponent) return null;

        const x1 = toX(startComponent.maturity, width);
        const y1 = toY(startComponent.visibility, height);
        const x2 = toX(endComponent.maturity, width);
        const y2 = toY(endComponent.visibility, height);

        const isEvolved = startComponent.evolved || endComponent.evolved;
        const linkStyles = mapStyleDefs.link;

        // Use the minimum hop distance of the two connected components for link color
        const startDistance = startComponent.hopDistance;
        const endDistance = endComponent.hopDistance;
        const linkDistance =
            startDistance !== undefined && endDistance !== undefined
                ? Math.min(startDistance, endDistance)
                : startDistance ?? endDistance;
        const hopColor = getColorForDistance(linkDistance);
        const opacity = getOpacityForDistance(linkDistance);

        const strokeColor = isEvolved
            ? linkStyles?.evolvedStroke || 'red'
            : hopColor || linkStyles?.stroke || 'grey';

        return (
            <line
                key={`link-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={linkStyles?.strokeWidth || 1}
                opacity={opacity}
            />
        );
    };

    // Render evolving links (from evolving to evolved)
    const renderEvolvingLinks = () => {
        const evolvingComponents = mapElements.getEvolvingComponents();
        const evolvedComponents = mapElements.getEvolvedComponents();

        return evolvingComponents.map((evolving, index) => {
            const evolved = evolvedComponents.find(e => e.name === evolving.name);
            if (!evolved) return null;

            const x1 = toX(evolving.maturity, width);
            const y1 = toY(evolving.visibility, height);
            const x2 = toX(evolved.evolveMaturity || evolved.maturity, width);
            const y2 = y1; // Same visibility

            return (
                <line
                    key={`evolve-${index}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={mapStyleDefs.link?.evolvedStroke || 'red'}
                    strokeWidth={mapStyleDefs.link?.strokeWidth || 1}
                    strokeDasharray="5,5"
                    markerEnd="url(#arrow)"
                />
            );
        });
    };

    // Render a note
    const renderNote = (note: any, index: number) => {
        const x = toX(note.maturity || 0.5, width);
        const y = toY(note.visibility || 0.5, height);
        const noteStyles = mapStyleDefs.note;

        return (
            <text
                key={`note-${index}`}
                x={x}
                y={y}
                fontSize={noteStyles?.fontSize || '12px'}
                fontWeight={noteStyles?.fontWeight || 'bold'}
                fill={noteStyles?.textColor || 'black'}>
                {note.text || ''}
            </text>
        );
    };

    // Render pipeline components
    const renderPipelines = () => {
        const pipelines = wardleyMap.pipelines || [];

        return pipelines.map((pipeline, index) => {
            if (pipeline.hidden) return null;

            const y = toY(pipeline.visibility, height);
            const x1 = toX(pipeline.maturity1 || 0.2, width);
            const x2 = toX(pipeline.maturity2 || 0.8, width);

            return (
                <g key={`pipeline-${index}`}>
                    <rect
                        x={x1}
                        y={y - 15}
                        width={x2 - x1}
                        height={30}
                        fill="none"
                        stroke={mapStyleDefs.component?.stroke || 'black'}
                        strokeWidth={1}
                        rx={5}
                        ry={5}
                    />
                    <text x={x1 + 5} y={y - 20} fontSize="12px" fill={mapStyleDefs.stroke}>
                        {pipeline.name}
                    </text>
                </g>
            );
        });
    };

    return (
        <g id="mapContent">
            {/* Links layer */}
            <g id="links">{links.map((link, i) => renderLink(link, i))}</g>

            {/* Evolving links layer */}
            <g id="evolvingLinks">{renderEvolvingLinks()}</g>

            {/* Pipelines layer */}
            <g id="pipelines">{renderPipelines()}</g>

            {/* Anchors layer */}
            <g id="anchors">{anchors.map((anchor, i) => renderAnchor(anchor, i))}</g>

            {/* Components layer */}
            <g id="components">
                {allComponents
                    .filter(c => c.type !== 'anchor')
                    .map((component, i) => renderComponent(component, i))}
            </g>

            {/* Notes layer */}
            <g id="notes">{notes.map((note, i) => renderNote(note, i))}</g>

            {/* Annotation circles layer */}
            <g id="annotations">
                {annotations.map((annotation: MapAnnotations, i: number) => {
                    const positions = annotation.occurances || [];
                    return positions.map((pos: MapAnnotation, j: number) => {
                        // MapAnnotation has visibility and maturity properties
                        const x = toX(pos.maturity, width);
                        const y = toY(pos.visibility, height);
                        return (
                            <g key={`annotation-${i}-${j}`}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={12}
                                    fill={mapStyleDefs.annotation?.fill || 'white'}
                                    stroke={mapStyleDefs.annotation?.stroke || '#595959'}
                                    strokeWidth={2}
                                />
                                <text x={x} y={y + 4} textAnchor="middle" fontSize="11px" fontWeight="bold">
                                    {annotation.number}
                                </text>
                            </g>
                        );
                    });
                })}
            </g>

            {/* Annotation text box (legend) */}
            {annotations.length > 0 && (
                <g id="annotationBox" transform={`translate(${toX(annotationsPresentation.maturity, width)}, ${toY(annotationsPresentation.visibility, height)})`}>
                    <rect
                        x={0}
                        y={0}
                        width={200}
                        height={annotations.length * 20 + 10}
                        fill={mapStyleDefs.annotation?.boxFill || 'white'}
                        stroke={mapStyleDefs.annotation?.boxStroke || '#595959'}
                        strokeWidth={1}
                        rx={4}
                        ry={4}
                    />
                    <text x={5} y={5} fontSize="12px" fill={mapStyleDefs.annotation?.boxTextColour || 'black'}>
                        {annotations.map((annotation: MapAnnotations, i: number) => (
                            <tspan key={`annotation-text-${i}`} x={5} dy={18}>
                                {annotation.number}. {annotation.text}
                            </tspan>
                        ))}
                    </text>
                </g>
            )}
        </g>
    );
};

export default StaticMapContent;
