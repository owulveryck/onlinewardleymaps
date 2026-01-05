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
 * Color palette for hop distance visualization (warm to cool gradient).
 * Creates a heatmap effect where components close to anchor are "hot" (warm colors)
 * and distant ones are "cool" (gray-blue).
 */
const HOP_COLORS = [
    '#F59E0B', // 0: Gold (anchor)
    '#EA580C', // 1: Orange
    '#D97706', // 2: Amber
    '#CA8A04', // 3: Yellow
    '#65A30D', // 4: Lime
    '#0D9488', // 5: Teal
    '#6B7280', // 6+: Gray
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
