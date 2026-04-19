let state = initializeState();

function initializeState() {
    let saved = JSON.parse(localStorage.getItem('aetherCoreDataV5'));
    const defaultState = {
        balance: 0,
        history: [],
        goals: [], 
        income: 1000,
        streak: 0,
        xp: 0,
        level: 1,
        savingsPercent: 20, // Strategic Reserve %
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
    
    // Leveling Logic: 50 XP per transaction
    state.xp = state.history.length * 50;
    state.level = Math.floor(state.xp / 500) + 1;

    state.graphData = [0];
    let running = 0;
    [...state.history].reverse().forEach(t => { 
        running += t.amount; 
        state.graphData.push(running); 
    });
}

function detectCategory(desc) {
    const d = desc.toLowerCase();
    if (d.includes('food') || d.includes('eat')) return '🍔';
    if (d.includes('fare') || d.includes('jeep') || d.includes('grab')) return '🚙';
    if (d.includes('game') || d.includes('roblox') || d.includes('codm') || d.includes('load')) return '🎮';
    if (d.includes('school') || d.includes('project') || d.includes('print')) return '📚';
    return '💳'; 
}
