let chartInstance = null;

function applySettings() {
    document.body.className = state.settings.darkMode ? 'dark-mode' : 'light-mode';
    document.getElementById('user-display').innerText = state.settings.name;
    document.getElementById('dark-mode-toggle').checked = state.settings.darkMode;
    document.getElementById('settings-name').value = state.settings.name;
}

function updateUI() {
    document.getElementById('total-balance').innerText = `₱${state.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('weekly-inc').innerText = `₱${state.income.toLocaleString()}`;
    document.getElementById('streak-count').innerText = `🔥 ${state.streak} Day Pulse`;
    
    renderLedger();
    renderGoalsAndAether();
    renderAnalytics();
    if (chartInstance) updateChart();
}

function renderLedger() {
    const body = document.getElementById('history-body');
    if(state.history.length === 0) {
        body.innerHTML = `<tr><td colspan="3" style="text-align:center;">No data logged.</td></tr>`;
        return;
    }
    
    body.innerHTML = state.history.slice(0, 8).map(item => `
        <tr>
            <td>${item.icon}</td>
            <td>${item.desc}</td>
            <td style="text-align:right; color: ${item.amount > 0 ? 'var(--success)' : 'var(--text-main)'}">
                ${item.amount > 0 ? '+' : ''}${item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </td>
        </tr>
    `).join('');
}

function renderGoalsAndAether() {
    const container = document.getElementById('goals-container');
    const adviceEl = document.getElementById('smart-advice');
    
    if (state.goals.length === 0) {
        container.innerHTML = "<p class='text-muted' style='text-align:center;'>No active missions.</p>";
        adviceEl.innerText = "System optimal. Awaiting new tactical directives.";
        return;
    }

    let totalDailyNeeded = 0;
    let html = state.goals.map(goal => {
        let daysLeft = Math.max(1, Math.ceil((new Date(goal.date) - new Date()) / 86400000));
        let remaining = Math.max(0, goal.target); 
        totalDailyNeeded += (remaining / daysLeft);
        return `
            <div class="goal-item flex-between">
                <strong>${goal.name}</strong>
                <span>₱${goal.target.toLocaleString()}</span>
            </div>`;
    }).join('');

    container.innerHTML = html;
    adviceEl.innerText = `To reach your active missions, allocate ₱${totalDailyNeeded.toFixed(2)} daily.`;
}

function renderAnalytics() {
    const analyticsGrid = document.getElementById('category-analytics');
    analyticsGrid.innerHTML = `<div class="analytic-box text-muted" style="text-align:center; padding: 2rem 0;">Analytics Core Online.</div>`;
}

function initChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    
    // Set chart defaults based on theme
    Chart.defaults.color = state.settings.darkMode ? '#94a3b8' : '#64748b';
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: state.graphData.map((_, i) => i), 
            datasets: [{ 
                label: 'Asset Vector', 
                data: state.graphData, 
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: state.settings.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } }
            }
        }
    });
}

function updateChart() {
    chartInstance.data.labels = state.graphData.map((_, i) => i);
    chartInstance.data.datasets[0].data = state.graphData;
    chartInstance.update();
}
