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
// UPGRADED AI CATEGORIZATION ENGINE
function detectCategory(desc) {
    const d = desc.toLowerCase();
    
    // Word boundary regex ensures "scooter" doesn't trigger "school"
    const categories = {
        '🍔': /\b(food|lunch|snack|burger|pizza|eat|meal|coffee|drink|water)\b/,
        '🚙': /\b(fare|jeep|transpo|trike|gas|taxi|grab|bus|commute|ride)\b/,
        '🎮': /\b(codm|roblox|game|cp|steam|play|skin|valorant|topup)\b/,
        '📚': /\b(school|print|project|book|tuition|supplies|pen|paper)\b/,
        '👕': /\b(clothes|shirt|shoes|apparel|fit|pants|mall|thrifting)\b/,
        '🎬': /\b(movie|cinema|netflix|ticket|concert|sub)\b/
    };

    for (let [icon, regex] of Object.entries(categories)) {
        if (regex.test(d)) return icon;
    }
    return '💳'; // Default Anomaly
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

// UPGRADED BURN RATE ANALYTICS
function calculateBurnRate() {
    // Filter last 30 days of expenses
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const recentExpenses = state.history.filter(t => t.amount < 0 && t.id > thirtyDaysAgo);
    const burnText = document.getElementById('burn-rate-display');
    
    if (recentExpenses.length > 1) {
        const totalBurn = recentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        // Calculate the exact time span of these expenses
        const oldestExpense = Math.min(...recentExpenses.map(t => t.id));
        const daysSpan = Math.max(1, (now - oldestExpense) / (1000 * 60 * 60 * 24));
        
        // Global state injection for the Prediction Engine to use
        state.trueDailyBurn = totalBurn / daysSpan; 

        burnText.innerHTML = `<i class="fas fa-fire"></i> True Burn: ₱${state.trueDailyBurn.toFixed(2)} / day`;
        burnText.style.color = state.trueDailyBurn > (state.income / 7) ? '#fca5a5' : '#86efac';
    } else {
        state.trueDailyBurn = 0;
        burnText.innerText = "Data insufficient for velocity mapping.";
        burnText.style.color = "var(--text-muted)";
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

// UPGRADED SYSTEM CORE LOGIC
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
            const dailyReq = remaining / daysLeft;
            const dailyIncome = state.income / 7;
            const safeToSpend = Math.max(0, dailyIncome - dailyReq); // New Metric!

            adviceEl.innerHTML = `Save <strong>₱${dailyReq.toFixed(2)}</strong> daily.<br>Safe to spend limit: <strong>₱${safeToSpend.toFixed(2)}/day</strong>.`;
            
            healthEl.innerText = (dailyReq > dailyIncome) ? "UNSTABLE" : "STABLE";
            healthEl.style.color = (dailyReq > dailyIncome) ? "var(--warning)" : "var(--primary)";
            
            generatePredictions(dailyReq);
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

// UPGRADED PREDICTIVE ENGINE
function generatePredictions(dailyTarget) {
    const predBody = document.getElementById('prediction-body');
    let rows = "";
    let tempBalance = state.balance;
    const dailyIncome = state.income / 7;
    
    // Fallback to 20% burn buffer only if there's no historical data yet
    const projectedBurn = (state.trueDailyBurn && state.trueDailyBurn > 0) 
        ? state.trueDailyBurn 
        : (dailyIncome * 0.2);

    const netDailyVelocity = dailyIncome - projectedBurn;
    
    for (let i = 1; i <= 7; i++) {
        let date = new Date();
        date.setDate(date.getDate() + i);
        
        // Predict based on ACTUAL spending habits
        tempBalance += netDailyVelocity; 
        
        const balanceColor = tempBalance < 0 ? "var(--danger)" : "var(--text-main)";

        rows += `
            <tr class="table-row-hover hover-lift-slight">
                <td>${date.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</td>
                <td style="color: ${balanceColor};">₱${tempBalance.toFixed(2)}</td>
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
