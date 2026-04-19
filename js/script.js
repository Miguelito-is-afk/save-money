// AETHER CORE v5.0 - Full AI Quantum Build
// Multi-Goal DRA & Advanced Financial Directives

function initializeState() {
    let saved;
    try {
        saved = JSON.parse(localStorage.getItem('aetherCoreDataV5'));
    } catch (e) {
        console.error("Corrupted save detected. Resetting to safe state...");
        saved = null;
    }
    
    // Completely blank slate for user customization
    const defaultState = {
        balance: 0,
        history: [],
        goals: [], 
        income: 1000, // Expected weekly income
        streak: 0,
        graphData: [0],
        settings: { darkMode: true, name: "MIGUEL | PSHS-CRC" }
    };

    if (!saved) return defaultState;

    saved.history = saved.history || [];
    saved.goals = saved.goals || [];
    saved.settings = saved.settings || defaultState.settings;
    saved.graphData = saved.graphData || [0];
    
    return saved;
}

let state = initializeState();
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    applySettings();
    initChart();
    recalculateBalance(); 
    updateUI();
});

// AI CATEGORIZATION ENGINE
function detectCategory(desc) {
    const d = desc.toLowerCase();
    if (d.includes('food') || d.includes('lunch') || d.includes('snack') || d.includes('burger')) return '🍔';
    if (d.includes('fare') || d.includes('jeep') || d.includes('transpo') || d.includes('trike')) return '🚙';
    if (d.includes('codm') || d.includes('roblox') || d.includes('game') || d.includes('cp') || d.includes('premium')) return '🎮';
    if (d.includes('school') || d.includes('print') || d.includes('project') || d.includes('book')) return '📚';
    if (d.includes('gift') || d.includes('monthsary') || d.includes('date')) return '💝';
    return '💳'; 
}

// ------------------ UI & SETTINGS ------------------

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('active');
    if(modal.classList.contains('active')) {
        document.getElementById('settings-name').value = state.settings.name;
        document.getElementById('dark-mode-toggle').checked = state.settings.darkMode;
    }
}

function toggleGoalModal() {
    document.getElementById('goal-modal').classList.toggle('active');
}

function saveSettings() {
    state.settings.name = document.getElementById('settings-name').value || "MIGUEL";
    state.settings.darkMode = document.getElementById('dark-mode-toggle').checked;
    applySettings();
    save();
    toggleSettings();
}

function applySettings() {
    document.body.className = state.settings.darkMode ? 'dark-mode' : 'light-mode';
    document.getElementById('user-display').innerText = state.settings.name;
    if (chartInstance) {
        chartInstance.options.scales.x.grid.color = state.settings.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        chartInstance.options.scales.y.grid.color = state.settings.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        chartInstance.update();
    }
}

// ------------------ LEDGER LOGIC ------------------

document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc').value;

    const entryAmount = type === 'income' ? amount : -amount;

    state.history.unshift({
        id: Date.now(),
        timestamp: Date.now(),
        date: new Date().toLocaleDateString(),
        desc: desc,
        amount: entryAmount,
        icon: type === 'income' ? '💰' : detectCategory(desc)
    });

    if (type === 'income') state.streak++;
    e.target.reset();
    
    recalculateBalance(); 
    save();
});

function openEditModal(id) {
    const entry = state.history.find(e => e.id === id);
    if(!entry) return;
    document.getElementById('edit-id').value = entry.id;
    document.getElementById('edit-desc').value = entry.desc;
    document.getElementById('edit-amount').value = entry.amount;
    document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
}

document.getElementById('edit-entry-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);
    const entry = state.history.find(e => e.id === id);
    if(entry) {
        entry.desc = document.getElementById('edit-desc').value;
        const newAmount = parseFloat(document.getElementById('edit-amount').value);
        if(!isNaN(newAmount)) {
            entry.amount = newAmount;
            entry.icon = entry.amount > 0 ? '💰' : detectCategory(entry.desc);
            recalculateBalance();
            save();
            closeEditModal();
        }
    }
});

function deleteEntry() {
    const id = parseInt(document.getElementById('edit-id').value);
    state.history = state.history.filter(e => e.id !== id);
    recalculateBalance();
    save();
    closeEditModal();
}

function recalculateBalance() {
    state.balance = state.history.reduce((sum, item) => sum + item.amount, 0);
    state.graphData = [0];
    let running = 0;
    const chrono = [...state.history].reverse();
    chrono.forEach(t => { 
        running += t.amount; 
        state.graphData.push(running); 
    });
}

// ------------------ GOAL & ADVISORY ENGINE ------------------

document.getElementById('new-goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.goals.push({
        id: Date.now(),
        name: document.getElementById('goal-name').value,
        target: parseFloat(document.getElementById('goal-target').value),
        date: document.getElementById('goal-date').value,
        priority: parseInt(document.getElementById('goal-priority').value)
    });
    save();
    toggleGoalModal();
    e.target.reset();
});

function redeemGoal(id) {
    const goalIndex = state.goals.findIndex(g => g.id === id);
    if(goalIndex === -1) return;
    const goal = state.goals[goalIndex];

    state.history.unshift({
        id: Date.now(),
        timestamp: Date.now(),
        date: new Date().toLocaleDateString(),
        desc: `🏆 SECURED: ${goal.name}`,
        amount: -goal.target,
        icon: '🎯'
    });

    state.goals.splice(goalIndex, 1);
    recalculateBalance();
    save();
}

function deleteGoal(id) {
    if(confirm("Abort this mission? Data will be deleted.")) {
        state.goals = state.goals.filter(g => g.id !== id);
        save();
    }
}

// The Core AI Advisory Logic
function renderGoalsAndAether() {
    const container = document.getElementById('goals-container');
    const healthEl = document.getElementById('health-score');
    const adviceEl = document.getElementById('smart-advice');
    
    // Sort logic
    let sortedGoals = [...state.goals].sort((a, b) => {
        if(b.priority !== a.priority) return b.priority - a.priority;
        return new Date(a.date) - new Date(b.date);
    });

    let availableBalance = state.balance;
    let html = "";
    
    let totalDailyNeeded = 0;
    let missionsReady = 0;

    sortedGoals.forEach((goal) => {
        let allocated = Math.max(0, Math.min(availableBalance, goal.target));
        availableBalance -= allocated;
        
        let progress = (goal.target > 0) ? Math.min((allocated / goal.target) * 100, 100) : 0;
        let remaining = Math.max(0, goal.target - allocated);

        let priorityLabel = goal.priority === 3 ? "badge-high" : (goal.priority === 2 ? "badge-med" : "badge-low");
        let priorityText = goal.priority === 3 ? "HIGH" : (goal.priority === 2 ? "MED" : "LOW");

        if (remaining > 0) {
            let daysLeft = Math.ceil((new Date(goal.date) - new Date()) / (1000 * 60 * 60 * 24));
            daysLeft = Math.max(1, daysLeft); // Prevent division by zero
            totalDailyNeeded += (remaining / daysLeft);
        } else {
            missionsReady++;
        }

        let actionBtn = remaining <= 0 
            ? `<button onclick="redeemGoal(${goal.id})" class="btn-primary hover-glow" style="margin-top: 10px;">REDEEM ASSET</button>`
            : ``;

        html += `
            <div class="goal-item animate-in hover-lift-slight">
                <div class="goal-header">
                    <strong>${goal.name}</strong>
                    <div>
                        <span class="${priorityLabel}">${priorityText}</span>
                        <button onclick="deleteGoal(${goal.id})" class="text-btn hover-scale" style="margin-left: 10px; font-size:1rem;">&times;</button>
                    </div>
                </div>
                <div class="progress-wrapper">
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-labels">
                        <span>${Math.round(progress)}% Funded</span>
                        <span>₱${remaining.toLocaleString(undefined, {minimumFractionDigits:2})} left</span>
                    </div>
                </div>
                ${actionBtn}
            </div>
        `;
    });

    container.innerHTML = html || `<div style="text-align:center; padding: 2rem; color: var(--text-muted);">No active missions. Add a goal to start DRA allocation.</div>`;
    
    // --- AI CALCULATIONS & READOUT ---
    const dailyIncome = state.income / 7;
    const baseSavingsTarget = dailyIncome * 0.20; // 20% rule
    const safeToSpend = dailyIncome - Math.max(baseSavingsTarget, totalDailyNeeded);
    
    // Determine Overall Health
    let healthStatus = "OPTIMAL";
    let healthColor = "var(--success)";
    
    if (state.balance < 0) {
        healthStatus = "CRITICAL DEBT";
        healthColor = "var(--danger)";
    } else if (totalDailyNeeded > dailyIncome) {
        healthStatus = "DEFICIT VECTOR";
        healthColor = "var(--danger)";
    } else if (totalDailyNeeded + baseSavingsTarget > dailyIncome) {
        healthStatus = "TIGHT MARGINS";
        healthColor = "var(--warning)";
    } else if (missionsReady > 0) {
        healthStatus = "MISSION READY";
        healthColor = "var(--success)";
    }

    healthEl.innerText = healthStatus;
    healthEl.style.color = healthColor;

    // Generate Full Advisory Report
    let advisoryHTML = `<ul style="list-style:none; padding:0; margin:0; line-height: 1.6; font-size: 0.95rem;">`;
    
    // 1. General Savings Directive
    advisoryHTML += `<li><i class="fas fa-piggy-bank" style="color:var(--accent); width:20px;"></i> <strong>Base Protocol:</strong> Save at least 20% of income (₱${baseSavingsTarget.toFixed(2)}/day or ₱${(baseSavingsTarget*7).toFixed(2)}/week) for long-term vaulting.</li>`;
    
    // 2. Goal Directive
    if (state.goals.length > 0) {
        advisoryHTML += `<li><i class="fas fa-bullseye" style="color:var(--primary); width:20px;"></i> <strong>Mission Requirements:</strong> You must save exactly <strong>₱${totalDailyNeeded.toFixed(2)} daily</strong> to hit all your active deadlines.</li>`;
    }

    // 3. Spending Allowance
    if (safeToSpend > 0) {
        advisoryHTML += `<li><i class="fas fa-check-circle" style="color:var(--success); width:20px;"></i> <strong>Safe Daily Allowance:</strong> You can safely spend up to <strong>₱${safeToSpend.toFixed(2)}</strong> per day without jeopardizing goals or base savings.</li>`;
    } else {
        advisoryHTML += `<li><i class="fas fa-exclamation-triangle" style="color:var(--danger); width:20px;"></i> <strong>System Warning:</strong> Required savings exceed your income vector. Reduce spending instantly, extend mission deadlines, or increase income streams.</li>`;
    }

    advisoryHTML += `</ul>`;
    adviceEl.innerHTML = advisoryHTML;
}

function renderAnalytics() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentExpenses = state.history.filter(t => {
        const time = t.timestamp ? t.timestamp : new Date(t.date).getTime();
        return t.amount < 0 && time >= thirtyDaysAgo;
    });
    
    let totalBurn = 0;
    let categories = {};

    recentExpenses.forEach(t => {
        totalBurn += Math.abs(t.amount);
        categories[t.icon] = (categories[t.icon] || 0) + Math.abs(t.amount);
    });

    document.getElementById('monthly-burn').innerText = `₱${totalBurn.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

    const analyticsGrid = document.getElementById('category-analytics');
    if(Object.keys(categories).length === 0) {
        analyticsGrid.innerHTML = `<div style="grid-column: span 2; text-align:center; color: var(--text-muted);">Insufficient data to run analysis.</div>`;
    } else {
        const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0,4);
        analyticsGrid.innerHTML = sortedCats.map(([icon, amount]) => `
            <div class="analytic-box">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${icon}</div>
                <strong style="color: var(--danger)">₱${amount.toFixed(0)}</strong>
            </div>
        `).join('');
    }

    const burnText = document.getElementById('burn-rate-display');
    if(recentExpenses.length > 2) {
        const avgBurn = totalBurn / 30; 
        burnText.innerHTML = `<i class="fas fa-fire"></i> Daily Burn: ₱${avgBurn.toFixed(2)}`;
        burnText.style.color = (state.income > 0 && avgBurn > (state.income / 7)) ? '#ef4444' : '#10b981';
    } else {
        burnText.innerText = "Awaiting more expense data.";
        burnText.style.color = 'var(--text-muted)';
    }
}

function renderLedger() {
    const body = document.getElementById('history-body');
    body.innerHTML = state.history.slice(0, 10).map(item => `
        <tr class="table-row-hover hover-lift-slight">
            <td style="font-size: 1.2rem;">${item.icon || '💳'}</td>
            <td><strong>${item.desc}</strong><br><small style="color: var(--text-muted)">${item.date}</small></td>
            <td style="text-align:right; font-weight: 700; color: ${item.amount > 0 ? 'var(--success)' : 'var(--text-main)'}">
                ${item.amount > 0 ? '+' : ''}₱${Math.abs(item.amount).toFixed(2)}
            </td>
            <td style="width: 40px; text-align:center;">
                <i class="fas fa-pen action-icon" onclick="openEditModal(${item.id})"></i>
            </td>
        </tr>
    `).join('');
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

// ------------------ DATA UTILS & CHART ------------------

function editStat(type) {
    let newVal = prompt(`Update Configuration [${type.toUpperCase()}]:`, state[type]);
    if (newVal !== null) {
        let parsedVal = parseFloat(newVal);
        if (!isNaN(parsedVal) && parsedVal >= 0) {
            state[type] = parsedVal;
            save();
        } else {
            alert("Invalid input. Please enter a valid number.");
        }
    }
}

function save() {
    localStorage.setItem('aetherCoreDataV5', JSON.stringify(state));
    updateUI();
}

function updateChart() {
    if(!chartInstance) return;
    const sliceLimit = Math.min(15, state.history.length);
    const historySlice = state.history.slice(0, sliceLimit).reverse();
    const labels = historySlice.length > 0 ? ['Start', ...historySlice.map(i => i.date)] : ['Start'];
    const dataSlice = state.graphData.slice(-(sliceLimit + 1));

    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = dataSlice;
    chartInstance.update(); 
}

function initChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Start'],
            datasets: [{
                label: 'Asset Vector',
                data: state.graphData,
                borderColor: '#6366f1',
                borderWidth: 3,
                tension: 0.4, 
                fill: true,
                backgroundColor: gradient,
                pointBackgroundColor: '#a855f7',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            animation: { duration: 400, easing: 'easeOutQuart' },
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(0,0,0,0.05)' } }
            }
        }
    });
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `AETHER_v5_BACKUP_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

document.getElementById('clear-data').addEventListener('click', () => {
    if (confirm("WARNING: Initiating total system purge. All data will be destroyed. Proceed?")) {
        localStorage.removeItem('aetherCoreDataV5');
        location.reload();
    }
});
