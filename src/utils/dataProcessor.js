/**
 * Processes CSV data for the mentor-mentee visualization
 */
import * as d3 from 'd3';

/**
 * Parse the CSV data and convert it to a format suitable for Cosmograph
 * @param {string} csvData - Raw CSV data
 * @returns {Object} - Object containing nodes and links for the graph
 */
export async function processCSVData(csvData) {
    // Parse CSV data
    const data = d3.csvParse(csvData);

    // Log a sample of the data to understand its structure
    // console.log("Sample CSV data:", data.slice(0, 5));

    // Create maps to track node metrics
    const uniqueIndividuals = new Set();
    const outgoingCount = new Map(); // Number of mentees
    const incomingCount = new Map(); // Number of mentors

    // Process rows and collect metrics
    data.forEach(row => {
        if (!row.byte || !row.bit || row.byte.trim() === '' || row.bit.trim() === '') {
            return; // Skip invalid rows
        }

        // Add to unique individuals
        uniqueIndividuals.add(row.byte);
        uniqueIndividuals.add(row.bit);

        // Count outgoing connections (mentees)
        if (!outgoingCount.has(row.byte)) {
            outgoingCount.set(row.byte, 0);
        }
        outgoingCount.set(row.byte, outgoingCount.get(row.byte) + 1);

        // Count incoming connections (mentors)
        if (!incomingCount.has(row.bit)) {
            incomingCount.set(row.bit, 0);
        }
        incomingCount.set(row.bit, incomingCount.get(row.bit) + 1);
    });

    // Find the maximum connection counts for scaling
    const maxOutgoing = Math.max(...outgoingCount.values());
    const maxIncoming = Math.max(...incomingCount.values());

    // Create nodes array from unique individuals with metadata
    const nodes = Array.from(uniqueIndividuals).map(id => {
        // Extract username from format like "name(username)"
        const usernameMatch = id.match(/\(([^)]+)\)/);
        const username = usernameMatch ? usernameMatch[1] : '';

        // Extract display name
        const nameMatch = id.match(/^([^(]+)/);
        const displayName = nameMatch ? nameMatch[1].trim() : id;

        return {
            id,
            username,
            displayName,
            // Role flags
            isByte: outgoingCount.has(id),
            isBit: incomingCount.has(id),
            // Connection counts
            menteeCount: outgoingCount.get(id) || 0,
            mentorCount: incomingCount.get(id) || 0,
            // Normalized metrics for visualization (0-1 scale)
            menteeScale: outgoingCount.has(id) ? outgoingCount.get(id) / maxOutgoing : 0,
            mentorScale: incomingCount.has(id) ? incomingCount.get(id) / maxIncoming : 0
        };
    });

    // Create links array from the relationships
    const links = data
        .filter(row => row.byte && row.bit && row.byte.trim() !== '' && row.bit.trim() !== '')
        .map(row => ({
            source: row.byte,
            target: row.bit,
            type: 'mentorship'
        }));

    // Log summary statistics
    // console.log(`Processed ${nodes.length} unique individuals and ${links.length} mentorship connections`);
    // console.log(`Found ${nodes.filter(n => n.isByte && n.isBit).length} individuals who are both mentors and mentees`);

    return {
        nodes,
        links
    };
}