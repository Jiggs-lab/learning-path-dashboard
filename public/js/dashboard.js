// Route Guard: Protect the dashboard from unauthorized visitors
if (!localStorage.getItem('loggedInUser')) {
    alert("Unauthorized access! Please log in first.");
    window.location.href = 'login.html'; // Kick them back to the login gateway
}

// State Management Architecture
let savedPathsCollection = []; // Array holding all generated paths
let activePathId = null;       // Tracks which path id is currently open in the workspace

// Initialize and pull all saved data portfolios on page load
document.addEventListener('DOMContentLoaded', () => {
    const retainedPaths = localStorage.getItem('pathai_all_saved_paths');
    const retainedActiveId = localStorage.getItem('pathai_active_id');

    if (retainedPaths) {
        savedPathsCollection = JSON.parse(retainedPaths);
        activePathId = retainedActiveId ? parseInt(retainedActiveId) : null;
        
        renderSavedPathsList(); // Build the sidebar switcher list
        
        if (activePathId) {
            renderActiveWorkspace();
        }
    } else {
        document.getElementById('progressSectionCard').style.display = 'none';
    }
});

/**
 * Triggers API fetches and saves the path into our collection portfolio
 */
async function triggerPathGeneration() {
    const topicInput = document.getElementById('targetTopic').value.trim();
    const tierInput = document.getElementById('targetLevel').value;

    if (!topicInput) {
        alert('Please enter a valid skill keyword topic string parameter!');
        return;
    }

    document.getElementById('progressSectionCard').style.display = 'none';
    document.getElementById('roadmapRenderBox').innerHTML = `
        <div style="text-align: center; padding: 4rem; color: var(--text-muted);">
            <h2>🤖 Generating Your AI Path...</h2>
            <p style="margin-top:0.5rem;">Assembling optimized resources, milestones, and timeline matrices.</p>
        </div>
    `;

    try {
        const response = await fetch('http://localhost:3000/generate-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: topicInput, level: tierInput })
        });

        if (!response.ok) throw new Error('Network execution error during retrieval.');

        const newPathData = await response.json();
        
        // Build a unique tracking node structure for this specific path session
        const structuredPathNode = {
            id: Date.now(), // Unique ID using timestamp
            title: newPathData.title,
            totalEstimatedHours: newPathData.totalEstimatedHours,
            milestones: newPathData.milestones,
            completedIndices: [] // Unique progress tracker array bound to this path
        };

        // Add to our global collection array
        savedPathsCollection.push(structuredPathNode);
        activePathId = structuredPathNode.id;

        // Save everything to localStorage
        saveToLocalStorage();
        
        // Update both UI sections
        renderSavedPathsList();
        renderActiveWorkspace();

    } catch (error) {
        console.error("Pipeline Communication Error:", error);
        document.getElementById('roadmapRenderBox').innerHTML = `
            <div style="text-align: center; padding: 4rem; color: #ef4444;">
                <h2>Generation Failed</h2>
                <p style="margin-top: 0.5rem; color: var(--text-muted);">Check server status and API configurations.</p>
            </div>
        `;
    }
}

/**
 * Renders the "My Saved Paths" collection switcher menu inside the sidebar
 */
function renderSavedPathsList() {
    // Check if a container element exists in the sidebar, if not create one dynamically
    let listContainer = document.getElementById('savedPathsMenuBox');
    
    if (!listContainer) {
        const sidebarDiv = document.querySelector('.sidebar > div');
        listContainer = document.createElement('div');
        listContainer.id = 'savedPathsMenuBox';
        listContainer.style.marginTop = '2rem';
        listContainer.style.borderTop = '1px solid var(--border-color)';
        listContainer.style.paddingTop = '1.5rem';
        sidebarDiv.appendChild(listContainer);
    }

    if (savedPathsCollection.length === 0) {
        listContainer.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted);">No courses active yet.</span>';
        return;
    }

    let menuHTML = `<h3 style="font-size:0.85rem; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.75rem; letter-spacing:0.05em;">📚 My Learning Paths</h3><div style="display:flex; flex-direction:column; gap:0.5rem;">`;

    savedPathsCollection.forEach(pathNode => {
        // Calculate historical completion percentage for the sidebar badges
        const total = pathNode.milestones.length;
        const checked = pathNode.completedIndices.length;
        const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
        
        const isCurrent = pathNode.id === activePathId;

        menuHTML += `
            <button onclick="switchActivePath(${pathNode.id})" style="width:100%; text-align:left; padding:0.65rem; border-radius:6px; font-size:0.85rem; border:none; cursor:pointer; display:flex; justify-content:between; align-items:center; transition:all 0.2s;
                background-color: ${isCurrent ? 'var(--primary)' : 'transparent'};
                color: ${isCurrent ? 'white' : 'var(--text-main)'};"
                class="${!isCurrent ? 'hover:bg-gray-700' : ''}">
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:160px; font-weight:${isCurrent ? '600' : '400'};">${pathNode.title}</span>
                <span style="font-size:0.75rem; background-color:rgba(0,0,0,0.2); padding:2px 6px; border-radius:4px;">${pct}%</span>
            </button>
        `;
    });

    menuHTML += `</div>`;
    listContainer.innerHTML = menuHTML;
}

/**
 * Switcher function allowing users to switch tasks on a click event
 */
function switchActivePath(id) {
    activePathId = id;
    localStorage.setItem('pathai_active_id', activePathId);
    renderSavedPathsList();
    renderActiveWorkspace();
}

/**
 * Compiles structural templates elements for the active path into the workspace
 */
function renderActiveWorkspace() {
    const currentPath = savedPathsCollection.find(p => p.id === activePathId);
    if (!currentPath) return;

    document.getElementById('progressSectionCard').style.display = 'block';
    document.getElementById('activePathTitle').innerText = currentPath.title;
    document.getElementById('activePathEstimate').innerText = `Target Execution Envelope: ~${currentPath.totalEstimatedHours || 0} Total Study Hours`;

    const dropZone = document.getElementById('roadmapRenderBox');
    dropZone.innerHTML = ''; 

    currentPath.milestones.forEach((node) => {
        const isNodeChecked = currentPath.completedIndices.includes(node.id);
        const trackingBadgesMarkup = node.resources ? node.resources.map(res => `
            <a href="${res.query}" target="_blank" class="resource-tag">🔗 ${res.type}: ${res.label}</a>
        `).join('') : '';

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
 * Handles state toggles tied directly to the scoped active array profile context
 */
function toggleMilestoneTracking(nodeId) {
    const currentPath = savedPathsCollection.find(p => p.id === activePathId);
    if (!currentPath) return;

    if (currentPath.completedIndices.includes(nodeId)) {
        currentPath.completedIndices = currentPath.completedIndices.filter(item => item !== nodeId);
    } else {
        currentPath.completedIndices.push(nodeId);
    }

    saveToLocalStorage();
    renderSavedPathsList(); // Refresh sidebar scores in real-time
    renderActiveWorkspace(); 
}

/**
 * Progress bar calculator scoped directly to current active node sizes
 */
function calculateProgressMetrics() {
    const currentPath = savedPathsCollection.find(p => p.id === activePathId);
    if (!currentPath || !currentPath.milestones) return;

    const totalCount = currentPath.milestones.length;
    if (totalCount === 0) return;

    const finishedCount = currentPath.completedIndices.length;
    const computedPercentage = Math.round((finishedCount / totalCount) * 100);

    document.getElementById('dashboardInlineBarFill').style.width = `${computedPercentage}%`;
    document.getElementById('progressPercentageText').innerText = `${computedPercentage}%`;
}

// Global utility save compression block
function saveToLocalStorage() {
    localStorage.setItem('pathai_all_saved_paths', JSON.stringify(savedPathsCollection));
    localStorage.setItem('pathai_active_id', activePathId);
}