// AETHER CORE v4.0 - Quantum Neural Engine (Surplus & Anomaly Edition)
// Hardware-Optimized for Dimensity processing

let state = JSON.parse(localStorage.getItem('aetherCoreData')) || {
    balance: 0,
    generalSavings: 0, // NEW: Track money outside of specific goals
    history: [],
    goal: { name: "VOID", target: 0, date: null, buffer: 0 },
    income: 200,
    incomeSchedule: [1, 2, 3, 4],
    streak: 0,
    graphData: [0],
    lastFuelDate: null, // NEW: Track the last time you confirmed fuel
    settings: { darkMode: false, name: "MIGUEL | PSHS-CRC" }
};

let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    applySettings();
    initChart();
    updateUI();
});

// Handle clicking the day buttons
document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day);
        if (state.incomeSchedule.includes(day)) {
            state.incomeSchedule = state.incomeSchedule.filter(d => d !== day);
            btn.classList.remove('active');
        } else {
            state.incomeSchedule.push(day);
            btn.classList.add('active');
        }
        save();
    });
});

function checkFuelPanel() {
    const fuelPanel = document.getElementById('fuel-panel');
    const today = new Date().getDay();
    const todayDateString = new Date().toLocaleDateString();
    
    const isPayday = state.incomeSchedule.includes(today);
    const alreadyConfirmed = state.lastFuelDate === todayDateString;

    if (isPayday && !alreadyConfirmed && state.goal.target > 0) {
        // Calculate the daily drain requirement right here
        const targetDate = new Date(state.goal.date);
        targetDate.setDate(targetDate.getDate() - state.goal.buffer);
        const daysLeft = Math.max(1, Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24)));
        const remaining = state.goal.target - state.balance;
        
        // This is your ₱15.80 (or whatever the current requirement is)
        const dailyReq = Math.max(0, remaining / daysLeft);
        
        document.getElementById('fuel-message').innerText = `Goal: ${state.goal.name}. Neural link suggests syncing ₱${dailyReq.toFixed(2)} to stay on track. Confirm?`;
        fuelPanel.dataset.pendingAmount = dailyReq; // Temporarily store it
        fuelPanel.style.display = 'block';
    } else {
        fuelPanel.style.display = 'none';
    }
}

function confirmFuel(received) {
    const fuelPanel = document.getElementById('fuel-panel');
    const todayDateString = new Date().toLocaleDateString();
    const amount = parseFloat(fuelPanel.dataset.pendingAmount) || 0;

    if (received && amount > 0) {
        state.balance += amount;
        state.history.unshift({
            id: Date.now(),
            date: todayDateString,
            desc: `⛽ GOAL FUEL: ${state.goal.name}`,
            amount: amount,
            icon: '🎯',
            spendType: 'income'
        });
        state.graphData.push(state.balance);
        state.streak++;
        alert(`Mission Synced. ₱${amount.toFixed(2)} allocated to Asset Acquisition.`);
    }

    state.lastFuelDate = todayDateString;
    save(); 
}

// V4 CATEGORIZATION & ANOMALY ENGINE
function detectCategoryAndAnomaly(desc, amount) {
    const d = desc.toLowerCase();
    let category = { icon: '💳', type: 'anomaly', name: 'Misc' }; // Default
    
    // Expanded Lexicon with "Needs" vs "Wants" tagging
    const categories = {
        '🍔': { regex: /\b(food|lunch|snack|burger|pizza|eat|meal|coffee|drink|water|grocery|groceries|mcdo|jollibee)\b/, type: 'need' },
        '🚙': { regex: /\b(fare|jeep|transpo|trike|gas|taxi|grab|bus|commute|ride|angkas|joyride)\b/, type: 'need' },
        '🎮': { regex: /\b(codm|roblox|game|cp|steam|play|skin|valorant|topup|rp|vbucks)\b/, type: 'want' },
        '📚': { regex: /\b(school|print|project|book|tuition|supplies|pen|paper|copy|xerox)\b/, type: 'need' },
        '👕': { regex: /\b(clothes|shirt|shoes|apparel|fit|pants|mall|thrifting|ukay|jacket)\b/, type: 'want' },
        '🎬': { regex: /\b(movie|cinema|netflix|ticket|concert|sub|spotify|premium)\b/, type: 'want' }
    };

    for (let [icon, data] of Object.entries(categories)) {
        if (data.regex.test(d)) {
            category = { icon: icon, type: data.type, name: d };
            break;
        }
    }

    // Smart Anomaly Detection: If a single expense is more than 50% of weekly income, flag it.
    const isAnomaly = Math.abs(amount) > (state.income * 0.50);
    if (isAnomaly) category.icon = '⚠️'; // Overrides icon for high-drain warnings

    return category;
}

// UI LOGIC
function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    
    if (modal.classList.contains('active')) {
        // CLOSE MODAL
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 400); 
    } else {
        // OPEN MODAL
        modal.style.display = 'flex';
        // Force reflow for animation
        void modal.offsetWidth;
        modal.classList.add('active');

        // Sync standard inputs
        document.getElementById('settings-name').value = state.settings.name;
        document.getElementById('dark-mode-toggle').checked = state.settings.darkMode;

        // SYNC DAY TOGGLES:
        // This ensures the buttons look "Active" based on your saved schedule
        document.querySelectorAll('.day-btn').forEach(btn => {
            const day = parseInt(btn.dataset.day);
            if (state.incomeSchedule.includes(day)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
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
        icon: '🎯',
        spendType: 'goal'
    });

    state.goal = { name: "VOID", target: 0, date: null, buffer: 0 };
    state.graphData.push(state.balance);
    
    save();
    alert("System Overload: Mission Accomplished. Asset acquired.");
}

// TRANSACTION ENTRY - UPGRADED
document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc').value;

    const analysis = type === 'income' 
        ? { icon: '💰', type: 'income' } 
        : detectCategoryAndAnomaly(desc, amount);

    state.history.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        desc: desc,
        amount: type === 'income' ? amount : -amount,
        icon: analysis.icon,
        spendType: analysis.type
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
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const recentExpenses = state.history.filter(t => t.amount < 0 && t.id > thirtyDaysAgo);
    const burnText = document.getElementById('burn-rate-display');
    
    if (recentExpenses.length > 1) {
        const totalBurn = recentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const oldestExpense = Math.min(...recentExpenses.map(t => t.id));
        const daysSpan = Math.max(1, (now - oldestExpense) / (1000 * 60 * 60 * 24));
        
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
    document.getElementById('total-balance').innerText = `₱${state.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('weekly-inc').innerText = `₱${state.income.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    document.getElementById('buffer-display').innerText = `${state.goal.buffer} Days`;
    document.getElementById('streak-count').innerText = `🔥 ${state.streak} Day Pulse`;
    
    const level = Math.max(1, Math.floor(state.balance / 500) + 1);
    document.getElementById('aura-level').innerText = `LVL ${level}`;

    renderLedger();
    checkFuelPanel();
    calculateBurnRate(); // Ensure burn rate runs before logic
    calculateAetherLogic();
    if (chartInstance) updateChart();
}

// V4 SYSTEM CORE LOGIC - SURPLUS ROUTING
function calculateAetherLogic() {
    const healthEl = document.getElementById('health-score');
    const adviceEl = document.getElementById('smart-advice');
    const actionZone = document.getElementById('action-zone');
    actionZone.innerHTML = ""; 

    // 1. Payday Detection
    const today = new Date().getDay(); 
    const isPayday = state.incomeSchedule.includes(today);
    
    // 2. Calculate Fuel per Active Day (e.g., ₱200 / 4 days = ₱50/day)
    const numPaydays = state.incomeSchedule.length || 1;
    const amountPerPayday = state.income / numPaydays;
    
    // 3. Current Daily Context
    const dailyIncome = isPayday ? amountPerPayday : 0;
    
    if (state.goal.target > 0) {
        document.getElementById('goal-name-display').innerText = state.goal.name;
        const progress = Math.min((state.balance / state.goal.target) * 100, 100);
        document.getElementById('goal-progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-percent').innerText = `${Math.round(progress)}%`;
        
        const targetDate = new Date(state.goal.date);
        targetDate.setDate(targetDate.getDate() - state.goal.buffer);
        const daysLeft = Math.max(1, Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24)));
        const remaining = state.goal.target - state.balance;
        const dailyReq = remaining / daysLeft;

        document.getElementById('goal-stats').innerText = remaining > 0 ? `₱${remaining.toLocaleString()} remaining` : "Quota Met";

        if (remaining <= 0) {
            healthEl.innerText = "MAX RESONANCE";
            healthEl.style.color = "var(--success)";
            adviceEl.innerText = `Objective achieved. ${state.goal.name} is ready for acquisition.`;
            actionZone.innerHTML = `<button onclick="redeemGoal()" class="claim-btn">REDEEM ASSET</button>`;
        } 
        // --- NON-PAYDAY MODE (Fridays/Weekends) ---
        else if (!isPayday) {
            healthEl.innerText = "NEURAL STANDBY";
            healthEl.style.color = "var(--text-muted)";
            adviceEl.innerHTML = `Today is a <strong>Non-Payday</strong>. No income expected.<br>
            Current daily drain required for goal: ₱${dailyReq.toFixed(2)}. Stay frosty.`;
            generatePredictions(dailyReq, 0, 0); 
        } 
        // --- ACTIVE PAYDAY MODE (School Days) ---
        else {
            const projectedBurn = (state.trueDailyBurn && state.trueDailyBurn > 0) ? state.trueDailyBurn : (dailyIncome * 0.2);
            const surplus = dailyIncome - projectedBurn - dailyReq;

            if (dailyReq > dailyIncome) {
                healthEl.innerText = "CRITICAL DEFICIT";
                healthEl.style.color = "var(--danger)";
                adviceEl.innerHTML = `Goal requires <strong>₱${dailyReq.toFixed(2)}/day</strong>, but you only make <strong>₱${dailyIncome.toFixed(2)}</strong>. Extend deadline!`;
            } else if (surplus < 0) {
                healthEl.innerText = "UNSTABLE";
                healthEl.style.color = "var(--warning)";
                adviceEl.innerHTML = `Goal takes ₱${dailyReq.toFixed(2)}. You only have ₱${(dailyIncome - dailyReq).toFixed(2)} left for food/fares. Tighten the belt!`;
            } else {
                healthEl.innerText = "OPTIMAL";
                healthEl.style.color = "var(--primary)";
                adviceEl.innerHTML = `
                    🎯 Save Today: <strong>₱${dailyReq.toFixed(2)}</strong><br>
                    🔥 Snack Budget: <strong>₱${(dailyIncome - dailyReq).toFixed(2)}</strong><br>
                    🏦 <strong>Weekly Surplus: ₱${(surplus * numPaydays).toFixed(2)}</strong>
                `;
            }
            generatePredictions(dailyReq, surplus, projectedBurn);
        }
    } else {
        // --- NO ACTIVE GOAL ---
        document.getElementById('goal-progress-bar').style.width = `0%`;
        document.getElementById('progress-percent').innerText = `0%`;
        document.getElementById('goal-stats').innerText = `Awaiting Data`;

        healthEl.innerText = "ACCUMULATING";
        healthEl.style.color = "var(--success)";
        adviceEl.innerHTML = `No active mission. Wealth-Building Mode Active.`;
        generatePredictions(0, dailyIncome, 0);
    }
}

// V4 PREDICTIVE ENGINE - THREE VECTOR ANALYSIS
function generatePredictions(dailyTarget, dailySurplus, projectedBurn) {
    const predBody = document.getElementById('prediction-body');
    
    const tableHead = document.querySelector('.prediction-table thead tr');
    if (tableHead) {
        tableHead.innerHTML = `<th>Timeline</th><th>Liquid Balance</th><th>Projected Savings</th>`;
    }

    let rows = "";
    let tempBalance = state.balance;
    let tempSavings = state.generalSavings || 0; 
    
    // Get the actual amount per school day
    const numPaydays = state.incomeSchedule.length || 1;
    const amountPerPayday = state.income / numPaydays;
    
    for (let i = 1; i <= 7; i++) {
        let date = new Date();
        date.setDate(date.getDate() + i);
        const dayOfWeek = date.getDay(); // 0-6
        
        // ONLY add income if that day is in your schedule
        if (state.incomeSchedule.includes(dayOfWeek)) {
            tempBalance += amountPerPayday;
            
            // Only apply burn and surplus on days you actually HAVE money
            tempBalance -= projectedBurn;
            
            if (dailySurplus > 0) {
                tempSavings += dailySurplus;
                tempBalance -= dailySurplus; 
            }
        }
        
        const balanceColor = tempBalance < 0 ? "var(--danger)" : "var(--text-main)";

        rows += `
            <tr class="table-row-hover hover-lift-slight">
                <td>${date.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</td>
                <td style="color: ${balanceColor};">₱${tempBalance.toFixed(2)}</td>
                <td style="color: var(--primary); font-weight: bold;">₱${tempSavings.toFixed(2)}</td>
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
