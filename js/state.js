// AETHER CORE - State Management
// state.js

let state = initializeState();

function initializeState() {
    let saved;
    try {
        saved = JSON.parse(localStorage.getItem('aetherCoreDataV5'));
    } catch (e) {
        console.error("Corrupted save detected.");
        saved = null;
    }
    
    const defaultState = {
        balance: 0,
        history: [],
        goals: [], 
        income: 1000,
        streak: 0,
        graphData: [0],
        settings: { darkMode: true, name: "MIGUEL | PSHS-CRC" }
    };

    if (!saved) return defaultState;
    return { ...defaultState, ...saved };
}

function save() {
    localStorage.setItem('aetherCoreDataV5', JSON.stringify(state));
    updateUI(); // Function from ui.js
}

function recalculateBalance() {
    state.balance = state.history.reduce((sum, item) => sum + item.amount, 0);
    state.graphData = [0];
    let running = 0;
    const chrono = [...state.history].reverse();
    chrono.forEach(t => { 
        running += t.amount; 
        state.graphData.push(running); 
    });
}

function detectCategory(desc) {
    const d = desc.toLowerCase();
    if (d.includes('food') || d.includes('lunch')) return '🍔';
    if (d.includes('fare') || d.includes('jeep')) return '🚙';
    if (d.includes('game') || d.includes('roblox')) return '🎮';
    if (d.includes('school') || d.includes('print')) return '📚';
    return '💳'; 
}
