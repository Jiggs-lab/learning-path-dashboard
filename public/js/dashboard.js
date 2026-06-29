let savedPathsCollection = [];
let activePathId = null;

document.addEventListener('DOMContentLoaded', () => {
    const retainedPaths = localStorage.getItem('pathai_all_saved_paths');
    const retainedActiveId = localStorage.getItem('pathai_active_id');

    if (retainedPaths) {
        savedPathsCollection = JSON.parse(retainedPaths);
        activePathId = retainedActiveId ? parseInt(retainedActiveId) : null;
        if (activePathId) renderActiveWorkspace();
    }
});

async function triggerPathGeneration() {
    const topic = document.getElementById('targetTopic').value.trim();
    const level = document.getElementById('targetLevel').value;

    if (!topic) return alert('Please enter a topic!');

    document.getElementById('roadmapRenderBox').innerHTML = '<h3 style="text-align:center;">🤖 Assembling AI Path Matrix...</h3>';

    try {
        const response = await fetch('/generate-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, level })
        });
        const targetData = await response.json();

        const structuredNode = {
            id: Date.now(),
            title: targetData.title,
            milestones: targetData.milestones,
            completedIndices: []
        };

        savedPathsCollection.push(structuredNode);
        activePathId = structuredNode.id;
        saveAndRefresh();
    } catch (err) {
        document.getElementById('roadmapRenderBox').innerHTML = '<h3>Failed to generate roadmap.</h3>';
    }
}

function renderActiveWorkspace() {
    const path = savedPathsCollection.find(p => p.id === activePathId);
    if (!path) return;

    document.getElementById('progressSectionCard').style.display = 'block';
    document.getElementById('activePathTitle').innerText = path.title;

    const box = document.getElementById('roadmapRenderBox');
    box.innerHTML = '';

    path.milestones.forEach(m => {
        const isChecked = path.completedIndices.includes(m.id);
        const node = document.createElement('div');
        node.className = 'milestone-node';
        node.innerHTML = `
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleMilestone(${m.id})">
            <div>
                <h4>${m.topic} (${m.estimatedHours} hrs)</h4>
                <p style="color:var(--text-muted); font-size:0.9rem;">${m.description}</p>
            </div>
        `;
        box.appendChild(node);
    });
    calculateMetrics();
}

function toggleMilestone(id) {
    const path = savedPathsCollection.find(p => p.id === activePathId);
    if (path.completedIndices.includes(id)) {
        path.completedIndices = path.completedIndices.filter(i => i !== id);
    } else { path.completedIndices.push(id); }
    saveAndRefresh();
}

function calculateMetrics() {
    const path = savedPathsCollection.find(p => p.id === activePathId);
    const pct = path.milestones.length ? Math.round((path.completedIndices.length / path.milestones.length) * 100) : 0;
    document.getElementById('dashboardInlineBarFill').style.width = `${pct}%`;
    document.getElementById('progressPercentageText').innerText = `${pct}%`;
}

function saveAndRefresh() {
    localStorage.setItem('pathai_all_saved_paths', JSON.stringify(savedPathsCollection));
    localStorage.setItem('pathai_active_id', activePathId);
    renderActiveWorkspace();
}