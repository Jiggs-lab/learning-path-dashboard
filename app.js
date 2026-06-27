// State Management
let currentRoadmap = null;
let completedMilestones = [];

// Initialize Dashboard from Local Storage
document.addEventListener('DOMContentLoaded', () => {
    const savedRoadmap = localStorage.getItem('ai_roadmap_data');
    const savedProgress = localStorage.getItem('ai_roadmap_progress');

    if (savedRoadmap) {
        currentRoadmap = JSON.parse(savedRoadmap);
        completedMilestones = savedProgress ? JSON.parse(savedProgress) : [];
        renderDashboard();
    }
});

// Fetch data from Express API backend
async function generateNewPath() {
    const topic = document.getElementById('topicInput').value.trim();
    const level = document.getElementById('levelInput').value;

    if (!topic) return alert('Please enter a topic!');

    try {
        const response = await fetch('/generate-path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, level })
        });
        
        currentRoadmap = await response.json();
        completedMilestones = []; // Reset progress for new path
        
        // Save structurally complete blueprint object data to Local Storage
        localStorage.setItem('ai_roadmap_data', JSON.stringify(currentRoadmap));
        localStorage.setItem('ai_roadmap_progress', JSON.stringify(completedMilestones));
        
        renderDashboard();
    } catch (error) {
        console.error("Error fetching roadmap:", error);
        alert("Failed to build learning roadmap.");
    }
}

// Render complete dashboard interface elements
function renderDashboard() {
    if (!currentRoadmap) return;

    // Show banner container layout components
    document.getElementById('progressBanner').classList.remove('hidden');
    document.getElementById('dashboardTitle').innerText = currentRoadmap.title;
    document.getElementById('totalTimeEstimate').innerText = `Total Target Duration: ~${currentRoadmap.totalEstimatedHours || 0} Hours`;

    const container = document.getElementById('roadmapContainer');
    container.innerHTML = '';

    currentRoadmap.milestones.forEach((milestone) => {
        const isChecked = completedMilestones.includes(milestone.id);
        
        // Generate UI resource badges dynamically
        const resourceBadges = milestone.resources ? milestone.resources.map(res => `
            <a href="${res.query}" target="_blank" class="inline-flex items-center text-xs bg-gray-700 hover:bg-gray-600 text-indigo-300 font-medium px-2.5 py-1 rounded border border-gray-600 transition-colors">
                🔍 ${res.type}: ${res.label}
            </a>
        `).join('') : '';

        // Build milestone checklist elements
        const elementCard = document.createElement('div');
        elementCard.className = `p-5 bg-gray-800 border rounded-lg transition-all ${isChecked ? 'border-indigo-500/50 opacity-75' : 'border-gray-700'}`;
        elementCard.innerHTML = `
            <div class="flex items-start gap-4">
                <input type="checkbox" id="m-${milestone.id}" ${isChecked ? 'checked' : ''} 
                       onchange="toggleMilestone(${milestone.id})" 
                       class="mt-1.5 h-5 w-5 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500">
                <div class="flex-1">
                    <div class="flex justify-between items-center mb-1">
                        <h3 class="text-lg font-semibold ${isChecked ? 'line-through text-gray-400' : 'text-white'}">${milestone.topic}</h3>
                        <span class="text-xs font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-700">⏱️ ${milestone.estimatedHours} hrs</span>
                    </div>
                    <p class="text-sm text-gray-400 mb-3">${milestone.description}</p>
                    <div class="flex flex-wrap gap-2">${resourceBadges}</div>
                </div>
            </div>
        `;
        container.appendChild(elementCard);
    });

    calculateProgress();
}

// Track checked state change parameters
function toggleMilestone(id) {
    if (completedMilestones.includes(id)) {
        completedMilestones = completedMilestones.filter(mId => mId !== id);
    } else {
        completedMilestones.push(id);
    }
    localStorage.setItem('ai_roadmap_progress', JSON.stringify(completedMilestones));
    renderDashboard(); // Re-render updates colors & strike-throughs cleanly
}

// Compute dynamic mathematical scaling output configurations
function calculateProgress() {
    const total = currentRoadmap.milestones.length;
    if (total === 0) return;

    const checked = completedMilestones.length;
    const percentage = Math.round((checked / total) * 100);

    // Write metric updates dynamically into interface DOM trees
    document.getElementById('progressBar').style.width = `${percentage}%`;
    document.getElementById('progressText').innerText = `${percentage}%`;
}