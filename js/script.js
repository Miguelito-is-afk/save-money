// Miguel's FinTech Engine
let state = JSON.parse(localStorage.getItem('miguelUltraData')) || {
    balance: 0,
    history: [],
    goal: { name: "None", target: 0, date: null, buffer: 0 },
    income: 800,
    streak: 0,
    graphData: [0]
};

let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').innerText = new Date().toDateString();
    initChart();
    updateUI();
});

// INITIALIZE GROWTH GRAPH
function initChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: state.history.slice(0, 10).reverse().map(i => i.date) || ['Start'],
            datasets: [{
                label: 'Wealth Growth (₱)',
                data: state.graphData.slice(-10),
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 5
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

// EDITABLE STATS (Click to Change)
function editStat(type) {
    let newVal = prompt(`Enter new ${type}:`, type === 'balance' ? state.balance : state.income);
    if (newVal !== null && !isNaN(newVal)) {
        state[type] = parseFloat(newVal);
        save();
    }
}

// LOG TRANSACTIONS
document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    const entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        desc: document.getElementById('desc').value,
        amount: type === 'income' ? amount : -amount
    };

    state.history.unshift(entry);
    state.balance += entry.amount;
    state.graphData.push(state.balance);
    
    if (type === 'income') state.streak++;
    
    save();
    e.target.reset();
});

// GOAL MISSION UPDATER
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
    localStorage.setItem('miguelUltraData', JSON.stringify(state));
    updateUI();
}

function updateUI() {
    // 1. Text UI
    document.getElementById('total-balance').innerText = `₱${state.balance.toFixed(2)}`;
    document.getElementById('weekly-inc').innerText = `₱${state.income.toFixed(2)}`;
    document.getElementById('buffer-display').innerText = `${state.goal.buffer} Days`;
    document.getElementById('streak-count').innerText = `🔥 ${state.streak} Day Streak`;

    // 2. Ledger
    const historyBody = document.getElementById('history-body');
    historyBody.innerHTML = state.history.slice(0, 5).map(item => `
        <tr>
            <td><i class="fas ${item.amount > 0 ? 'fa-arrow-trend-up text-success' : 'fa-arrow-trend-down text-danger'}"></i></td>
            <td><strong>${item.desc}</strong><br><small>${item.date}</small></td>
            <td class="${item.amount > 0 ? 'text-success' : 'text-danger'}" style="text-align:right">
                ₱${Math.abs(item.amount).toFixed(2)}
            </td>
            <td style="text-align:right">
                <button onclick="deleteTxn(${item.id})" class="delete-btn"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    // 3. Quota Calculations (With Buffer)
    calculateQuotas();
    
    // 4. Update Graph
    if (chartInstance) {
        chartInstance.data.labels = state.history.slice(0, 10).reverse().map(i => i.date);
        chartInstance.data.datasets[0].data = state.graphData.slice(-10);
        chartInstance.update();
    }
}

function calculateQuotas() {
    const healthEl = document.getElementById('health-score');
    const predBody = document.getElementById('prediction-body');
    let score = "A+";

    if (state.goal.target > 0) {
        document.getElementById('goal-name-display').innerText = state.goal.name;
        
        const progress = Math.min((state.balance / state.goal.target) * 100, 100);
        document.getElementById('goal-progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-percent').innerText = `${Math.round(progress)}%`;

        // The Buffer Calculation
        const targetDate = new Date(state.goal.date);
        targetDate.setDate(targetDate.getDate() - state.goal.buffer); // Subtract buffer
        
        const today = new Date();
        const daysLeft = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
        const remaining = state.goal.target - state.balance;

        if (remaining > 0 && daysLeft > 0) {
            const dailyTarget = remaining / daysLeft;
            document.getElementById('goal-stats').innerText = `₱${remaining.toFixed(2)} to reach quota`;
            
            // Health Scoring
            const dailyIncome = (state.income / 7);
            if (dailyTarget > dailyIncome * 1.2) score = "C-";
            else if (dailyTarget > dailyIncome) score = "B";
            else score = "S";

            renderAlert(dailyTarget, daysLeft);
            generatePredictions(dailyTarget);
        } else if (remaining <= 0) {
            score = "GOAL REACHED";
            document.getElementById('smart-status').innerHTML = `<div class="alert success">Mission Accomplished! Quota met.</div>`;
        } else {
            score = "URGENT";
            document.getElementById('smart-status').innerHTML = `<div class="alert warning">Deadline Passed or Buffer Invalid. Adjust!</div>`;
        }
    }
    healthEl.innerText = score;
}

function generatePredictions(dailyTarget) {
    const predBody = document.getElementById('prediction-body');
    let rows = "";
    let tempBalance = state.balance;
    const dailyIncome = state.income / 7;

    for (let i = 1; i <= 7; i++) {
        let date = new Date();
        date.setDate(date.getDate() + i);
        tempBalance += (dailyIncome - 20); // Simulating 20 spending
        rows += `
            <tr>
                <td>${date.toLocaleDateString('en-US', {weekday: 'short'})}</td>
                <td>₱${tempBalance.toFixed(2)}</td>
                <td class="text-success">₱${dailyTarget.toFixed(2)}</td>
            </tr>
        `;
    }
    predBody.innerHTML = rows;
}

function renderAlert(target, days) {
    const div = document.getElementById('smart-status');
    div.innerHTML = `
        <div class="alert ${target > (state.income/7) ? 'warning' : 'success'}">
            <i class="fas fa-robot"></i>
            <div>
                <strong>Miguel,</strong> to finish <strong>${state.goal.buffer} days early</strong>, 
                save ₱${target.toFixed(2)} daily for ${days} days.
            </div>
        </div>
    `;
}

function deleteTxn(id) {
    const i = state.history.findIndex(t => t.id === id);
    if (i !== -1) {
        state.balance -= state.history[i].amount;
        state.history.splice(i, 1);
        save();
    }
}

document.getElementById('clear-data').addEventListener('click', () => {
    if (confirm("Reset everything, Miguel?")) {
        localStorage.clear();
        location.reload();
    }
});
