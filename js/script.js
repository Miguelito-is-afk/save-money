// AETHER CORE v2.0 - Neural Financial Engine
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
    document.getElementById('current-date').innerText = new Date().toDateString();
    applySettings();
    initChart();
    updateUI();
});

// SETTINGS LOGIC
function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
    document.getElementById('settings-name').value = state.settings.name;
    document.getElementById('dark-mode-toggle').checked = state.settings.darkMode;
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
}

// GOAL REDEMPTION (THE SMART PART)
function redeemGoal() {
    if (confirm(`Redeem Mission: ${state.goal.name}? This will deduct ₱${state.goal.target} from your balance.`)) {
        const cost = state.goal.target;
        state.balance -= cost;
        
        // Log the achievement
        state.history.unshift({
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            desc: `MISSION SUCCESS: ${state.goal.name}`,
            amount: -cost,
            isReward: true
        });

        // Reset the goal
        state.goal = { name: "VOID", target: 0, date: null, buffer: 0 };
        state.graphData.push(state.balance);
        
        save();
        alert("Mission Accomplished. Funds deployed. System reset for next objective.");
    }
}

// CORE FUNCTIONS
function editStat(type) {
    let newVal = prompt(`Update ${type}:`, type === 'balance' ? state.balance : state.income);
    if (newVal !== null && !isNaN(newVal)) {
        state[type] = parseFloat(newVal);
        save();
    }
}

document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    state.history.unshift({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        desc: document.getElementById('desc').value,
        amount: type === 'income' ? amount : -amount
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

function save() {
    localStorage.setItem('aetherCoreData', JSON.stringify(state));
    updateUI();
}

function updateUI() {
    document.getElementById('total-balance').innerText = `₱${state.balance.toFixed(2)}`;
    document.getElementById('weekly-inc').innerText = `₱${state.income.toFixed(2)}`;
    document.getElementById('buffer-display').innerText = `${state.goal.buffer} Days`;
    document.getElementById('streak-count').innerText = `🔥 ${state.streak} Day Pulse`;
    
    renderLedger();
    calculateAetherLogic();
    if (chartInstance) updateChart();
}

function calculateAetherLogic() {
    const healthEl = document.getElementById('health-score');
    const adviceEl = document.getElementById('smart-advice');
    const actionZone = document.getElementById('action-zone');
    actionZone.innerHTML = ""; // Clear button

    if (state.goal.target > 0) {
        document.getElementById('goal-name-display').innerText = state.goal.name;
        const progress = Math.min((state.balance / state.goal.target) * 100, 100);
        document.getElementById('goal-progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-percent').innerText = `${Math.round(progress)}%`;

        const targetDate = new Date(state.goal.date);
        targetDate.setDate(targetDate.getDate() - state.goal.buffer);
        const daysLeft = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24));
        const remaining = state.goal.target - state.balance;

        if (remaining <= 0) {
            healthEl.innerText = "MAX RESONANCE";
            adviceEl.innerText = `Objective ready for deployment. Target: ${state.goal.name}.`;
            actionZone.innerHTML = `<button onclick="redeemGoal()" class="claim-btn">REDEEM ASSET</button>`;
        } else if (daysLeft > 0) {
            const daily = remaining / daysLeft;
            adviceEl.innerText = `Save ₱${daily.toFixed(2)} daily to hit your quota ${state.goal.buffer} days early.`;
            healthEl.innerText = (daily > state.income/7) ? "UNSTABLE" : "STABLE";
            generatePredictions(daily);
        } else {
            adviceEl.innerText = "Deadline breached. Re-calibrate mission parameters.";
            healthEl.innerText = "CRITICAL";
        }
    } else {
        adviceEl.innerText = "No active mission. Set a target to begin synchronization.";
        healthEl.innerText = "IDLE";
    }
}

function generatePredictions(dailyTarget) {
    const predBody = document.getElementById('prediction-body');
    let rows = "";
    let tempBalance = state.balance;
    for (let i = 1; i <= 7; i++) {
        let date = new Date();
        date.setDate(date.getDate() + i);
        tempBalance += (state.income / 7) - 10; // Predictive logic
        rows += `<tr><td>Day ${i}</td><td>₱${tempBalance.toFixed(2)}</td><td class="text-success">₱${dailyTarget.toFixed(2)}</td></tr>`;
    }
    predBody.innerHTML = rows;
}

function renderLedger() {
    const body = document.getElementById('history-body');
    body.innerHTML = state.history.slice(0, 6).map(item => `
        <tr class="${item.isReward ? 'aura-row' : ''}">
            <td><i class="fas ${item.amount > 0 ? 'fa-plus text-success' : 'fa-minus text-danger'}"></i></td>
            <td><strong>${item.desc}</strong><br><small>${item.date}</small></td>
            <td style="text-align:right">₱${Math.abs(item.amount).toFixed(2)}</td>
        </tr>
    `).join('');
}

function updateChart() {
    chartInstance.data.labels = state.history.slice(0, 10).reverse().map(i => i.date);
    chartInstance.data.datasets[0].data = state.graphData.slice(-10);
    chartInstance.update();
}

function initChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sync'],
            datasets: [{
                label: 'Aura Growth',
                data: state.graphData,
                borderColor: '#6366f1',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "aether_core_sync.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

document.getElementById('clear-data').addEventListener('click', () => {
    if (confirm("Initiate total system purge?")) {
        localStorage.clear();
        location.reload();
    }
});
