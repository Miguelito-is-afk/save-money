let chartInstance = null;

function updateUI() {
    // Basic Stats
    document.getElementById('total-balance').innerText = `₱${state.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('weekly-inc').innerText = `₱${state.income.toLocaleString()}`;
    document.getElementById('streak-count').innerText = `🔥 ${state.streak} Day Pulse`;
    
    // Level Update
    const levelBadge = document.getElementById('aura-level');
    levelBadge.innerText = `LVL ${state.level}`;
    
    // Calculate Monthly Burn
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const monthlyBurn = state.history
        .filter(t => t.id > thirtyDaysAgo && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    document.getElementById('monthly-burn').innerText = `₱${monthlyBurn.toLocaleString()}`;

    renderLedger();
    renderGoalsAndAether();
    renderAnalytics();
    if (chartInstance) updateChart();
}

function renderGoalsAndAether() {
    const container = document.getElementById('goals-container');
    const adviceEl = document.getElementById('smart-advice');
    
    // Strategic Reserve calculation (20% of fuel)
    const reserveAmount = state.income * (state.savingsPercent / 100);

    if (state.goals.length === 0) {
        container.innerHTML = "<p class='text-muted' style='text-align:center;'>No active missions.</p>";
        adviceEl.innerText = `System optimal. Recommendation: Allocate ₱${reserveAmount.toFixed(2)} to your Strategic Reserve this week.`;
        return;
    }

    let totalDailyNeeded = 0;
    let html = state.goals.map(goal => {
        let daysLeft = Math.max(1, Math.ceil((new Date(goal.date) - new Date()) / 86400000));
        
        // Progress Bar Math: How much of the current balance "covers" this goal?
        // (Simplified: We show progress based on current balance vs target)
        let progress = Math.min(100, (state.balance / goal.target) * 100).toFixed(1);
        let remaining = Math.max(0, goal.target - state.balance); 
        let dailyNeeded = remaining / daysLeft;
        totalDailyNeeded += dailyNeeded;

        return `
            <div class="goal-item animate-in">
                <div class="flex-between">
                    <strong>${goal.name}</strong>
                    <span>₱${goal.target.toLocaleString()}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="flex-between" style="font-size: 0.75rem; color: var(--text-muted);">
                    <span>${progress}% Synced</span>
                    <span>₱${dailyNeeded.toFixed(2)}/day needed</span>
                </div>
            </div>`;
    }).join('');

    container.innerHTML = html;
    
    // Smarter Advisory
    if (state.balance < totalDailyNeeded * 7) {
        adviceEl.innerText = `Tactical Alert: Current assets low. To hit all missions, you must save ₱${totalDailyNeeded.toFixed(2)} daily. Minimize "Burn" in non-essential sectors.`;
    } else {
        adviceEl.innerText = `Condition: Green. Your asset growth vector is healthy. Daily mission allocation: ₱${totalDailyNeeded.toFixed(2)}.`;
    }
}

function renderAnalytics() {
    const analyticsGrid = document.getElementById('category-analytics');
    const categories = {};
    
    state.history.filter(t => t.amount < 0).forEach(t => {
        categories[t.icon] = (categories[t.icon] || 0) + Math.abs(t.amount);
    });

    if (Object.keys(categories).length === 0) {
        analyticsGrid.innerHTML = `<div class="text-muted" style="text-align:center;">No burn data recorded.</div>`;
        return;
    }

    analyticsGrid.innerHTML = Object.entries(categories).map(([icon, amount]) => `
        <div class="analytic-row">
            <span>${icon} Sector</span>
            <strong>₱${amount.toLocaleString()}</strong>
        </div>
    `).join('');
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
