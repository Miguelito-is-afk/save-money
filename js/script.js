// AETHER CORE v4.0 - Quantum Neural Engine
// Lead Architect: Miguel | PSHS-CRC
// Multi-Goal DRA (Dynamic Resource Allocation) & Mutable Ledger

// Data Migration & Initialization
function initializeState() {
    let saved = JSON.parse(localStorage.getItem('aetherCoreDataV4'));
    
    // Legacy Migration (from v3 to v4)
    if (!saved) {
        let oldData = JSON.parse(localStorage.getItem('aetherCoreData'));
        if (oldData) {
            saved = oldData;
            saved.goals = [];
            if (saved.goal && saved.goal.target > 0) {
                saved.goals.push({ id: Date.now(), name: saved.goal.name, target: saved.goal.target, date: saved.goal.date || "2026-12-31", priority: 2 });
            }
            delete saved.goal;
        }
    }

    // Default fresh state
    return saved || {
        balance: 0,
        history: [],
        goals: [
            // Defaults based on typical usage context
            { id: 101, name: "Monthsary Gift (8th)", target: 500, priority: 3, date: "2026-05-08" },
            { id: 102, name: "Roblox Premium", target: 500, priority: 1, date: "2026-06-01" }
        ],
        income: 1000,
        streak: 0,
        graphData: [0],
        settings: { darkMode: true, name: "MIGUEL | PSHS-CRC" }
    };
}

let state = initializeState();
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    applySettings();
    initChart();
    recalculateBalance(); // Ensure everything is mathematically sound on load
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

// ------------------ UI LOGIC ------------------

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

// ------------------ MUTABLE LEDGER LOGIC ------------------

document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc').value;

    const entryAmount = type === 'income' ? amount : -amount;

    state.history.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        desc: desc,
        amount: entryAmount,
        icon: type === 'income' ? '💰' : detectCategory(desc)
    });

    if (type === 'income') state.streak++;
    e.target.reset();
    
    recalculateBalance(); // Recalc everything instead of blindly adding
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
        entry.amount = parseFloat(document.getElementById('edit-amount').value);
        entry.icon = entry.amount > 0 ? '💰' : detectCategory(entry.desc);
        recalculateBalance();
        save();
        closeEditModal();
    }
});

function deleteEntry() {
    const id = parseInt(document.getElementById('edit-id').value);
    state.history = state.history.filter(e => e.id !== id);
    recalculateBalance();
    save();
    closeEditModal();
}

// Ensures balance and graph data always match exact ledger history
function recalculateBalance() {
    state.balance = state.history.reduce((sum, item) => sum + item.amount, 0);
    
    // Rebuild graph
    state.graphData = [0];
    let running = 0;
    const chrono = [...state.history].reverse();
    chrono.forEach(t => { 
        running += t.amount; 
        state.graphData.push(running); 
    });
}

// ------------------ DRAE (MULTI-GOAL LOGIC) ------------------

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

    // Log it as an expense (asset acquired)
    state.history.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        desc: `🏆 SECURED: ${goal.name}`,
        amount: -goal.target,
        icon: '🎯'
    });

    // Remove goal
    state.goals.splice(goalIndex, 1);
    
    recalculateBalance();
    save();
    alert(`System Alert: Mission [${goal.name}] Accomplished. Funds deducted.`);
}

function deleteGoal(id) {
    if(confirm("Abort this mission? Data will be deleted.")) {
        state.goals = state.goals.filter(g => g.id !== id);
        save();
    }
}

// ------------------ CORE UPDATES & RENDERING ------------------

function editStat(type) {
    let newVal = prompt(`Update Configuration [${type.toUpperCase()}]:`, state[type]);
    if (newVal !== null && !isNaN(newVal)) {
        state[type] = parseFloat(newVal);
        save();
    }
}

function save() {
    localStorage.setItem('aetherCoreDataV4', JSON.stringify(state));
    updateUI();
}

function renderGoalsAndAether() {
    const container = document.getElementById('goals-container');
    const healthEl = document.getElementById('health-score');
    const adviceEl = document.getElementById('smart-advice');
    
    // GOAL-LESS OPERATION (Free floating mode)
    if (state.goals.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted);"><i class="fas fa-infinity" style="font-size:2rem; margin-bottom:1rem;"></i><br>Free-Floating Asset Mode.<br>Accumulate wealth for future allocation.</div>`;
        healthEl.innerText = "ACCUMULATING";
        healthEl.style.color = "var(--primary)";
        adviceEl.innerText = `No active missions. Surplus funds are building your general safety net. Liquid Assets: ₱${state.balance.toFixed(2)}`;
        return;
    }

    // SORT BY PRIORITY (3 = High, 1 = Low), then by nearest date
    let sortedGoals = [...state.goals].sort((a, b) => {
        if(b.priority !== a.priority) return b.priority - a.priority;
        return new Date(a.date) - new Date(b.date);
    });

    let availableBalance = state.balance;
    let html = "";
    let overallHealth = "STABLE";
    let closestAdvice = "";

    sortedGoals.forEach((goal, index) => {
        // Allocation logic
        let allocated = Math.min(availableBalance, goal.target);
        allocated = Math.max(0, allocated); // Prevent negative allocation
        availableBalance -= allocated;
        
        let progress = Math.min((allocated / goal.target) * 100, 100);
        let remaining = goal.target - allocated;

        let priorityLabel = goal.priority === 3 ? "badge-high" : (goal.priority === 2 ? "badge-med" : "badge-low");
        let priorityText = goal.priority === 3 ? "HIGH" : (goal.priority === 2 ? "MED" : "LOW");

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

        // Set primary advice based on top priority goal
        if(index === 0 && remaining > 0) {
            const daysLeft = Math.ceil((new Date(goal.date) - new Date()) / (1000 * 60 * 60 * 24));
            if(daysLeft > 0) {
                let daily = remaining / daysLeft;
                closestAdvice = `Focus: [${goal.name}]. Save ₱${daily.toFixed(2)} daily to secure.`;
                if(daily > state.income/7) overallHealth = "UNSTABLE";
            } else {
                closestAdvice = `Temporal breach on [${goal.name}]. Recalculate vectors.`;
                overallHealth = "CRITICAL";
            }
        } else if (index === 0 && remaining <= 0) {
            closestAdvice = `Priority Target [${goal.name}] is ready for acquisition.`;
            overallHealth = "MAX RESONANCE";
        }
    });

    container.innerHTML = html;
    
    healthEl.innerText = overallHealth;
    if(overallHealth === "UNSTABLE") healthEl.style.color = "var(--warning)";
    else if(overallHealth === "CRITICAL") healthEl.style.color = "var(--danger)";
    else if(overallHealth === "MAX RESONANCE") healthEl.style.color = "var(--success)";
    else healthEl.style.color = "var(--primary)";

    adviceEl.innerText = closestAdvice;
}

function renderAnalytics() {
    // Get last 30 days of expenses
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentExpenses = state.history.filter(t => t.amount < 0 && new Date(t.date) >= thirtyDaysAgo);
    
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
        return;
    }

    // Sort categories by highest spend
    const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0,4);
    
    analyticsGrid.innerHTML = sortedCats.map(([icon, amount]) => `
        <div class="analytic-box">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${icon}</div>
            <strong style="color: var(--danger)">₱${amount.toFixed(0)}</strong>
        </div>
    `).join('');

    // Update burn rate text on advisory
    const burnText = document.getElementById('burn-rate-display');
    if(recentExpenses.length > 2) {
        const avgBurn = totalBurn / 30; // rough daily
        burnText.innerHTML = `<i class="fas fa-fire"></i> Est. Burn Rate: ₱${avgBurn.toFixed(2)} / day`;
        burnText.style.color = avgBurn > (state.income / 7) ? '#fca5a5' : '#86efac';
    } else {
        burnText.innerText = "Awaiting more expense data.";
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
    
    const level = Math.max(1, Math.floor(state.balance / 500) + 1);
    document.getElementById('aura-level').innerText = `LVL ${level}`;

    renderLedger();
    renderGoalsAndAether();
    renderAnalytics();
    if (chartInstance) updateChart();
}

// ------------------ GRAPHICS ENGINE ------------------

function updateChart() {
    chartInstance.data.labels = state.history.slice(0, 15).reverse().map(i => i.date) || ['Sync'];
    chartInstance.data.datasets[0].data = state.graphData.slice(-15);
    chartInstance.update('active'); 
}

function initChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sync'],
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
    downloadAnchorNode.setAttribute("download", `AETHER_v4_BACKUP_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

document.getElementById('clear-data').addEventListener('click', () => {
    if (confirm("WARNING: Initiating total system purge. All data will be destroyed. Proceed?")) {
        localStorage.clear();
        location.reload();
    }
});
