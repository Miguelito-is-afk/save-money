// Initialize state from LocalStorage
let state = JSON.parse(localStorage.getItem('scholarData')) || {
    balance: 0,
    history: [],
    goal: { name: "None", target: 0, date: null },
    monthlyIncome: 800
};

// DOM Elements
const balanceEl = document.getElementById('total-balance');
const historyBody = document.getElementById('history-body');
const smartStatus = document.getElementById('smart-status');
const progressBar = document.getElementById('goal-progress-bar');

// 1. Initial Load
updateUI();

// 2. Add Transaction Logic
document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    const entry = {
        date: new Date().toLocaleDateString(),
        desc,
        amount: type === 'income' ? amount : -amount
    };

    state.history.unshift(entry);
    state.balance += entry.amount;
    
    saveAndUpdate();
    e.target.reset();
});

// 3. Goal Setting Logic
document.getElementById('goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.goal = {
        name: document.getElementById('goal-name').value,
        target: parseFloat(document.getElementById('goal-target').value),
        date: document.getElementById('goal-date').value
    };
    saveAndUpdate();
});

// 4. Save and Refresh UI
function saveAndUpdate() {
    localStorage.setItem('scholarData', JSON.stringify(state));
    updateUI();
}

function updateUI() {
    // Basic Numbers
    balanceEl.innerText = `₱${state.balance.toFixed(2)}`;
    document.getElementById('weekly-inc').innerText = `₱${(state.monthlyIncome / 4).toFixed(2)}`;
    
    // Update History Table
    historyBody.innerHTML = state.history.slice(0, 5).map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.desc}</td>
            <td style="color: ${item.amount > 0 ? 'green' : 'red'}">
                ${item.amount > 0 ? '+' : ''}₱${item.amount.toFixed(2)}
            </td>
        </tr>
    `).join('');

    // SMART GOAL LOGIC
    if (state.goal.target > 0) {
        document.getElementById('goal-name-display').innerText = state.goal.name;
        const progress = (state.balance / state.goal.target) * 100;
        progressBar.style.width = `${Math.min(progress, 100)}%`;

        const remaining = state.goal.target - state.balance;
        const daysLeft = Math.ceil((new Date(state.goal.date) - new Date()) / (1000 * 60 * 60 * 24));

        if (remaining > 0 && daysLeft > 0) {
            const dailyTarget = remaining / daysLeft;
            document.getElementById('goal-stats').innerHTML = 
                `Need ₱${remaining.toFixed(2)} more. <br> <b>Save ₱${dailyTarget.toFixed(2)} per day</b> to reach it!`;
            
            checkSmartAlerts(dailyTarget, daysLeft);
        } else if (remaining <= 0) {
            document.getElementById('goal-stats').innerText = "Goal achieved! Go get it! 🎉";
            smartStatus.innerHTML = "<p class='success'>You have enough! Purchase confirmed.</p>";
        }
    }

    // Forecast: Current Balance + Expected Monthly income
    document.getElementById('forecast-val').innerText = `₱${(state.balance + state.monthlyIncome).toFixed(2)}`;
}

// 5. Smart Adjustment System
function checkSmartAlerts(dailyTarget, daysLeft) {
    let message = "";
    const dailyIncome = (state.monthlyIncome / 30);

    if (dailyTarget > dailyIncome) {
        message = `<div class="warning">⚠️ <b>Overspend Alert!</b> Your goal requires ₱${dailyTarget.toFixed(2)}/day, but your income is only ₱${dailyIncome.toFixed(2)}/day. Try extending your target date!</div>`;
    } else {
        message = `<div class="success">✅ You're on track! Keep spending under ₱${(dailyIncome - dailyTarget).toFixed(2)} per day to stay safe.</div>`;
    }
    
    smartStatus.innerHTML = message;
}

// Reset Logic
document.getElementById('clear-data').addEventListener('click', () => {
    if(confirm("Are you sure you want to clear all data?")) {
        localStorage.clear();
        location.reload();
    }
});
