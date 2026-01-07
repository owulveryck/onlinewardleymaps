import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {UnifiedConverter} from '../../src/conversion/UnifiedConverter';
import {UnifiedWardleyMap} from '../../src/types/unified/map';
import {StaticMapRenderer} from './StaticMapRenderer';

/**
 * Configuration options for OWM rendering
 */
export interface OWMConfig {
    /** Auto-render on DOMContentLoaded. Default: true */
    startOnLoad?: boolean;
    /** CSS selector for elements to render. Default: 'pre.owm' */
    selector?: string;
    /** Map theme. Default: 'wardley' */
    theme?: 'wardley' | 'plain' | 'colour' | 'dark' | 'handwritten';
    /** Map viewBox width. Default: 1280 (16:9) */
    width?: number;
    /** Map viewBox height. Default: 720 (16:9) */
    height?: number;
}

/**
 * Default configuration (16:9 aspect ratio)
 */
const defaultConfig: Required<OWMConfig> = {
    startOnLoad: true,
    selector: 'pre.owm',
    theme: 'wardley',
    width: 1280,
    height: 720,
};

/**
 * Feature switches for the parser (all features disabled for static rendering)
 */
const featureSwitches = {
    enableDashboard: false,
    enableNewPipelines: true,
    enableLinkContext: false,
    enableAccelerators: false,
    enableDoubleClickRename: false,
    showToggleFullscreen: false,
    showMapToolbar: false,
    showMiniMap: false,
    allowMapZoomMouseWheel: false,
    enableModernComponents: true,
};

/**
 * Create a UnifiedConverter instance
 */
const createConverter = () => new UnifiedConverter(featureSwitches);

/**
 * Parse OWM text into a UnifiedWardleyMap object
 */
function parse(text: string): UnifiedWardleyMap {
    const converter = createConverter();
    return converter.parse(text);
}

/**
 * Render a Wardley Map to SVG string
 */
function renderToString(text: string, config?: Partial<OWMConfig>): string {
    const mergedConfig = {...defaultConfig, ...config};
    const wardleyMap = parse(text);

    const element = React.createElement(StaticMapRenderer, {
        wardleyMap,
        width: mergedConfig.width,
        height: mergedConfig.height,
        theme: mergedConfig.theme,
    });

    return ReactDOMServer.renderToStaticMarkup(element);
}

/**
 * Render a Wardley Map into a DOM element
 */
function render(element: HTMLElement, text: string, config?: Partial<OWMConfig>): void {
    const svgString = renderToString(text, config);

    // Create a wrapper div with owm-container class
    const container = document.createElement('div');
    container.className = 'owm-container';
    container.innerHTML = svgString;

    // Replace the element with the container
    if (element.parentNode) {
        element.parentNode.replaceChild(container, element);
    } else {
        element.innerHTML = svgString;
    }
}

/**
 * Find and render all OWM diagrams on the page
 */
function renderAll(config?: Partial<OWMConfig>): void {
    const mergedConfig = {...defaultConfig, ...config};
    const elements = document.querySelectorAll<HTMLElement>(mergedConfig.selector);

    elements.forEach(element => {
        const text = element.textContent || '';
        if (text.trim()) {
            render(element, text, config);
        }
    });
}

/**
 * Initialize OWM rendering
 */
function initialize(config?: Partial<OWMConfig>): void {
    const mergedConfig = {...defaultConfig, ...config};

    if (mergedConfig.startOnLoad) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => renderAll(config));
        } else {
            // DOM is already ready
            renderAll(config);
        }
    }
}

/**
 * OWM library version
 */
const version = '1.0.0';

/**
 * Main OWM object (mermaid-like API)
 */
const owm = {
    initialize,
    render,
    renderToString,
    renderAll,
    parse,
    version,
};

export default owm;

// Named exports for ESM usage
export {initialize, render, renderToString, renderAll, parse, version};
