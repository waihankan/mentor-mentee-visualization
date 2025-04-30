/**
 * Main entry point for the mentor-mentee visualization application
 */
import { processCSVData } from './utils/dataProcessor.js';
import { initializeGraph } from './components/graph.js';

/**
 * Sets up search functionality for the graph
 * @param {Object} cosmograph - The Cosmograph instance
 * @param {Object} graphData - The processed graph data
 */
function setupSearch(cosmograph, graphData) {
  // Get DOM elements
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const searchResults = document.getElementById('search-results');

  // Function to perform search
  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();

    // Clear previous results
    searchResults.innerHTML = '';

    // Hide results if empty query
    if (query === '') {
      searchResults.classList.remove('visible');
      return;
    }

    // Find matching nodes
    const matches = graphData.nodes.filter(node => {
      // Check if name or username contains the query
      return node.id.toLowerCase().includes(query);
    });

    // Display results
    if (matches.length > 0) {
      matches.slice(0, 10).forEach(node => { // Limit to 10 results
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';

        // Extract display name and username
        let displayName = node.id;
        let username = '';

        const nameMatch = node.id.match(/^([^(]+)/);
        if (nameMatch) {
          displayName = nameMatch[1].trim();
        }

        const usernameMatch = node.id.match(/\(([^)]+)\)/);
        if (usernameMatch) {
          username = usernameMatch[1];
        }

        // Create role indicator
        let roleIndicatorClass = '';
        let roleText = '';

        if (node.isByte && node.isBit) {
          roleIndicatorClass = 'search-role-both';
          roleText = 'Both';
        } else if (node.isByte) {
          roleIndicatorClass = 'search-role-mentor';
          roleText = 'Mentor';
        } else {
          roleIndicatorClass = 'search-role-mentee';
          roleText = 'Mentee';
        }

        // Set HTML content
        resultItem.innerHTML = `
          <div class="search-result-name">${displayName}</div>
          <div class="search-result-info">
            <div class="search-result-username">${username}</div>
            <div class="search-result-role">
              <span class="search-role-indicator ${roleIndicatorClass}"></span>
              ${roleText}
            </div>
          </div>
        `;

        // Add click handler to show node details
        resultItem.addEventListener('click', () => {
          // Get node index
          const nodeIndex = graphData.nodes.findIndex(n => n.id === node.id);

          // Trigger click on the node using onClick handler
          if (typeof cosmograph.handleNodeClick === 'function') {
            cosmograph.handleNodeClick(node, nodeIndex, null, null);
          } else {
            // If direct access to handler isn't available, use config's onClick
            const config = cosmograph.getConfig ? cosmograph.getConfig() : {};
            if (config && typeof config.onClick === 'function') {
              config.onClick(node, nodeIndex, null, null);
            } else {
              console.error('Cannot find node click handler');
            }
          }

          // Hide search results
          searchResults.classList.remove('visible');
        });

        // Add to results
        searchResults.appendChild(resultItem);
      });

      // Show results
      searchResults.classList.add('visible');
    } else {
      // Show no results message
      const noResults = document.createElement('div');
      noResults.className = 'search-no-results';
      noResults.textContent = 'No matching individuals found';
      searchResults.appendChild(noResults);
      searchResults.classList.add('visible');
    }
  }

  // Add event listeners
  searchButton.addEventListener('click', performSearch);

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Hide results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchButton.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('visible');
    }
  });

  // Show results when input is focused and has value
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim() !== '') {
      performSearch();
    }
  });
}

/**
 * Sets up UI controls for interacting with the graph
 * @param {Object} cosmograph - The Cosmograph instance
 * @param {Object} graphData - The processed graph data
 */
function setupControls(cosmograph, graphData) {
  // Get controls container
  const controlsContainer = document.querySelector('.controls');

  if (!controlsContainer) {
    console.error('Controls container not found');
    return;
  }

  // Store initial configuration values to ensure consistency
  const initialConfig = {
    // These values should match exactly with what's in graph.js
    baseNodeSize: 1.5,
    connectionMultiplier: 0.3,
    repulsion: 0.8,
    gravity: -0.7,
    friction: 0.08,
    linkSpring: 0.2,
    linkDistance: 180,
    decay: 1500
  };

  // Create simplified controls HTML with just Reset and sliders
  controlsContainer.innerHTML = `
    <div class="control-row">
      <button id="btn-reset" class="control-btn">Reset Layout</button>
    </div>
    <div class="control-row">
      <div class="slider-container">
        <label for="node-size">Node Size:</label>
        <input type="range" id="node-size" min="0.5" max="2" step="0.1" value="1">
      </div>
    </div>
    <div class="control-row">
      <div class="filter-container">
        <label>
          <input type="checkbox" id="show-arrows" checked>
          Show Arrows
        </label>
      </div>
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color" style="background-color: #4dabf5;"></div>
          <div>Bytes (Mentors)</div>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #ffa726;"></div>
          <div>Bits (Mentees)</div>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: #9c27b0;"></div>
          <div>Both Bit & Byte</div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners for the remaining controls
  const btnReset = document.getElementById('btn-reset');
  const nodeSize = document.getElementById('node-size');
  const showArrows = document.getElementById('show-arrows');

  // Reset layout button
  btnReset.addEventListener('click', () => {
    // Reset all controls to default values
    nodeSize.value = 1;
    showArrows.checked = true;

    // Reset the graph layout - this function remains in graph.js
    cosmograph.resetLayout();

    // Apply all default settings using the same values as initial configuration
    cosmograph.setConfig({
      nodeSize: node => {
        const outDegree = node.menteeCount || 0;
        const inDegree = node.mentorCount || 0;
        // Use stored initial values for consistency
        return (initialConfig.baseNodeSize + Math.sqrt(outDegree + inDegree) * initialConfig.connectionMultiplier);
      },
      linkArrows: true,
      // Include simulation parameters to fully reset to initial state
      simulation: {
        decay: initialConfig.decay,
        repulsion: initialConfig.repulsion,
        gravity: initialConfig.gravity,
        friction: initialConfig.friction,
        linkSpring: initialConfig.linkSpring,
        linkDistance: initialConfig.linkDistance
      }
    });

    // console.log("Graph has been reset to initial configuration");
  });

  // Node size slider
  nodeSize.addEventListener('input', () => {
    // Explicitly parse the value as float
    const nodeSizeScale = parseFloat(nodeSize.value);
    // console.log('Setting node size scale to:', nodeSizeScale);

    // Update configuration with new node size
    const config = {
      nodeSize: node => {
        const outDegree = node.menteeCount || 0;
        const inDegree = node.mentorCount || 0;
        // Use stored initial values for consistency, then apply scale
        return (initialConfig.baseNodeSize + Math.sqrt(outDegree + inDegree) * initialConfig.connectionMultiplier) * nodeSizeScale;
      }
    };

    // Apply new configuration
    cosmograph.setConfig(config);
  });

  // Toggle arrows
  showArrows.addEventListener('change', () => {
    // console.log('Setting linkArrows to:', showArrows.checked);
    cosmograph.setConfig({
      linkArrows: showArrows.checked
    });
  });

  // Remove the loading indicator after everything is set up
  const loadingElement = document.querySelector('.loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }

  // console.log('Controls setup complete');
}

// Entry point
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get the graph container
    const graphContainer = document.getElementById('graph-container');

    // Fetch the CSV data
    const response = await fetch('./bit_byte_tree.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`);
    }

    const csvData = await response.text();
    // console.log("CSV data loaded, first 100 chars:", csvData.substring(0, 100));

    // Process the CSV data
    const graphData = await processCSVData(csvData);
    // console.log("Processed graph data:", {
    //   nodes: graphData.nodes.length,
    //   links: graphData.links.length
    // });

    // Initialize the graph visualization
    const cosmograph = initializeGraph(graphContainer, graphData);

    // Store the cosmograph instance for later access if needed
    window.cosmograph = cosmograph;

    // Set up UI controls
    setupControls(cosmograph, graphData);

    // Set up search functionality
    setupSearch(cosmograph, graphData);

    // console.log("Graph visualization initialized successfully");
  } catch (error) {
    console.error("Error initializing application:", error);
    document.getElementById('graph-container').innerHTML = `
      <div style="color: red; padding: 20px;">
        <h3>Error Loading Visualization</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
});