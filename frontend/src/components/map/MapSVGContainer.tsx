import React from 'react';
import {UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
import {MapCanvasDimensions, MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';

interface MapSVGContainerProps {
    viewerRef: React.RefObject<any>;
    tool: any; // React SVG Pan Zoom tool type
    mapCanvasDimensions: MapCanvasDimensions;
    mapDimensions: MapDimensions;
    allowMapZoomMouseWheel: boolean;
    showMiniMap: boolean;
    mapStyleDefs: MapTheme;
    onDoubleClick: (event: any) => void;
    onZoom: (value: any) => void;
    children: React.ReactNode;
}

export const MapSVGContainer: React.FC<MapSVGContainerProps> = ({
    viewerRef,
    tool,
    mapCanvasDimensions,
    mapDimensions,
    allowMapZoomMouseWheel,
    showMiniMap,
    mapStyleDefs,
    onDoubleClick,
    onZoom,
    children,
}) => {
    return (
        <UncontrolledReactSVGPanZoom
            ref={viewerRef}
            SVGBackground="white"
            tool={tool}
            width={mapCanvasDimensions.width + 90}
            height={mapCanvasDimensions.height + 30}
            detectAutoPan={false}
            detectWheel={allowMapZoomMouseWheel}
            miniatureProps={{
                position: showMiniMap ? 'right' : 'none',
                background: '#eee',
                width: 100,
                height: 80,
            }}
            toolbarProps={{position: 'none'}}
            onDoubleClick={onDoubleClick}
            onZoom={onZoom}
            style={{
                userSelect: 'none',
                fontFamily: mapStyleDefs.fontFamily,
            }}>
            <svg
                className={mapStyleDefs.className}
                style={{userSelect: 'none'}}
                width={mapDimensions.width + 2}
                height={mapDimensions.height + 4}
                id="svgMap"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink">
                {children}
            </svg>
        </UncontrolledReactSVGPanZoom>
    );
};

export default MapSVGContainer;
