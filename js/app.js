// AETHER CORE - Event Listeners
// app.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').innerText = new Date().toLocaleDateString();
    applySettings();
    initChart();
    recalculateBalance(); 
    updateUI();
});

// Form Logic
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

    if (type === 'income') state.streak++;
    e.target.reset();
    recalculateBalance(); 
    save();
});

// Modal Toggles
function toggleSettings() { document.getElementById('settings-modal').classList.toggle('active'); }
function toggleGoalModal() { document.getElementById('goal-modal').classList.toggle('active'); }
function closeEditModal() { document.getElementById('edit-modal').classList.remove('active'); }

// Data Management
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `AETHER_BACKUP.json`);
    dlAnchor.click();
}
