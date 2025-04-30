/**
 * Graph component for visualizing mentor-mentee relationships
 */
import { Cosmograph } from '@cosmograph/cosmograph';

/**
 * Initialize the Cosmograph visualization
 * @param {HTMLElement} container - DOM element to render the graph
 * @param {Object} data - Object containing nodes and links
 * @returns {Object} - Cosmograph instance
 */
export function initializeGraph(container, data) {
    // Log the data being passed to Cosmograph
    // console.log("Initializing graph with data:", {
    //     nodes: data.nodes.length,
    //     links: data.links.length
    // });

    // Get the hierarchy panel DOM elements
    const hierarchyPanel = document.getElementById('hierarchy-panel');
    const hierarchyTitle = document.getElementById('hierarchy-title');
    const mentorCount = document.getElementById('mentor-count');
    const menteeCount = document.getElementById('mentee-count');
    const roleIndicator = document.getElementById('role-indicator');
    const roleText = document.getElementById('role-text');
    const nodeId = document.getElementById('node-id');
    const mentorsCount = document.getElementById('mentors-count');
    const menteesList = document.getElementById('mentees-list');
    const mentorsList = document.getElementById('mentors-list');
    const noMenteesMessage = document.getElementById('no-mentees-message');
    const noMentorsMessage = document.getElementById('no-mentors-message');

    // Add event listener to close button
    const closeButton = document.querySelector('.hierarchy-close');
    closeButton.addEventListener('click', () => {
        hierarchyPanel.classList.remove('visible');
        resetHighlighting();
    });

    /**
     * Helper function to create a relationship list item 
     * @param {Object} node - Node data
     * @returns {HTMLElement} - List item element
     */
    function createRelationshipItem(node) {
        const item = document.createElement('li');
        item.className = 'relationship-item';

        // Extract display name
        let displayName = node.id;
        const nameMatch = node.id.match(/^([^(]+)/);
        if (nameMatch) {
            displayName = nameMatch[1].trim();
        }

        // Create name element
        const nameEl = document.createElement('div');
        nameEl.className = 'relationship-item-name';
        nameEl.textContent = displayName;

        // Create ID element
        const idEl = document.createElement('div');
        idEl.className = 'relationship-item-id';
        idEl.textContent = node.id;

        // Add click event to navigate to this node
        item.addEventListener('click', () => {
            // This will trigger the onClick handler for this node
            const nodeIndex = data.nodes.findIndex(n => n.id === node.id);
            if (nodeIndex !== -1) {
                // We're manually triggering a click on this node
                const nodeClickHandler = baseConfig.onClick;
                nodeClickHandler(node, nodeIndex, null, null);
            }
        });

        // Append elements
        item.appendChild(nameEl);
        item.appendChild(idEl);

        return item;
    }

    /**
     * Update the hierarchy panel with node data
     * @param {Object} nodeData - The node data to display
     * @param {Array} mentors - Array of mentor nodes
     * @param {Array} mentees - Array of mentee nodes
     */
    function updateHierarchyPanel(nodeData, mentors, mentees) {
        // Get display name
        let displayName = nodeData.id;
        const nameMatch = nodeData.id.match(/^([^(]+)/);
        if (nameMatch) {
            displayName = nameMatch[1].trim();
        }

        // Update panel title
        hierarchyTitle.textContent = displayName;

        // Update stats
        mentorCount.textContent = nodeData.mentorCount || 0;
        menteeCount.textContent = nodeData.menteeCount || 0;

        // Update role
        if (nodeData.isByte && nodeData.isBit) {
            roleIndicator.className = 'role-indicator role-both';
            roleText.textContent = 'Both Mentor & Mentee';
        } else if (nodeData.isByte) {
            roleIndicator.className = 'role-indicator role-mentor';
            roleText.textContent = 'Mentor (Byte)';
        } else {
            roleIndicator.className = 'role-indicator role-mentee';
            roleText.textContent = 'Mentee (Bit)';
        }

        // Update ID
        nodeId.textContent = nodeData.id;

        // Update mentors list
        mentorsList.innerHTML = '';
        mentorsCount.textContent = mentors.length;

        if (mentors.length > 0) {
            noMentorsMessage.style.display = 'none';
            mentors.forEach(mentor => {
                mentorsList.appendChild(createRelationshipItem(mentor));
            });
        } else {
            noMentorsMessage.style.display = 'block';
            mentorsList.appendChild(noMentorsMessage);
        }

        // Update mentees list
        menteesList.innerHTML = '';
        document.getElementById('mentees-count').textContent = mentees.length;

        if (mentees.length > 0) {
            noMenteesMessage.style.display = 'none';
            mentees.forEach(mentee => {
                menteesList.appendChild(createRelationshipItem(mentee));
            });
        } else {
            noMenteesMessage.style.display = 'block';
            menteesList.appendChild(noMenteesMessage);
        }

        // Show the panel
        hierarchyPanel.classList.add('visible');
    }

    /**
     * Highlight a node and its connections using proper Cosmograph selection methods
     * @param {Object} nodeData - The node to highlight
     * @param {number} nodeIndex - The index of the node in the data array
     */
    function highlightNodeAndConnections(nodeData, nodeIndex) {
        if (!nodeData || nodeIndex === undefined) return;

        // Find all directly connected nodes (mentors and mentees)
        const connectedNodes = [];

        // Add all mentors
        data.links
            .filter(link => link.target === nodeData.id)
            .forEach(link => {
                const mentorIndex = data.nodes.findIndex(n => n.id === link.source);
                if (mentorIndex !== -1) {
                    connectedNodes.push(data.nodes[mentorIndex]);
                }
            });

        // Add all mentees
        data.links
            .filter(link => link.source === nodeData.id)
            .forEach(link => {
                const menteeIndex = data.nodes.findIndex(n => n.id === link.target);
                if (menteeIndex !== -1) {
                    connectedNodes.push(data.nodes[menteeIndex]);
                }
            });

        // Configure greyout opacity for unselected nodes
        cosmograph.setConfig({
            nodeGreyoutOpacity: 0.1 // Set opacity for unselected nodes
        });

        // Select the main node and its connections
        const nodesToSelect = [nodeData, ...connectedNodes];
        cosmograph.selectNodes(nodesToSelect);

        // Also focus the main node to get the focus ring
        cosmograph.focusNode(nodeIndex);
    }

    /**
     * Reset visual highlighting to default state
     */
    function resetHighlighting() {
        // Unselect all nodes
        cosmograph.unselectNodes();
        // Clear focused node
        cosmograph.focusNode();
    }

    // Store the onClick handler separately so it can be reused
    const handleNodeClick = (clickedNode, index, nodePosition, event) => {
        // console.log("onClick event triggered");

        // Check if a node was clicked
        if (clickedNode) {
            // console.log("Clicked node:", clickedNode);
            // console.log("Node index:", index);
            // console.log("Node position:", nodePosition);

            // Get the node's label/name for display
            let nodeName = clickedNode.id;
            const nameMatch = clickedNode.id.match(/^([^(]+)/);
            if (nameMatch) {
                nodeName = nameMatch[1].trim();
            }

            // Find direct mentors (bytes that connect to this node)
            const mentors = data.links
                .filter(link => link.target === clickedNode.id)
                .map(link => {
                    // Find the full node data for each mentor
                    const mentorNode = data.nodes.find(n => n.id === link.source);
                    return mentorNode || { id: link.source };
                });

            // Find direct mentees (bits that this node connects to)
            const mentees = data.links
                .filter(link => link.source === clickedNode.id)
                .map(link => {
                    // Find the full node data for each mentee
                    const menteeNode = data.nodes.find(n => n.id === link.target);
                    return menteeNode || { id: link.target };
                });

            // Log detailed hierarchy information
            // console.log(`\n----- HIERARCHY FOR NODE: ${nodeName} -----`);
            // console.log(`Node ID: ${clickedNode.id}`);
            // console.log(`Display Name: ${nodeName}`);
            // console.log(`Is Mentor (Byte): ${clickedNode.isByte ? 'Yes' : 'No'}`);
            // console.log(`Is Mentee (Bit): ${clickedNode.isBit ? 'Yes' : 'No'}`);
            // console.log(`Mentor Count: ${clickedNode.mentorCount || 0}`);
            // console.log(`Mentee Count: ${clickedNode.menteeCount || 0}`);

            // Log mentor details
            // console.log(`\nMENTORS (${mentors.length}):`);
            if (mentors.length > 0) {
                mentors.forEach((mentor, i) => {
                    const mentorName = mentor.id.match(/^([^(]+)/) ?
                        mentor.id.match(/^([^(]+)/)[1].trim() : mentor.id;
                    // console.log(`  ${i + 1}. ${mentorName} (${mentor.id})`);
                });
            } else {
                // console.log("  None (This node has no mentors)");
            }

            // Log mentee details
            // console.log(`\nMENTEES (${mentees.length}):`);
            if (mentees.length > 0) {
                mentees.forEach((mentee, i) => {
                    const menteeName = mentee.id.match(/^([^(]+)/) ?
                        mentee.id.match(/^([^(]+)/)[1].trim() : mentee.id;
                    // console.log(`  ${i + 1}. ${menteeName} (${mentee.id})`);
                });
            } else {
                // console.log("  None (This node has no mentees)");
            }

            // console.log("----- END OF HIERARCHY -----\n");

            // Update and show the hierarchy panel
            updateHierarchyPanel(clickedNode, mentors, mentees);

            // Highlight the node and its connections
            highlightNodeAndConnections(clickedNode, index);
        }
    };

    // Create Cosmograph instance
    const cosmograph = new Cosmograph(container);

    // Base configuration
    const baseConfig = {
        // Node styling - MODIFIED FOR LESS DENSITY
        nodeSize: node => {
            // Size nodes based on their connections
            const outDegree = node.menteeCount || 0; // Mentees count
            const inDegree = node.mentorCount || 0; // Mentors count

            // Reduced base size + smaller bonus for connections
            return 1.5 + Math.sqrt(outDegree + inDegree) * 0.3;
        },
        nodeColor: node => {
            // Color scheme based on node type
            if (node.isByte && node.isBit) return '#9c27b0'; // Both mentor and mentee (purple)
            if (node.isByte) return '#4dabf5'; // Mentor only (brighter blue)
            return '#ffa726'; // Mentee only (brighter orange)
        },
        nodeOpacity: 0.9, // Slight transparency for better overlapping

        // Only show labels for nodes with significant connections
        nodeLabel: node => {
            // Only show labels for nodes with multiple connections
            const totalConnections = (node.menteeCount || 0) + (node.mentorCount || 0);
            if (totalConnections < 4) return ''; // Hide labels for nodes with few connections

            // Extract name from format like "name(username)"
            const match = node.id.match(/^([^(]+)/);
            return match ? match[1].trim() : node.id;
        },
        nodeLabelMaxLength: 15, // Limit label length
        showLabelsAtZoom: 0.7, // Only show labels when zoomed in enough
        nodeLabelColor: '#ffffff', // White text for better contrast
        hoverHighlightConnections: true, // Built-in Cosmograph hover highlighting

        // Link styling
        linkWidth: 0.6, // Thinner links to reduce visual clutter
        linkArrows: true, // Show arrows to indicate direction
        linkColor: '#bbbbbb', // Lighter color for better contrast
        linkOpacity: 0.6, // Transparency for links
        linkCurvature: 0.2, // Slightly curved links to reduce overlap

        // Simulation physics - MODIFIED FOR BETTER SPACING
        simulation: {
            decay: 5000, // Significantly higher decay for slower "cooling" (default: 1000)
            repulsion: 1.5, // Much stronger repulsion for better node spacing (default: 0.1) 
            gravity: 0.05, // Slight positive gravity to keep components together
            friction: 0.85, // Default friction value
            linkSpring: 0.5, // Reduced spring force (default: 1.0)
            linkDistance: 12 // Higher link distance value (default: 2)
        },

        // Visual indicators for interaction
        focusedNodeRingColor: '#ffffff', // White focus ring
        hoveredNodeRingColor: '#ff9800',  // Orange hover ring

        // Click handler using the documented onClick event
        onClick: handleNodeClick
    };

    // Set the data and configuration
    cosmograph.setData(data.nodes, data.links);
    cosmograph.setConfig(baseConfig);

    // Override the original setConfig method to ensure our onClick handler is always included
    const originalSetConfig = cosmograph.setConfig;
    cosmograph.setConfig = function (newConfig) {
        // Merge new config with our click handler
        const mergedConfig = {
            ...newConfig,
            onClick: handleNodeClick
        };
        // Call the original setConfig with our merged config
        return originalSetConfig.call(this, mergedConfig);
    };

    // Expose the node click handler for the search functionality
    cosmograph.handleNodeClick = handleNodeClick;

    // Reset layout method that preserves the data
    cosmograph.resetLayout = function () {
        cosmograph.setData(data.nodes, data.links);
        // Reset highlighting
        resetHighlighting();
        // console.log("Layout reset - data reapplied and highlighting reset");
    };

    // Add click listener to close hierarchy panel when clicking outside of it
    container.addEventListener('click', (event) => {
        // Check if click is directly on the container (not on a node or the panel)
        if (event.target === container) {
            hierarchyPanel.classList.remove('visible');
            resetHighlighting();
        }
    });

    return cosmograph;
}