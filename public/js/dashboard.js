// State Objects Tracking Architecture Configuration Variables
let globalActiveRoadmap = null;
let userCompletedIndices = [];

// Initialize Dashboard State Configurations via Local Storage on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    const retainedTemplate = localStorage.getItem('active_dashboard_roadmap');
    const retainedProgress = localStorage.getItem('active_dashboard_progress');

    if (retainedTemplate) {
        globalActiveRoadmap = JSON.parse(retainedTemplate);
        userCompletedIndices = retainedProgress ? JSON.parse(retainedProgress) : [];
        renderActiveWorkspace();
    }
});

/**
 * Mocks or triggers API fetches to build data matrices seamlessly.
 * For now, this uses a robust mock generator to mimic the exact response structure 
 * your backend Express route will return when hooked up to the Gemini API.
 */
function triggerPathGeneration() {
    const topicInput = document.getElementById('targetTopic').value.trim();
    const tierInput = document.getElementById('targetLevel').value;

    if (!topicInput) {
        alert('Please enter a valid skill keyword topic string parameter!');
        return;
    }

    // Mock API Data Generation Map simulating AI structurally sound JSON profiles
    globalActiveRoadmap = {
        title: `Mastery Blueprint: ${topicInput} (${tierInput})`,
        totalEstimatedHours: 18,
        milestones: [
            {
                id: 1,
                topic: "Phase 1: Fundamental Concepts & Syntactic Setup",
                description: "Deep dive initialization into the core infrastructure specifications, environment building syntax rules, and primitive types execution models.",
                estimatedHours: 4,
                resources: [
                    { type: "Docs", label: "Reference Guide", query: `https://www.google.com/search?q=${encodeURIComponent(topicInput)}+fundamentals+documentation` },
                    { type: "Video", label: "Crash Course", query: `https://www.youtube.com/results?search_query=${encodeURIComponent(topicInput)}+beginners+tutorial` }
                ]
            },
            {
                id: 2,
                topic: "Phase 2: Intermediate Implementation Patterns",
                description: "Exploring algorithmic structural layout variations, standard module integrations, and logical processing error bounds strategies.",
                estimatedHours: 6,
                resources: [
                    { type: "GitHub", label: "Code Repositories", query: `https://github.com/search?q=${encodeURIComponent(topicInput)}+examples` }
                ]
            },
            {
                id: 3,
                topic: "Phase 3: Optimization, Memory Constraints & Deployment",
                description: "Advanced compilation methodologies execution safety check frameworks handling complexity management paradigms.",
                estimatedHours: 8,
                resources: [
                    { type: "Exercise", label: "Interactive Sandbox Lab", query: "https://leetcode.com/" }
                ]
            }
        ]
    };

    // Reset unique tracking arrays cleanly for newly created blueprints
    userCompletedIndices = [];

    // Persist Structural State Snapshots into the user session
    localStorage.setItem('active_dashboard_roadmap', JSON.stringify(globalActiveRoadmap));
    localStorage.setItem('active_dashboard_progress', JSON.stringify(userCompletedIndices));

    renderActiveWorkspace();
}

/**
 * Compiles structural templates elements into the interface layout tree cleanly.
 */
function renderActiveWorkspace() {
    if (!globalActiveRoadmap) return;

    // Reveal metric progress display tracking container cards elements
    document.getElementById('progressSectionCard').style.display = 'block';
    document.getElementById('activePathTitle').innerText = globalActiveActiveTitle = globalActiveRoadmap.title;
    document.getElementById('activePathEstimate').innerText = `Target Execution Envelope: ~${globalActiveRoadmap.totalEstimatedHours} Total Study Hours`;

    const dropZone = document.getElementById('roadmapRenderBox');
    dropZone.innerHTML = ''; // Wipe out baseline loading indicators

    globalActiveRoadmap.milestones.forEach((node) => {
        const isNodeChecked = userCompletedIndices.includes(node.id);

        // Generate customized badge element layout nodes conditionally
        const trackingBadgesMarkup = node.resources.map(res => `
            <a href="${res.query}" target="_blank" class="resource-tag">
                🔗 ${res.type}: ${res.label}
            </a>
        `).join('');

        // Build composite checklist component layout configuration profiles
        const blockWrapper = document.createElement('div');
        blockWrapper.className = `milestone-node ${isNodeChecked ? 'completed' : ''}`;
        blockWrapper.innerHTML = `
            <input type="checkbox" class="node-checkbox" id="check-node-${node.id}" 
                   ${isNodeChecked ? 'checked' : ''} onchange="toggleMilestoneTracking(${node.id})">
            <div class="node-content">
                <div class="node-header-row">
                    <div class="node-title ${isNodeChecked ? 'struck' : ''}">${node.topic}</div>
                    <span class="duration-badge">⏱️ ${node.estimatedHours} hrs</span>
                </div>
                <div class="node-description">${node.description}</div>
                <div class="resource-links-row">${trackingBadgesMarkup}</div>
            </div>
        `;
        dropZone.appendChild(blockWrapper);
    });

    calculateProgressMetrics();
}

/**
 * Handles state toggles when checkboxes switch.
 */
function toggleMilestoneTracking(nodeId) {
    if (userCompletedIndices.includes(nodeId)) {
        userCompletedIndices = userCompletedIndices.filter(item => item !== nodeId);
    } else {
        userCompletedIndices.push(nodeId);
    }

    localStorage.setItem('active_dashboard_progress', JSON.stringify(userCompletedIndices));
    renderActiveWorkspace(); // Clean complete repaint loop updates styles layout
}

/**
 * Math computation formula rules processing structural metrics values.
 */
function calculateProgressMetrics() {
    const totalCount = globalActiveRoadmap.milestones.length;
    if (totalCount === 0) return;

    const finishedCount = userCompletedIndices.length;
    const computedPercentage = Math.round((finishedCount / totalCount) * 100);

    // Apply linear math constraints into layout metrics displays elements
    document.getElementById('dashboardInlineBarFill').style.width = `${computedPercentage}%`;
    document.getElementById('progressPercentageText').innerText = `${computedPercentage}%`;
}