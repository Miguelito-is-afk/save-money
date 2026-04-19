// AETHER CORE v3.0 - Quantum Neural Engine
// Hardware-Optimized for Dimensity processing

let state = JSON.parse(localStorage.getItem('aetherCoreData')) || {
    balance: 0,
    history: [],
    goal: { name: "VOID", target: 0, date: null, buffer: 0 },
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
    const healthEl = document.getElementById('health-score');
    const adviceEl = document.getElementById('smart-advice');
    const actionZone = document.getElementById('action-zone');
    actionZone.innerHTML = ""; 

    if (state.goal.target > 0) {
        document.getElementById('goal-name-display').innerText = state.goal.name;
        const progress = Math.min((state.balance / state.goal.target) * 100, 100);
        document.getElementById('goal-progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-percent').innerText = `${Math.round(progress)}%`;

        const targetDate = new Date(state.goal.date);
        targetDate.setDate(targetDate.getDate() - state.goal.buffer);
        const daysLeft = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));
        const remaining = state.goal.target - state.balance;

        document.getElementById('goal-stats').innerText = remaining > 0 ? `₱${remaining.toLocaleString()} remaining` : "Quota Met";

        if (remaining <= 0) {
            healthEl.innerText = "MAX RESONANCE";
            healthEl.style.color = "var(--success)";
            adviceEl.innerText = `Objective achieved. Target [${state.goal.name}] is ready for acquisition.`;
            actionZone.innerHTML = `<button onclick="redeemGoal()" class="claim-btn">REDEEM ASSET</button>`;
        } else if (daysLeft > 0) {
            const daily = remaining / daysLeft;
            adviceEl.innerText = `Save ₱${daily.toFixed(2)} daily to secure objective ${state.goal.buffer} days early.`;
            healthEl.innerText = (daily > state.income/7) ? "UNSTABLE" : "STABLE";
            healthEl.style.color = (daily > state.income/7) ? "var(--warning)" : "var(--primary)";
            generatePredictions(daily);
        } else {
            adviceEl.innerText = "Temporal deadline breached. Re-calibrate mission parameters.";
            healthEl.innerText = "CRITICAL";
            healthEl.style.color = "var(--danger)";
        }
    } else {
        document.getElementById('goal-progress-bar').style.width = `0%`;
        adviceEl.innerText = "Awaiting input. Initialize a target mission to begin synchronization.";
        healthEl.innerText = "STANDBY";
        healthEl.style.color = "var(--text-muted)";
    }
}

function generatePredictions(dailyTarget) {
    const predBody = document.getElementById('prediction-body');
    let rows = "";
    let tempBalance = state.balance;
    const avgDailyIncome = state.income / 7;
    
    for (let i = 1; i <= 7; i++) {
        let date = new Date();
        date.setDate(date.getDate() + i);
        tempBalance += (avgDailyIncome * 0.8); // Assuming 20% burn rate buffer
        rows += `
            <tr class="table-row-hover hover-lift-slight">
                <td>${date.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</td>
                <td>₱${tempBalance.toFixed(2)}</td>
                <td style="color: var(--success); font-weight: bold;">₱${dailyTarget.toFixed(2)}</td>
            </tr>`;
    }
    predBody.innerHTML = rows;
}

function renderLedger() {
    const body = document.getElementById('history-body');
    body.innerHTML = state.history.slice(0, 6).map(item => `
        <tr class="table-row-hover hover-lift-slight">
            <td style="font-size: 1.2rem;">${item.icon || '💳'}</td>
            <td><strong>${item.desc}</strong><br><small style="color: var(--text-muted)">${item.date}</small></td>
            <td style="text-align:right; font-weight: 700; color: ${item.amount > 0 ? 'var(--success)' : 'var(--text-main)'}">
                ${item.amount > 0 ? '+' : ''}₱${Math.abs(item.amount).toFixed(2)}
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

document.getElementById('clear-data').addEventListener('click', () => {
    if (confirm("WARNING: Initiating total system purge. All data will be destroyed. Proceed?")) {
        localStorage.clear();
        location.reload();
    }
});
