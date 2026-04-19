// STATE MANAGEMENT
// state.js
let state = initializeState();

function initializeState() {
    let saved = JSON.parse(localStorage.getItem('aetherCoreDataV5'));
    const defaultState = {
        balance: 0,
        history: [],
        goals: [], 
        income: 1000,
        streak: 0,
        graphData: [0],
        settings: { darkMode: true, name: "MIGUEL | PSHS-CRC" }
    };
    return saved ? { ...defaultState, ...saved } : defaultState;
}

function save() {
    localStorage.setItem('aetherCoreDataV5', JSON.stringify(state));
    if (typeof updateUI === "function") updateUI();
}

function recalculateBalance() {
    state.balance = state.history.reduce((sum, item) => sum + item.amount, 0);
    state.graphData = [0];
    let running = 0;
    [...state.history].reverse().forEach(t => { 
        running += t.amount; 
        state.graphData.push(running); 
    });
}

function detectCategory(desc) {
    const d = desc.toLowerCase();
    if (d.includes('food')) return '🍔';
    if (d.includes('fare') || d.includes('jeep')) return '🚙';
    if (d.includes('game')) return '🎮';
    if (d.includes('school')) return '📚';
    return '💳'; 
}
