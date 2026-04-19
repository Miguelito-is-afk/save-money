// AETHER CORE v3.0 - Quantum Neural Engine
// Hardware-Optimized for Dimensity processing

let state = JSON.parse(localStorage.getItem('aetherCoreData')) || {
    balance: 0,
    history: [],
    goals: [],
    income: 800,
    streak: 0,
    graphData: [0],
    settings: { darkMode: false, name: "MIGUEL | PSHS-CRC" }
};

let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    applySettings();
    initChart();
    updateUI();
});

// AI CATEGORIZATION ENGINE
function detectCategory(desc) {
    const d = desc.toLowerCase();
    if (d.includes('food') || d.includes('lunch') || d.includes('snack') || d.includes('burger')) return '🍔';
    if (d.includes('fare') || d.includes('jeep') || d.includes('transpo') || d.includes('trike')) return '🚙';
    if (d.includes('codm') || d.includes('roblox') || d.includes('game') || d.includes('cp')) return '🎮';
    if (d.includes('school') || d.includes('print') || d.includes('project') || d.includes('book')) return '📚';
    if (d.includes('clothes') || d.includes('shirt') || d.includes('shoes')) return '👕';
    return '💳'; // Default
}

// UI LOGIC
function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 400); // Wait for fade out
    } else {
        modal.style.display = 'flex';
        // Force reflow
        void modal.offsetWidth;
        modal.classList.add('active');
        document.getElementById('settings-name').value = state.settings.name;
        document.getElementById('dark-mode-toggle').checked = state.settings.darkMode;
    }
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

// REDEMPTION PROTOCOL
function redeemGoal() {
    const cost = state.goal.target;
    state.balance -= cost;
    
    state.history.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        desc: `🏆 SECURED: ${state.goal.name}`,
        amount: -cost,
        icon: '🎯'
    });

    state.goal = { name: "VOID", target: 0, date: null, buffer: 0 };
    state.graphData.push(state.balance);
    
    save();
    alert("System Overload: Mission Accomplished. Asset acquired.");
}

// TRANSACTION ENTRY
document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc').value;

    state.history.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        desc: desc,
        amount: type === 'income' ? amount : -amount,
        icon: type === 'income' ? '💰' : detectCategory(desc)
    });

    state.balance += (type === 'income' ? amount : -amount);
    state.graphData.push(state.balance);
    if (type === 'income') state.streak++;
    
    save();
    e.target.reset();
});

document.getElementById('goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.goal = {
        name: document.getElementById('goal-name').value,
        target: parseFloat(document.getElementById('goal-target').value),
        date: document.getElementById('goal-date').value,
        buffer: parseInt(document.getElementById('goal-buffer').value) || 0
    };
    save();
});

// SYSTEM CORE UPDATES
function editStat(type) {
    let newVal = prompt(`Update Configuration [${type.toUpperCase()}]:`, type === 'balance' ? state.balance : state.income);
    if (newVal !== null && !isNaN(newVal)) {
        state[type] = parseFloat(newVal);
        save();
    }
}

function save() {
    localStorage.setItem('aetherCoreData', JSON.stringify(state));
    updateUI();
}

function calculateBurnRate() {
    // Look at last 7 transactions that were expenses
    const recentExpenses = state.history.filter(t => t.amount < 0).slice(0, 10);
    const totalBurn = recentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const burnText = document.getElementById('burn-rate-display');
    
    if (recentExpenses.length > 2) {
        const avgBurn = totalBurn / recentExpenses.length;
        burnText.innerHTML = `<i class="fas fa-fire"></i> Est. Burn Rate: ₱${avgBurn.toFixed(2)} / entry`;
        burnText.style.color = avgBurn > (state.income / 7) ? '#fca5a5' : '#86efac';
    } else {
        burnText.innerText = "Insufficient data to calculate burn rate.";
        burnText.style.color = "white";
    }
}

function updateUI() {
    // Text Data
    document.getElementById('total-balance').innerText = `₱${state.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('weekly-inc').innerText = `₱${state.income.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('buffer-display').innerText = `${state.goal.buffer} Days`;
    document.getElementById('streak-count').innerText = `🔥 ${state.streak} Day Pulse`;
    
    // Aura Gamification (Level up every 500 saved)
    const level = Math.max(1, Math.floor(state.balance / 500) + 1);
    document.getElementById('aura-level').innerText = `LVL ${level}`;

    renderLedger();
    calculateAetherLogic();
    calculateBurnRate();
    if (chartInstance) updateChart();
}

function calculateAetherLogic() {
    const container = document.getElementById('goals-list-container');
    const adviceEl = document.getElementById('smart-advice');
    
    if (state.goals.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:1rem; opacity:0.5;">No active missions. System standby.</p>`;
        return;
    }

    let totalDailyRequired = 0;

    container.innerHTML = state.goals.map((goal, index) => {
        const daysLeft = Math.max(1, Math.ceil((new Date(goal.date) - new Date()) / 86400000));
        const progress = Math.min(100, (state.balance / goal.target) * 100).toFixed(1);
        const daily = (goal.target / daysLeft);
        totalDailyRequired += daily;

        return `
            <div class="multi-goal-item" style="margin-bottom: 1.5rem; border-left: 3px solid var(--primary); padding-left: 1rem;">
                <div class="flex-between">
                    <strong>${goal.name}</strong>
                    <button onclick="deleteGoal(${index})" class="icon-btn" style="color:var(--danger)"><i class="fas fa-times"></i></button>
                </div>
                <div class="progress-container" style="height: 8px; margin: 8px 0;">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="flex-between" style="font-size: 0.7rem; font-weight: 700;">
                    <span>${progress}% SYNCED</span>
                    <span>₱${daily.toFixed(2)} / DAY</span>
                </div>
            </div>
        `;
    }).join('');

    // Update the Quantum Advisory
    const weeklyBudget = state.income;
    const dailyIncome = weeklyBudget / 7;
    
    if (totalDailyRequired > dailyIncome) {
        adviceEl.innerHTML = `<span style="color:var(--danger)">DEFICIT DETECTED:</span> Missions require ₱${totalDailyRequired.toFixed(2)}/day. Your fuel is only ₱${dailyIncome.toFixed(2)}/day. Extend your deadlines!`;
    } else {
        adviceEl.innerHTML = `ALLOCATION STABLE: Total mission cost is ₱${totalDailyRequired.toFixed(2)}/day. You have ₱${(dailyIncome - totalDailyRequired).toFixed(2)} surplus daily.`;
    }
}

// Add function to delete goals
function deleteGoal(index) {
    state.goals.splice(index, 1);
    save();
}

// Update the Goal Form Listener
document.getElementById('goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const newGoal = {
        name: document.getElementById('goal-name').value,
        target: parseFloat(document.getElementById('goal-target').value),
        date: document.getElementById('goal-date').value
    };
    state.goals.push(newGoal);
    save();
    e.target.reset();
});


function renderLedger() {
    const body = document.getElementById('history-body');
    body.innerHTML = state.history.slice(0, 10).map(item => `
        <tr class="table-row-hover">
            <td style="font-size: 1.2rem;">${item.icon || '💳'}</td>
            <td>
                <strong>${item.desc}</strong><br>
                <small style="color: var(--text-muted)">${item.date}</small>
            </td>
            <td style="text-align:right; font-weight: 700; color: ${item.amount > 0 ? 'var(--success)' : 'var(--text-main)'}">
                ${item.amount > 0 ? '+' : ''}₱${Math.abs(item.amount).toFixed(2)}
            </td>
            <td style="text-align:right;">
                <button onclick="editTransaction('${item.id}')" class="icon-btn" style="padding: 4px 8px;"><i class="fas fa-pen"></i></button>
                <button onclick="deleteTransaction('${item.id}')" class="icon-btn" style="color:var(--danger); padding: 4px 8px;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// GRAPHICS ENGINE
function updateChart() {
    chartInstance.data.labels = state.history.slice(0, 15).reverse().map(i => i.date) || ['Sync'];
    chartInstance.data.datasets[0].data = state.graphData.slice(-15);
    chartInstance.update('active'); // smoother update animation
}

function initChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    
    // Hardware accelerated gradient
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
                tension: 0.4, // Smooth curves
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
    downloadAnchorNode.setAttribute("download", `AETHER_CORE_BACKUP_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function editTransaction(id) {
    const index = state.history.findIndex(t => t.id == id);
    if (index === -1) return;

    const t = state.history[index];
    const newDesc = prompt("Update Description:", t.desc);
    const newAmount = prompt("Update Amount (use negative for expenses):", t.amount);

    if (newDesc !== null && newAmount !== null && !isNaN(newAmount)) {
        state.history[index].desc = newDesc;
        state.history[index].amount = parseFloat(newAmount);
        state.history[index].icon = detectCategory(newDesc);
        
        recalculateEverything(); // Vital: Refresh the whole system
        save();
    }
}

function deleteTransaction(id) {
    if (confirm("Purge this data entry from the ledger?")) {
        state.history = state.history.filter(t => t.id != id);
        recalculateEverything();
        save();
    }
}

// This makes sure your "Liquid Assets" matches your history perfectly
function recalculateEverything() {
    state.balance = state.history.reduce((acc, t) => acc + t.amount, 0);
    state.graphData = [0]; // Reset graph
    // Rebuild graph from history
    let tempBal = 0;
    [...state.history].reverse().forEach(t => {
        tempBal += t.amount;
        state.graphData.push(tempBal);
    });
}


document.getElementById('clear-data').addEventListener('click', () => {
    if (confirm("WARNING: Initiating total system purge. All data will be destroyed. Proceed?")) {
        localStorage.clear();
        location.reload();
    }
});
