import React, {memo} from 'react';
import {TextTheme} from '../../constants/mapstyles';

export interface ComponentTextSymbolProps {
    id: string;
    x?: string;
    y?: string;
    text?: string;
    textTheme: TextTheme;
    fill?: string;
    fontWeight?: string;
    className?: string;
    evolved?: boolean;
    onClick?: (e: React.MouseEvent<SVGTextElement, MouseEvent>) => void;
    note?: string;
    textAnchor?: string;
    setShowTextField?: (value: React.SetStateAction<boolean>) => void;
    opacity?: number; // Opacity based on hop distance from anchor
    hopDistanceColor?: string; // Color based on hop distance from anchor
}

const ComponentTextSymbol: React.FunctionComponent<ComponentTextSymbolProps> = ({
    id,
    x,
    y,
    text,
    evolved,
    className = 'label',
    note,
    textAnchor,
    textTheme,
    onClick,
    setShowTextField = null,
    opacity = 1,
    hopDistanceColor,
}) => {
    const trimText = (id: string, longText: string) =>
        longText
            .trim()
            .split(' ')
            .map((text, i) => (
                <tspan key={'component_text_span_' + id + '_' + i} x={0} dy={i > 0 ? 15 : 0} textAnchor="middle">
                    {text.trim()}
                </tspan>
            ));

    // Use hop distance color for text if provided and not evolved, otherwise use default styling
    const displayFill = evolved ? textTheme.evolvedTextColor : hopDistanceColor || textTheme.textColor;
    const isLong = text && text.length > 14;
    const trimmedText = isLong ? trimText(id, text) : text;
    const transform = isLong ? 'translate(30, 10)' : '';
    const handleDblClick = (e: React.MouseEvent<SVGTextElement, MouseEvent>): void => {
        e.stopPropagation();
        if (setShowTextField) setShowTextField(true);
    };
    return (
        <>
            <text
                id={id}
                data-testid={id}
                fontWeight={textTheme.fontWeight}
                fontSize={textTheme.fontSize || '14px'}
                className={className}
                textAnchor={textAnchor}
                x={x}
                y={y}
                transform={transform}
                fill={displayFill}
                opacity={opacity}
                onClick={onClick ? onClick : () => {}}
                onDoubleClick={handleDblClick}>
                {note || trimmedText}
            </text>
        </>
    );
};
export default memo(ComponentTextSymbol);
