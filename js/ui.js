// AETHER CORE - UI Rendering & Charts
// ui.js
let chartInstance = null;

function applySettings() {
    document.body.className = state.settings.darkMode ? 'dark-mode' : 'light-mode';
    document.getElementById('user-display').innerText = state.settings.name;
    if (chartInstance) {
        chartInstance.options.scales.x.grid.color = state.settings.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        chartInstance.options.scales.y.grid.color = state.settings.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        chartInstance.update();
    }
}

function updateUI() {
    document.getElementById('total-balance').innerText = `₱${state.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('weekly-inc').innerText = `₱${state.income.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('streak-count').innerText = `🔥 ${state.streak} Log Streak`;
    
    const level = Math.max(1, Math.floor(Math.max(0, state.balance) / 500) + 1);
    document.getElementById('aura-level').innerText = `LVL ${level}`;

    renderLedger();
    renderGoalsAndAether();
    renderAnalytics();
    if (chartInstance) updateChart();
}

// AI Advisory Engine
function renderGoalsAndAether() {
    const container = document.getElementById('goals-container');
    const healthEl = document.getElementById('health-score');
    const adviceEl = document.getElementById('smart-advice');
    
    let sortedGoals = [...state.goals].sort((a, b) => b.priority - a.priority);
    let availableBalance = state.balance;
    let totalDailyNeeded = 0;
    let html = "";

    sortedGoals.forEach((goal) => {
        let allocated = Math.max(0, Math.min(availableBalance, goal.target));
        availableBalance -= allocated;
        let progress = (goal.target > 0) ? Math.min((allocated / goal.target) * 100, 100) : 0;
        let remaining = Math.max(0, goal.target - allocated);
        
        let daysLeft = Math.max(1, Math.ceil((new Date(goal.date) - new Date()) / (1000 * 60 * 60 * 24)));
        if (remaining > 0) totalDailyNeeded += (remaining / daysLeft);

        html += `<div class="goal-item"><strong>${goal.name}</strong> - ${Math.round(progress)}% Funded</div>`;
    });

    container.innerHTML = html || "No active missions.";
    adviceEl.innerHTML = `Daily saving required: ₱${totalDailyNeeded.toFixed(2)}`;
}

// Chart Logic
function initChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: ['Start'], datasets: [{ label: 'Asset Vector', data: state.graphData, borderColor: '#6366f1', fill: true }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateChart() {
    chartInstance.data.datasets[0].data = state.graphData;
    chartInstance.update();
}
