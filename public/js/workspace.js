let savedPathsCollection = [];
let activePathId = null;

document.addEventListener('DOMContentLoaded', () => {
    const retainedPaths = localStorage.getItem('pathai_all_saved_paths');
    const retainedActiveId = localStorage.getItem('pathai_active_id');

    if (retainedPaths) {
        savedPathsCollection = JSON.parse(retainedPaths);
        // Safely fall back to the first available roadmap if active id is corrupt
        activePathId = retainedActiveId ? parseInt(retainedActiveId) : (savedPathsCollection.length ? savedPathsCollection[0].id : null);
        renderHistoryPanel();
        if (activePathId) renderActiveWorkspace();
    }
});

/**
 * Communicates with backend port 3000 to fetch adaptive paths
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
        const response = await fetch('http://localhost:3000/generate-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, level })
        });
        
        const targetData = await response.json();

        const structuredNode = {
            id: Date.now(),
            title: targetData.title,
            modules: targetData.modules,
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
 * NEW: Renders historical roadmap item cards directly into the sidebar panel
 */
function renderHistoryPanel() {
    const historyBox = document.getElementById('historyContainerBox');
    if (!historyBox) return;
    
    if (savedPathsCollection.length === 0) {
        historyBox.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding:1rem 0;">No past records found.</p>`;
        return;
    }

    historyBox.innerHTML = ''; // Clear stale rendering configurations

    savedPathsCollection.forEach(path => {
        // Calculate item metric score for this specific history slot row entry
        let totalTopics = 0;
        path.modules.forEach(m => totalTopics += m.topics.length);
        const completed = path.completedTopics.length;
        const percentage = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;
        
        const isActive = path.id === activePathId;

        const historyBtn = document.createElement('div');
        historyBtn.style.padding = '0.75rem';
        historyBtn.style.backgroundColor = isActive ? 'var(--primary)' : 'var(--bg-dark)';
        historyBtn.style.border = '1px solid var(--border-color)';
        historyBtn.style.borderRadius = '6px';
        historyBtn.style.cursor = 'pointer';
        historyBtn.style.transition = 'all 0.2s ease';
        
        historyBtn.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; font-weight:600; color:white; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                <span>${path.title}</span>
                <span style="font-size:0.75rem; color:${isActive ? 'white' : 'var(--primary-hover)'}; font-weight:700; margin-left:0.5rem;">${percentage}%</span>
            </div>
            <div style="width:100%; height:4px; background-color:var(--bg-card); border-radius:99px; margin-top:0.5rem; overflow:hidden;">
                <div style="width:${percentage}%; height:100%; background-color:${isActive ? '#white' : 'var(--primary-hover)'}; transition:width 0.3s ease;"></div>
            </div>
        `;

        // Switch active tracking context when clicking a historical roadmap card
        historyBtn.onclick = () => {
            activePathId = path.id;
            saveAndRefresh();
        };

        historyBox.appendChild(historyBtn);
    });
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

    path.modules.forEach(moduleItem => {
        const moduleCard = document.createElement('div');
        moduleCard.style.backgroundColor = 'var(--bg-card)';
        moduleCard.style.border = '1px solid var(--border-color)';
        moduleCard.style.padding = '1.5rem';
        moduleCard.style.borderRadius = '10px';
        moduleCard.style.marginBottom = '2rem';

        let topicsMarkup = `
            <h3 style="color: var(--primary-hover); margin-bottom: 1.25rem; font-size: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                📦 ${moduleItem.moduleName}
            </h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
        `;

        moduleItem.topics.forEach(topicNode => {
            const isChecked = path.completedTopics.includes(topicNode.id);
            
            topicsMarkup += `
                <div style="display: flex; align-items: flex-start; gap: 1rem; padding: 0.75rem; background-color: var(--bg-dark); border: 1px solid var(--border-color); border-radius: 6px;">
                    <input type="checkbox" id="topic-${topicNode.id}" style="width: 1.2rem; height: 1.2rem; margin-top: 0.2rem; cursor: pointer;"
                           ${isChecked ? 'checked' : ''} onchange="toggleTopicCompletion(${topicNode.id})">
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                            <label for="topic-${topicNode.id}" style="font-weight: 600; cursor: pointer; text-decoration: ${isChecked ? 'line-through' : 'none'}; color: ${isChecked ? 'var(--text-muted)' : 'var(--text-main)'};">
                                ${topicNode.label}
                            </label>
                            <span style="font-size: 0.75rem; background-color: var(--border-color); padding: 2px 6px; border-radius: 4px; color: var(--text-muted);">⏱️ ${topicNode.estimatedHours} hrs</span>
                        </div>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">${topicNode.description}</p>
                        <a href="${topicNode.referenceQuery}" target="_blank" style="display: inline-block; font-size: 0.8rem; color: var(--primary-hover); text-decoration: none; margin-top: 0.5rem;">🔗 Explore Documentation Reference</a>
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
    path.modules.forEach(mod => totalTopicsCount += mod.topics.length);

    const completedCount = path.completedTopics.length;
    const computedPercentage = totalTopicsCount > 0 ? Math.round((completedCount / totalTopicsCount) * 100) : 0;

    document.getElementById('dashboardInlineBarFill').style.width = `${computedPercentage}%`;
    document.getElementById('progressPercentageText').innerText = `${computedPercentage}%`;
}

function saveAndRefresh() {
    localStorage.setItem('pathai_all_saved_paths', JSON.stringify(savedPathsCollection));
    localStorage.setItem('pathai_active_id', activePathId);
    renderHistoryPanel(); // Refresh history panel elements to update percentage counters instantly
    renderActiveWorkspace();
}