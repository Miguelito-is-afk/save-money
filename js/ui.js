// UI RENDERING & CHARTS
let chartInstance = null;

function applySettings() {
    document.body.className = state.settings.darkMode ? 'dark-mode' : 'light-mode';
    document.getElementById('user-display').innerText = state.settings.name;
}

function updateUI() {
    document.getElementById('total-balance').innerText = `₱${state.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('weekly-inc').innerText = `₱${state.income.toLocaleString()}`;
    document.getElementById('streak-count').innerText = `🔥 ${state.streak} Log Streak`;
    
    renderLedger();
    renderGoalsAndAether();
    renderAnalytics();
    if (chartInstance) updateChart();
}

function renderLedger() {
    const body = document.getElementById('history-body');
    body.innerHTML = state.history.slice(0, 8).map(item => `
        <tr>
            <td>${item.icon}</td>
            <td>${item.desc}</td>
            <td style="text-align:right">${item.amount > 0 ? '+' : ''}${item.amount}</td>
        </tr>
    `).join('');
}

function renderGoalsAndAether() {
    const container = document.getElementById('goals-container');
    const adviceEl = document.getElementById('smart-advice');
    
    let totalDailyNeeded = 0;
    let html = state.goals.map(goal => {
        let daysLeft = Math.max(1, Math.ceil((new Date(goal.date) - new Date()) / 86400000));
        let remaining = Math.max(0, goal.target); // Simplified for this view
        totalDailyNeeded += (remaining / daysLeft);
        return `<div class="goal-item">${goal.name}: ₱${goal.target}</div>`;
    }).join('');

    container.innerHTML = html || "No active missions.";
    adviceEl.innerText = `To reach your goals, save ₱${totalDailyNeeded.toFixed(2)} daily.`;
}

function renderAnalytics() {
    const analyticsGrid = document.getElementById('category-analytics');
    analyticsGrid.innerHTML = `<div class="analytic-box">Analysis Online</div>`;
}

function initChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: state.graphData.map((_, i) => i), datasets: [{ label: 'Vector', data: state.graphData, borderColor: '#6366f1' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateChart() {
    chartInstance.data.labels = state.graphData.map((_, i) => i);
    chartInstance.data.datasets[0].data = state.graphData;
    chartInstance.update();
}
