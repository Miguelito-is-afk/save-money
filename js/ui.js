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
    
    if (state.goals.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 2rem; color: var(--text-muted);">
                <i class="fas fa-ghost" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>No active missions. All systems nominal.</p>
            </div>`;
        adviceEl.innerHTML = "<strong>NEURAL ADVISORY:</strong> No financial targets detected. Recommend setting a 'Strategic Reserve' goal to build wealth.";
        return;
    }

    let totalDailyNeeded = 0;
    let totalLockedCapital = 0;

    const goalHtml = state.goals.map((goal, index) => {
        const deadline = new Date(goal.date);
        const today = new Date();
        const daysRemaining = Math.max(1, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
        
        // Logical Allocation: How much should be "put away" by now?
        // If the goal is 10 days away and costs ₱100, you should have ₱10/day.
        const dailyReq = goal.target / ((deadline - new Date(goal.createdAt || today)) / 86400000 || daysRemaining);
        const shouldHaveSaved = Math.min(goal.target, dailyReq * Math.max(1, (today - new Date(goal.createdAt || today)) / 86400000));
        
        totalDailyNeeded += (goal.target / daysRemaining);
        totalLockedCapital += goal.target;

        // Calculate visual progress based on total balance vs target
        const progressPercent = Math.min(100, (state.balance / goal.target) * 100).toFixed(1);

        return `
            <div class="goal-card animate-in" style="animation-delay: ${index * 0.1}s">
                <div class="goal-header">
                    <div>
                        <div class="goal-name">${goal.name}</div>
                        <div class="goal-days">${daysRemaining} Days Remaining</div>
                    </div>
                    <div class="allocation-badge">₱${goal.target.toLocaleString()}</div>
                </div>
                
                <div class="neural-progress-container">
                    <div class="neural-progress-fill" style="width: ${progressPercent}%"></div>
                </div>

                <div class="goal-footer">
                    <span style="color: var(--text-muted)">
                        <i class="fas fa-sync"></i> ${progressPercent}% Synced
                    </span>
                    <span style="color: var(--primary); font-weight: 800;">
                        ₱${(goal.target / daysRemaining).toFixed(2)}/day
                    </span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = goalHtml;

    // --- QUANTUM ADVISORY LOGIC ---
    const dailyIncome = state.income / 7; // Weekly income to daily
    const surplus = dailyIncome - totalDailyNeeded;

    if (surplus < 0) {
        adviceEl.innerHTML = `
            <strong style="color: #ff4444;"><i class="fas fa-exclamation-triangle"></i> DEFICIT DETECTED:</strong><br>
            Your missions require ₱${totalDailyNeeded.toFixed(2)}/day, but your income is only ₱${dailyIncome.toFixed(2)}/day. 
            <strong>Action:</strong> Extend deadlines or increase 'Weekly Fuel'.`;
    } else {
        adviceEl.innerHTML = `
            <strong style="color: var(--success);"><i class="fas fa-check-circle"></i> SYSTEM STABLE:</strong><br>
            Allocating ₱${totalDailyNeeded.toFixed(2)} daily to missions. 
            You have a <strong>₱${surplus.toFixed(2)} daily surplus</strong> for non-essential spending.`;
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
