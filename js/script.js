// State Management
let state = JSON.parse(localStorage.getItem('scholarDataPro')) || {
    balance: 0,
    history: [],
    goal: { name: "None", target: 0, date: null },
    income: 800
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').innerText = new Date().toDateString();
    updateUI();
});

// Transaction Handler
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
    
    save();
    e.target.reset();
});

// Goal Handler
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
    localStorage.setItem('scholarDataPro', JSON.stringify(state));
    updateUI();
}

function updateUI() {
    // 1. Counter Animation Logic
    animateValue('total-balance', state.balance);
    document.getElementById('weekly-inc').innerText = `₱${(state.income / 4).toFixed(2)}`;
    
    // 2. History with modern rows
    const historyBody = document.getElementById('history-body');
    historyBody.innerHTML = state.history.slice(0, 6).map(item => `
        <tr class="fade-in">
            <td><div class="dot ${item.amount > 0 ? 'bg-success' : 'bg-danger'}"></div></td>
            <td><strong>${item.desc}</strong><br><small>${item.date}</small></td>
            <td class="text-right ${item.amount > 0 ? 'text-success' : 'text-danger'}">
                ${item.amount > 0 ? '+' : ''}₱${Math.abs(item.amount).toFixed(2)}
            </td>
        </tr>
    `).join('');

    // 3. Advanced Goal Engine
    if (state.goal.target > 0) {
        document.getElementById('goal-name-display').innerText = state.goal.name;
        const progress = Math.min((state.balance / state.goal.target) * 100, 100);
        document.getElementById('goal-progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-percent').innerText = `${Math.round(progress)}%`;

        const remaining = state.goal.target - state.balance;
        const daysLeft = Math.ceil((new Date(state.goal.date) - new Date()) / (1000 * 60 * 60 * 24));

        if (remaining > 0 && daysLeft > 0) {
            const dailyTarget = remaining / daysLeft;
            document.getElementById('goal-stats').innerText = `₱${remaining.toFixed(0)} more needed`;
            renderSmartAlert(dailyTarget, daysLeft);
        } else if (remaining <= 0) {
            document.getElementById('goal-stats').innerText = "Target Reached!";
            document.getElementById('smart-status').innerHTML = `<div class="alert success">Target acquired! You can safely buy ${state.goal.name} now.</div>`;
        }
    }
    
    document.getElementById('forecast-val').innerText = `₱${(state.balance + state.income).toFixed(2)}`;
}

// Utility: Smooth Number Animation
function animateValue(id, value) {
    const obj = document.getElementById(id);
    obj.innerText = `₱${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}

function renderSmartAlert(dailyTarget, daysLeft) {
    const dailyIncome = state.income / 30;
    const statusDiv = document.getElementById('smart-status');
    
    if (dailyTarget > dailyIncome) {
        statusDiv.innerHTML = `
            <div class="alert warning">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>High Burn Rate:</strong> You need to save ₱${dailyTarget.toFixed(2)}/day, which exceeds your income. Consider pushing the date back by ${Math.ceil(dailyTarget/dailyIncome)} days.
            </div>`;
    } else {
        statusDiv.innerHTML = `
            <div class="alert success">
                <i class="fas fa-check-circle"></i>
                <strong>On Track:</strong> Just keep daily spending below ₱${(dailyIncome - dailyTarget).toFixed(2)}.
            </div>`;
    }
}
