/**
 * Configuration settings for the Cosmograph visualization
 */

/**
 * Default configuration for the Cosmograph instance
 * @returns {Object} - Default configuration object
 */
export function getDefaultConfig() {
    return {
        // Node styling with improved visual differentiation and significantly reduced density
        nodeSize: node => {
            // Size nodes based on their connections 
            const outDegree = node.menteeCount || 0; // Mentees count
            const inDegree = node.mentorCount || 0; // Mentors count

            // Smaller base size and reduced connection multiplier
            return 1.5 + Math.sqrt(outDegree + inDegree) * 0.3;
        },
        nodeColor: node => {
            // Enhanced color scheme for better contrast
            if (node.isByte && node.isBit) return '#9c27b0'; // Both mentor and mentee (purple)
            if (node.isByte) return '#4dabf5'; // Mentor only (brighter blue)
            return '#ffa726'; // Mentee only (brighter orange)
        },
        nodeOpacity: 0.85, // Slight transparency for better overlapping

        // Only show labels for nodes with significant connections
        nodeLabel: node => {
            // Only show labels for nodes with multiple connections
            const totalConnections = (node.menteeCount || 0) + (node.mentorCount || 0);
            if (totalConnections < 6) return ''; // Higher threshold to reduce label clutter

            // Extract name from format like "name(username)"
            const match = node.id.match(/^([^(]+)/);
            return match ? match[1].trim() : node.id;
        },
        nodeLabelMaxLength: 15, // Limit label length
        showLabelsAtZoom: 0.75, // Only show labels when more zoomed in
        nodeLabelColor: '#ffffff', // White text for better contrast
        hoverHighlightConnections: true, // Highlight connections on hover

        // Link styling with improved visibility
        linkWidth: 0.4, // Thinner links to reduce visual clutter
        linkArrows: true, // Show arrows to indicate direction
        linkColor: '#bbbbbb', // Lighter color for better contrast
        linkOpacity: 0.5, // Increased transparency for links
        linkCurvature: 0.2, // Slightly curved links to reduce overlap

        // Simulation physics - dramatically improved parameters for better spacing
        simulation: {
            decay: 1500, // Higher decay for faster stabilization
            repulsion: 0.8, // Much stronger repulsion to push nodes apart
            gravity: -0.7, // Stronger negative gravity for better spread
            friction: 0.08, // Lower friction for more movement
            linkSpring: 0.2, // Reduced spring force
            linkDistance: 180, // Much larger distance between nodes
        },
    };
}

/**
 * Configuration for the expanded layout mode
 * @returns {Object} - Expanded layout configuration
 */
export function getExpandedConfig() {
    const baseConfig = getDefaultConfig();
    return {
        ...baseConfig,
        // Even more extreme settings for expanded view
        simulation: {
            decay: 1800,
            repulsion: 1.0, // Maximum repulsion
            linkDistance: 250, // Very long links
            gravity: -0.8, // Strong gravity effect
            friction: 0.05, // Very low friction
            linkSpring: 0.1, // Very light spring force
        },
        // Further reduced node size for expanded view
        nodeSize: node => {
            const outDegree = node.menteeCount || 0;
            const inDegree = node.mentorCount || 0;
            return 1.2 + Math.sqrt(outDegree + inDegree) * 0.25;
        }
    };
}

/**
 * Configuration for the separated layout mode (bits and bytes)
 * @returns {Object} - Separated layout configuration
 */
export function getSeparatedConfig() {
    const baseConfig = getDefaultConfig();
    return {
        ...baseConfig,
        simulation: {
            decay: 1500,
            repulsion: 0.9, // Very high repulsion
            linkDistance: 200, // Long link distance
            gravity: -0.6, // Moderate-strong gravity
            friction: 0.08, // Low friction
            linkSpring: 0.15, // Low spring force
        }
    };
}