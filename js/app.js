// EVENT LISTENERS & ACTIONS
// app.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').innerText = new Date().toDateString();
    applySettings();
    initChart();
    recalculateBalance(); 
    updateUI();
});

document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc').value;

    state.history.unshift({
        id: Date.now(),
        desc: desc,
        amount: type === 'income' ? amount : -amount,
        icon: type === 'income' ? '💰' : detectCategory(desc)
    });

    if (type === 'income') state.streak++;
    recalculateBalance(); 
    save();
    e.target.reset();
});

document.getElementById('new-goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.goals.push({
        name: document.getElementById('goal-name').value,
        target: parseFloat(document.getElementById('goal-target').value),
        date: document.getElementById('goal-date').value,
        priority: document.getElementById('goal-priority').value
    });
    save();
    document.getElementById('goal-modal').classList.remove('active');
});

function toggleSettings() { document.getElementById('settings-modal').classList.toggle('active'); }
function toggleGoalModal() { document.getElementById('goal-modal').classList.toggle('active'); }

function saveSettings() {
    state.settings.name = document.getElementById('settings-name').value;
    state.settings.darkMode = document.getElementById('dark-mode-toggle').checked;
    applySettings();
    save();
    toggleSettings();
}

function editStat(type) {
    let val = prompt(`Enter new ${type}:`, state[type]);
    if (val) { state[type] = parseFloat(val); save(); }
}

function exportData() {
    const blob = new Blob([JSON.stringify(state)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "aether_vault.json";
    a.click();
}

document.getElementById('clear-data').addEventListener('click', () => {
    if(confirm("Purge system?")) { localStorage.clear(); location.reload(); }
});
