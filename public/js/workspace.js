let savedPathsCollection = [];
let activePathId = null;

// Dynamically grab the current logged-in user token to isolate database sandboxes
const currentSessionUser = localStorage.getItem('loggedInUser') || 'default_guest';
const STORAGE_KEY_PATHS = `pathai_paths_${currentSessionUser}`;
const STORAGE_KEY_ACTIVE = `pathai_active_id_${currentSessionUser}`;

document.addEventListener('DOMContentLoaded', () => {
    const retainedPaths = localStorage.getItem(STORAGE_KEY_PATHS);
    const retainedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE);

    if (retainedPaths) {
        savedPathsCollection = JSON.parse(retainedPaths);
        activePathId = retainedActiveId ? parseInt(retainedActiveId) : (savedPathsCollection.length ? savedPathsCollection[0].id : null);
        renderHistoryPanel();
        if (activePathId) renderActiveWorkspace();
    }
});

/**
 * Communicates with backend to fetch adaptive paths using relative URL mapping
 */
async function triggerPathGeneration() {
    const topic = document.getElementById('targetTopic').value.trim();
    const level = document.getElementById('targetLevel').value;

    if (!topic) return alert('Please enter a target learning topic!');

    document.getElementById('progressSectionCard').style.display = 'none';
    document.getElementById('roadmapRenderBox').innerHTML = `
        <div style="text-align:center; padding: 5rem 1rem;">
            <h2 style="animation: pulse 1.5s infinite;">🤖 Assembling Adaptive AI Matrix...</h2>
            <p style="color: var(--text-muted); margin-top: 0.5rem;">Filtering primitives and structuring specialized conceptual nodes.</p>
        </div>
    `;

    try {
        // FIXED: Swapped 'http://localhost:3000/generate-path' with a relative URL
        const response = await fetch('/generate-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, level })
        });
        
        const targetData = await response.json();

        const structuredNode = {
            id: Date.now(),
            title: targetData.title || `Masterclass: ${topic}`,
            modules: targetData.modules || targetData.milestones || targetData.sections || [],
            completedTopics: []
        };

        savedPathsCollection.push(structuredNode);
        activePathId = structuredNode.id;
        saveAndRefresh();
    } catch (err) {
        console.error("Workspace Fetch breakdown:", err);
        document.getElementById('roadmapRenderBox').innerHTML = '<h3 style="text-align:center; color:#ef4444;">Failed to generate adaptive curriculum. Check server status logs.</h3>';
    }
}

/**
 * Renders historical roadmap item cards directly into the sidebar panel with a delete icon button
 */
function renderHistoryPanel() {
    const historyBox = document.getElementById('historyContainerBox');
    if (!historyBox) return;
    
    if (savedPathsCollection.length === 0) {
        historyBox.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:1rem 0;">No past records found.</p>`;
        return;
    }

    historyBox.innerHTML = ''; 

    savedPathsCollection.forEach(path => {
        let totalTopics = 0;
        const activeModules = path.modules || path.milestones || path.sections || [];
        
        activeModules.forEach(m => {
            const currentTopics = m.topics || m.milestones || m.concepts || [];
            totalTopics += currentTopics.length;
        });

        const completed = path.completedTopics ? path.completedTopics.length : 0;
        const percentage = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;
        
        const isActive = path.id === activePathId;

        let cleanTitle = path.title;
        if (cleanTitle.includes("Adaptive Masterclass:")) {
            cleanTitle = cleanTitle.replace("Adaptive Masterclass:", "").trim();
        }

        const historyBtn = document.createElement('div');
        historyBtn.style.padding = '0.75rem';
        historyBtn.style.backgroundColor = isActive ? 'var(--primary)' : 'var(--bg-dark)';
        historyBtn.style.border = '1px solid var(--border-color)';
        historyBtn.style.borderRadius = '6px';
        historyBtn.style.cursor = 'pointer';
        historyBtn.style.transition = 'all 0.2s ease';
        historyBtn.style.position = 'relative'; 
        
        historyBtn.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; padding-right: 1.5rem;">
                <div style="font-size:0.85rem; font-weight:600; color:white; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width: 170px;" title="${path.title}">
                    ${cleanTitle}
                </div>
                <span style="font-size:0.75rem; color:${isActive ? 'white' : 'var(--primary-hover)'}; font-weight:700;">${percentage}%</span>
            </div>
            <div style="width:100%; height:4px; background-color:var(--bg-card); border-radius:99px; margin-top:0.5rem; overflow:hidden;">
                <div style="width:${percentage}%; height:100%; background-color:${isActive ? 'white' : 'var(--primary-hover)'}; transition:width 0.3s ease;"></div>
            </div>
            
            <button class="delete-path-btn" title="Remove Roadmap" 
                style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: #ef4444; font-size: 0.9rem; cursor: pointer; padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: background 0.2s;"
                onclick="deletePath(event, ${path.id})">
                ×
            </button>
        `;

        historyBtn.onclick = (e) => {
            activePathId = path.id;
            saveAndRefresh();
        };

        historyBox.appendChild(historyBtn);
    });
}

/**
 * Wipes a roadmap instance from local memory banks and updates active routes
 */
function deletePath(event, pathId) {
    event.stopPropagation(); 
    
    if (!confirm("Are you sure you want to remove this learning roadmap from your history?")) return;

    savedPathsCollection = savedPathsCollection.filter(p => p.id !== pathId);

    if (activePathId === pathId) {
        if (savedPathsCollection.length > 0) {
            activePathId = savedPathsCollection[0].id; 
        } else {
            activePathId = null; 
            document.getElementById('progressSectionCard').style.display = 'none';
            document.getElementById('roadmapRenderBox').innerHTML = `
                <h3 style="color: var(--text-muted); text-align: center; margin-top: 5rem; font-weight: 500;">
                    No Active Roadmap. Use the sidebar to generate one!
                </h3>
            `;
        }
    }

    saveAndRefresh();
}

/**
 * Builds nested interactive checkbox interfaces
 */
function renderActiveWorkspace() {
    const path = savedPathsCollection.find(p => p.id === activePathId);
    if (!path) return;

    document.getElementById('progressSectionCard').style.display = 'block';
    document.getElementById('activePathTitle').innerText = path.title;

    const box = document.getElementById('roadmapRenderBox');
    box.innerHTML = ''; 

    const activeModules = path.modules || path.milestones || path.sections || [];

    activeModules.forEach(moduleItem => {
        const currentModuleName = moduleItem.moduleName || moduleItem.title || "Core Learning Block";
        const currentTopics = moduleItem.topics || moduleItem.milestones || moduleItem.concepts || [];

        const moduleCard = document.createElement('div');
        moduleCard.style.backgroundColor = 'var(--bg-card)';
        moduleCard.style.border = '1px solid var(--border-color)';
        moduleCard.style.padding = '1.5rem';
        moduleCard.style.borderRadius = '10px';
        moduleCard.style.marginBottom = '2rem';

        let topicsMarkup = `
            <h3 style="color: var(--primary-hover); margin-bottom: 1.25rem; font-size: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                📦 ${currentModuleName}
            </h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
        `;

        currentTopics.forEach(topicNode => {
            const topicId = topicNode.id || Math.random();
            const topicLabel = topicNode.label || topicNode.topic || "Untitled Concept Block";
            const topicHours = topicNode.estimatedHours || topicNode.hours || 2;
            const topicDesc = topicNode.description || "No deep objective overview provided.";
            const topicLink = topicNode.referenceQuery || `https://www.google.com/search?q=${encodeURIComponent(topicLabel)}`;

            const isChecked = path.completedTopics ? path.completedTopics.includes(topicId) : false;
            
            topicsMarkup += `
                <div style="display: flex; align-items: flex-start; gap: 1rem; padding: 0.75rem; background-color: var(--bg-dark); border: 1px solid var(--border-color); border-radius: 6px;">
                    <input type="checkbox" id="topic-${topicId}" style="width: 1.2rem; height: 1.2rem; margin-top: 0.2rem; cursor: pointer;"
                           ${isChecked ? 'checked' : ''} onchange="toggleTopicCompletion(${topicId})">
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                            <label for="topic-${topicId}" style="font-weight: 600; cursor: pointer; text-decoration: ${isChecked ? 'line-through' : 'none'}; color: ${isChecked ? 'var(--text-muted)' : 'var(--text-main)'};">
                                ${topicLabel}
                            </label>
                            <span style="font-size: 0.75rem; background-color: var(--border-color); padding: 2px 6px; border-radius: 4px; color: var(--text-muted);">⏱️ ${topicHours} hrs</span>
                        </div>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">${topicDesc}</p>
                        <a href="${topicLink}" target="_blank" style="display: inline-block; font-size: 0.8rem; color: var(--primary-hover); text-decoration: none; margin-top: 0.5rem;">🔗 Explore Documentation Reference</a>
                    </div>
                </div>
            `;
        });

        topicsMarkup += `</div>`;
        moduleCard.innerHTML = topicsMarkup;
        box.appendChild(moduleCard);
    });

    calculateMetrics();
}

function toggleTopicCompletion(topicId) {
    const path = savedPathsCollection.find(p => p.id === activePathId);
    if (!path) return;

    if (!path.completedTopics) path.completedTopics = [];

    if (path.completedTopics.includes(topicId)) {
        path.completedTopics = path.completedTopics.filter(id => id !== topicId);
    } else {
        path.completedTopics.push(topicId);
    }

    saveAndRefresh();
}

function calculateMetrics() {
    const path = savedPathsCollection.find(p => p.id === activePathId);
    if (!path) return;

    let totalTopicsCount = 0;
    const activeModules = path.modules || path.milestones || path.sections || [];
    
    activeModules.forEach(mod => {
        const currentTopics = mod.topics || mod.milestones || mod.concepts || [];
        totalTopicsCount += currentTopics.length;
    });

    const completedCount = path.completedTopics ? path.completedTopics.length : 0;
    const computedPercentage = totalTopicsCount > 0 ? Math.round((completedCount / totalTopicsCount) * 100) : 0;

    document.getElementById('dashboardInlineBarFill').style.width = `${computedPercentage}%`;
    document.getElementById('progressPercentageText').innerText = `${computedPercentage}%`;
}

function saveAndRefresh() {
    localStorage.setItem(STORAGE_KEY_PATHS, JSON.stringify(savedPathsCollection));
    localStorage.setItem(STORAGE_KEY_ACTIVE, activePathId);
    renderHistoryPanel(); 
    if (activePathId) renderActiveWorkspace();
}