// Miguel's Enhanced State Engine
let state = JSON.parse(localStorage.getItem('miguelVaultData')) || {
    balance: 0,
    history: [],
    goal: { name: "None", target: 0, date: null },
    income: 800,
    streak: 0,
    lastActive: new Date().toLocaleDateString()
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').innerText = new Date().toDateString();
    updateUI();
});

// ADD TRANSACTION
document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    const entry = {
        id: "TXN-" + Date.now(),
        date: new Date().toLocaleDateString(),
        desc: document.getElementById('desc').value,
        amount: type === 'income' ? amount : -amount
    };

    state.history.unshift(entry);
    state.balance += entry.amount;
    
    // Update streak if no expenses today
    if (type === 'income') state.streak++;
    
    save();
    e.target.reset();
});

// DELETE INDIVIDUAL ITEM
function deleteTransaction(id) {
    const index = state.history.findIndex(item => item.id === id);
    if (index !== -1) {
        // Reverse the balance impact
        state.balance -= state.history[index].amount;
        // Remove from array
        state.history.splice(index, 1);
        save();
    }
}

// GOAL UPDATE
document.getElementById('goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.goal = {
        name: document.getElementById('goal-name').value,
        target: parseFloat(document.getElementById('goal-target').value),
        date: document.getElementById('goal-date').value
    };
    save();
});

function save() {
    localStorage.setItem('miguelVaultData', JSON.stringify(state));
    updateUI();
}

function updateUI() {
    // 1. Core Displays
    document.getElementById('total-balance').innerText = `₱${state.balance.toFixed(2)}`;
    document.getElementById('weekly-inc').innerText = `₱${(state.income / 4).toFixed(2)}`;
    document.getElementById('streak-count').innerText = `🔥 ${state.streak} Day Saving Streak`;

    // 2. Ledger Rendering with Delete Action
    const historyBody = document.getElementById('history-body');
    historyBody.innerHTML = state.history.slice(0, 8).map(item => `
        <tr class="fade-in">
            <td><div class="dot ${item.amount > 0 ? 'bg-success' : 'bg-danger'}"></div></td>
            <td class="desc-cell"><strong>${item.desc}</strong><br><small>${item.date}</small></td>
            <td class="amount-cell ${item.amount > 0 ? 'text-success' : 'text-danger'}">
                ${item.amount > 0 ? '+' : ''}₱${Math.abs(item.amount).toFixed(2)}
            </td>
            <td>
                <button onclick="deleteTransaction('${item.id}')" class="delete-btn">
                    <i class="fas fa-trash-can"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // 3. Smart Goal & Health Analysis
    calculateHealthAndGoals();
}

function calculateHealthAndGoals() {
    const healthEl = document.getElementById('health-score');
    let score = "A+";

    if (state.goal.target > 0) {
        document.getElementById('goal-name-display').innerText = state.goal.name;
        const progress = Math.min((state.balance / state.goal.target) * 100, 100);
        document.getElementById('goal-progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-percent').innerText = `${Math.round(progress)}%`;

        const remaining = state.goal.target - state.balance;
        const daysLeft = Math.ceil((new Date(state.goal.date) - new Date()) / (1000 * 60 * 60 * 24));

        if (remaining > 0 && daysLeft > 0) {
            const dailyTarget = remaining / daysLeft;
            const dailyIncome = state.income / 30;
            
            document.getElementById('goal-stats').innerText = `₱${remaining.toFixed(2)} left`;
            
            // Health Scoring Logic
            if (dailyTarget > dailyIncome * 1.5) score = "D";
            else if (dailyTarget > dailyIncome) score = "C";
            else if (progress > 50) score = "A";
            else score = "B";

            renderAlert(dailyTarget, dailyIncome);
        } else if (remaining <= 0) {
            score = "S+";
            document.getElementById('smart-status').innerHTML = `<div class="alert success">Goal Achieved, Miguel! Proceed with purchase.</div>`;
        }
    }
    healthEl.innerText = score;
}

function renderAlert(target, income) {
    const statusDiv = document.getElementById('smart-status');
    if (target > income) {
        statusDiv.innerHTML = `<div class="alert warning"><i class="fas fa-bolt"></i> <strong>Critical:</strong> Save ₱${target.toFixed(2)}/day to win.</div>`;
    } else {
        statusDiv.innerHTML = `<div class="alert success"><i class="fas fa-check"></i> <strong>Secure:</strong> ₱${target.toFixed(2)}/day needed.</div>`;
    }
}

document.getElementById('clear-data').addEventListener('click', () => {
    if(confirm("Miguel, this will erase your entire ledger. Proceed?")) {
        localStorage.clear();
        location.reload();
    }
});
