import React, {memo, MouseEvent} from 'react';
import {MapComponentTheme} from '../../constants/mapstyles';
import {BaseMapElement, EvolvableElement, LabelableElement} from '../../types/unified';

interface ModernComponentSymbolProps {
    onClick?: (e: MouseEvent<SVGElement>) => void;
    id?: string;
    cx?: string;
    cy?: string;
    styles: MapComponentTheme;
    component?: BaseMapElement & EvolvableElement & LabelableElement;
    evolved?: boolean; // Support for evolved prop used in icons.tsx
    opacity?: number; // Opacity based on hop distance from anchor
    hopDistanceColor?: string; // Color based on hop distance from anchor
}

const ComponentSymbol: React.FunctionComponent<ModernComponentSymbolProps> = ({
    id,
    cx,
    cy,
    component,
    onClick,
    styles,
    opacity = 1,
    hopDistanceColor,
}) => {
    const evolved = component?.evolved || false;
    const fill = evolved ? styles.evolvedFill : styles.fill;
    // Use hop distance color for stroke if provided and not evolved, otherwise use default styling
    const stroke = evolved ? styles.evolved : hopDistanceColor || styles.stroke;

    return (
        <circle
            id={id}
            cx={cx}
            cy={cy}
            strokeWidth={styles.strokeWidth}
            r={styles.radius}
            stroke={stroke}
            fill={fill}
            onClick={onClick}
            opacity={opacity}
        />
    );
};

export default memo(ComponentSymbol);
