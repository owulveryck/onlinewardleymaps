/**
 * Hop Distance Calculator
 *
 * Calculates the minimum hop distance from anchor elements to all other components
 * using breadth-first search (BFS). Used for opacity-based visualization where
 * components further from anchors appear more transparent.
 */

interface LinkInput {
    start: string;
    end: string;
}

interface ComponentInput {
    id: string;
    name: string;
    type: string;
}

/**
 * Calculate minimum hop distance from any anchor to each component.
 *
 * @param links - Array of links with start and end component names
 * @param components - Array of components with id, name, and type
 * @returns Map from component name to minimum hop distance
 */
export function calculateHopDistances(links: LinkInput[], components: ComponentInput[]): Map<string, number> {
    const distances = new Map<string, number>();

    // Build adjacency list (unidirectional - follow links from start to end only)
    // This ensures that adding a direct link from anchor to a component only affects
    // that component, not other components that link TO it.
    const adjacencyList = new Map<string, Set<string>>();

    // Initialize all component names in adjacency list
    components.forEach(component => {
        adjacencyList.set(component.name, new Set());
    });

    // Add edges from links (only in forward direction: start -> end)
    links.forEach(link => {
        const startNeighbors = adjacencyList.get(link.start);

        if (startNeighbors) {
            startNeighbors.add(link.end);
        }
    });

    // Find all anchors
    const anchors = components.filter(c => c.type === 'anchor');

    // BFS from all anchors simultaneously (multi-source BFS)
    const queue: Array<{name: string; distance: number}> = [];

    // Initialize: all anchors start at distance 0
    anchors.forEach(anchor => {
        distances.set(anchor.name, 0);
        queue.push({name: anchor.name, distance: 0});
    });

    // BFS traversal
    while (queue.length > 0) {
        const current = queue.shift()!;
        const neighbors = adjacencyList.get(current.name);

        if (neighbors) {
            neighbors.forEach(neighborName => {
                if (!distances.has(neighborName)) {
                    const newDistance = current.distance + 1;
                    distances.set(neighborName, newDistance);
                    queue.push({name: neighborName, distance: newDistance});
                }
            });
        }
    }

    return distances;
}

/**
 * Calculate opacity for a given hop distance using exponential decay.
 *
 * @param distance - Hop distance from nearest anchor
 * @param baseOpacity - Base for exponential decay (default 0.8)
 * @param minOpacity - Minimum opacity floor (default 0.3)
 * @returns Opacity value between minOpacity and 1.0
 */
export function getOpacityForDistance(distance: number | undefined, baseOpacity: number = 0.8, minOpacity: number = 0.3): number {
    // Undefined or unreachable components get full opacity
    if (distance === undefined || !isFinite(distance)) {
        return 1.0;
    }

    // Exponential decay with minimum floor
    return Math.max(minOpacity, Math.pow(baseOpacity, distance));
}

/**
 * Color palette for hop distance visualization (accessible purple→blue→gray gradient).
 * Designed for:
 * - WCAG AA compliance (all colors 3:1+ contrast on white)
 * - Color-blind accessibility (no red-green reliance)
 * - Perceptual clarity (distinct steps)
 */
const HOP_COLORS = [
    '#7C3AED', // 0: Purple (anchor) - 5.0:1 contrast
    '#2563EB', // 1: Blue - 4.6:1 contrast
    '#0891B2', // 2: Cyan - 4.5:1 contrast
    '#475569', // 3: Slate - 7.0:1 contrast
    '#6B7280', // 4: Gray - 5.0:1 contrast
    '#9CA3AF', // 5+: Light Gray - 3.0:1 contrast
];

/**
 * Get color for a given hop distance using a warm-to-cool gradient.
 *
 * @param distance - Hop distance from nearest anchor
 * @returns Hex color string, or undefined if no anchor context
 */
export function getColorForDistance(distance: number | undefined): string | undefined {
    // Undefined or unreachable components return undefined (use default styling)
    if (distance === undefined || !isFinite(distance)) {
        return undefined;
    }

    return HOP_COLORS[Math.min(distance, HOP_COLORS.length - 1)];
}
