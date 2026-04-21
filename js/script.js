// AETHER CORE v5.3 - The "HIM" Update (Hyper-Predictive Neural Engine)
// Hardware-Optimized for Dimensity processing | Engineered by Miguel Bernados

let pendingTx = null; // Stores temporary transaction data for the modal

let state = JSON.parse(localStorage.getItem('aetherCoreData')) || {
    balance: 0,
    generalSavings: 0, 
    history: [],
    goal: { name: "VOID", target: 0, date: null, buffer: 0 },
    income: 200,
    incomeSchedule: [1, 2, 3, 4],
    streak: 0,
    graphData: [0],
    lastFuelDate: null, 
    settings: { darkMode: false, name: "MIGUEL | PSHS-CRC" },
    // NEW: Deep Learning State Variables
    metrics: {
        categoryAverages: {}, 
        dayOfWeekBurn: {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0}, 
        totalDaysTracked: 0
    }
};

if (state.graphData.length === 0) state.graphData.push(state.balance);

// Ensure legacy users get the new metrics object
if (!state.metrics) state.metrics = { categoryAverages: {}, dayOfWeekBurn: {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0}, totalDaysTracked: 0 };

let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    applySettings();
    initChart();
    checkAutoSweep();
    updateUI();
});

// --- NEW: AUTO-SWEEP PROTOCOL (v5.1) ---
function checkAutoSweep() {
    const isMissionActive = state.goal && state.goal.target > 0 && state.goal.date;
    
    // If no mission exists but there's a balance, migrate it to the Vault
    if (!isMissionActive && state.balance > 0) {
        const sweepAmount = state.balance;
        state.generalSavings += sweepAmount;
        state.balance = 0;
        
        state.history.unshift({
            id: Date.now(), date: new Date().toLocaleDateString(),
            desc: "🧹 AUTO-SWEEP: Assets Secured to Vault", amount: sweepAmount,
            icon: '🛡️', spendType: 'income'
        });
        console.log(`System: ₱${sweepAmount.toFixed(0)} migrated to Quantum Vault.`);
    }
}

function toggleRoutingDropdown() {
    const type = document.getElementById('type').value;
    const routingContainer = document.getElementById('routing-container');
    routingContainer.style.display = type === 'income' ? 'block' : 'none';
}

// --- CORE NEURAL ROUTING (INCOME) v5.3 ---
function routeIncome(amount, sourceDesc, routeMode = 'auto') {
    let amountForGoal = 0;
    let surplusForVault = 0;

    if (routeMode === 'auto') {
        // 1. Mandatory Vault Tax (e.g., 20% always goes to savings first)
        const vaultTaxRate = 0.20; 
        const mandatoryVault = amount * vaultTaxRate;
        let shareableAmount = amount - mandatoryVault;

        const isMissionActive = state.goal && state.goal.target > 0 && state.goal.date;

        if (isMissionActive) {
            const targetDate = new Date(state.goal.date);
            targetDate.setDate(targetDate.getDate() - state.goal.buffer);
            
            const daysLeft = Math.max(1, Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24)));
            const remaining = state.goal.target - state.balance;
            const dailyReq = Math.max(0, remaining / daysLeft);

            // Route the shareable amount to the goal up to the daily requirement
            if (shareableAmount > dailyReq) {
                amountForGoal = dailyReq;
                surplusForVault = (shareableAmount - dailyReq) + mandatoryVault;
            } else {
                amountForGoal = shareableAmount;
                surplusForVault = mandatoryVault;
            }
        } else {
            // VOID MODE: 100% to Vault
            surplusForVault = amount;
            amountForGoal = 0;
        }
    } else if (routeMode === 'mission') {
        // MANUAL OVERRIDE: 100% to Mission
        amountForGoal = amount;
        surplusForVault = 0;
    } else if (routeMode === 'vault') {
        // MANUAL OVERRIDE: 100% to Vault
        amountForGoal = 0;
        surplusForVault = amount;
    }

    // Apply to State
    if (amountForGoal > 0) {
        state.balance += amountForGoal;
        state.history.unshift({
            id: Date.now(), date: new Date().toLocaleDateString(),
            desc: routeMode === 'auto' ? `🎯 MISSION ROUTE: ${sourceDesc}` : `⚡ MANUAL LIQUID: ${sourceDesc}`, 
            amount: amountForGoal,
            icon: '⚡', spendType: 'income'
        });
    }

    if (surplusForVault > 0) {
        state.generalSavings += surplusForVault;
        state.history.unshift({
            id: Date.now() + 1, date: new Date().toLocaleDateString(),
            desc: routeMode === 'auto' ? `🏦 VAULT ROUTE: ${sourceDesc}` : `💎 MANUAL RESERVE: ${sourceDesc}`, 
            amount: surplusForVault,
            icon: '💎', spendType: 'income'
        });
    }

    state.graphData.push(state.balance);
    state.streak++;
    
    state.lastFuelDate = new Date().toLocaleDateString(); 
    
    save(); 
    updateUI(); 
    
    // Dynamic alerts based on what mode fired
    if (routeMode === 'auto') {
        alert(`Split Execution:\n🎯 Mission: ₱${amountForGoal.toFixed(0)}\n💎 Vault: ₱${surplusForVault.toFixed(0)}`);
    } else if (routeMode === 'mission') {
        alert(`Manual Override:\n⚡ ₱${amount.toFixed(0)} injected into Mission Assets.`);
    } else if (routeMode === 'vault') {
        alert(`Manual Override:\n💎 ₱${amount.toFixed(0)} secured in Quantum Vault.`);
    }
}

// --- V5 DYNAMIC ANOMALY & NLP CATEGORIZATION ---
function detectCategoryAndAnomaly(desc, amount) {
    const d = desc.toLowerCase();
    let category = { icon: '💳', type: 'misc', name: 'Misc' }; 
    
    const categories = {
        '🍔': { regex: /\b(food|lunch|snack|burger|pizza|eat|meal|coffee|drink|water|grocery|mcdo|jollibee|kfc|rice|canteen)\b/, type: 'need', name: 'Food & Dining' },
        '🚙': { regex: /\b(fare|jeep|transpo|trike|gas|taxi|grab|bus|commute|ride|angkas|joyride|tricycle)\b/, type: 'need', name: 'Transport' },
        '🎮': { regex: /\b(codm|roblox|game|steam|play|skin|valorant|topup|rp|vbucks|load|data|promo)\b/, type: 'want', name: 'Gaming/Digital' },
        '📚': { regex: /\b(school|print|project|book|tuition|supplies|pen|paper|copy|xerox|contribution)\b/, type: 'need', name: 'Academic' },
        '👕': { regex: /\b(clothes|shirt|shoes|apparel|fit|pants|mall|thrifting|ukay|jacket|haircut)\b/, type: 'want', name: 'Lifestyle' },
        '🎬': { regex: /\b(movie|cinema|netflix|ticket|concert|sub|spotify|premium|date)\b/, type: 'want', name: 'Entertainment' },
        '🚨': { regex: /\b(emergency|med|hospital|clinic|repair|fix)\b/, type: 'need', name: 'Emergency' }
    };
    
    for (let [icon, data] of Object.entries(categories)) {
        if (data.regex.test(d)) {
            category = { icon: icon, type: data.type, name: data.name }; 
            break;
        }
    }

    const catName = category.icon;
    if (!state.metrics.categoryAverages[catName]) {
        state.metrics.categoryAverages[catName] = { total: 0, count: 0, avg: 0 };
    }
    
    const catStats = state.metrics.categoryAverages[catName];
    const isAnomaly = (catStats.count >= 3 && amount > (catStats.avg * 1.8)) || (amount > state.income * 0.50);

    if (isAnomaly) {
        category.icon = '⚠️'; 
    }

    catStats.total += amount;
    catStats.count += 1;
    catStats.avg = catStats.total / catStats.count;

    const todayNum = new Date().getDay();
    state.metrics.dayOfWeekBurn[todayNum] = ((state.metrics.dayOfWeekBurn[todayNum] || 0) + amount) / 2; 

    return category;
}

// --- TRANSACTION ENTRY v5.2 (MULTI-VECTOR SUPPORT) ---
document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc').value;
    const routeMode = document.getElementById('income-route').value; // Gets the route choice

    if (isNaN(amount) || amount <= 0) return; 

    if (type === 'income') {
        routeIncome(amount, desc, routeMode);
    } else {
        const analysis = detectCategoryAndAnomaly(desc, amount);
        pendingTx = { amount, desc, analysis };
        
        const modal = document.getElementById('vector-modal');
        const msgEl = document.getElementById('vector-message');
        
        msgEl.innerHTML = `Deduct <strong>₱${amount.toFixed(0)}</strong> for ${desc}?<br>
        <small style="color:var(--text-muted)">Anomaly Status: ${analysis.icon === '⚠️' ? 'HIGH VELOCITY' : 'STABLE'}</small>`;
        
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }
    e.target.reset();
    document.getElementById('routing-container').style.display = 'none'; // Reset UI
});

function closeVectorModal() {
    const modal = document.getElementById('vector-modal');
    modal.classList.remove('active'); 
    setTimeout(() => {
        modal.style.display = 'none';
        pendingTx = null;
    }, 300); 
}

function executeVector(vector) {
    if (!pendingTx) return;
    const { amount, desc, analysis } = pendingTx;

    if (vector === "balance") {
        if (state.balance < amount) {
            if (state.generalSavings >= amount) {
                alert("MISSION ASSETS DEPLETED. Emergency Vault Pull Initialized.");
                state.generalSavings -= amount;
                state.balance += amount; 
            } else {
                alert("CRITICAL ERROR: Insufficient Reserves.");
                closeVectorModal();
                return;
            }
        }
        state.balance -= amount;
    } else if (vector === "vault") {
        if (state.generalSavings >= amount) {
            state.generalSavings -= amount;
        } else {
            alert("VAULT RESERVES EMPTY.");
            closeVectorModal();
            return;
        }
    }

    state.history.unshift({
        id: Date.now(), 
        date: new Date().toLocaleDateString(),
        desc: `${vector === "vault" ? '[VAULT] ' : ''}${desc}`, 
        amount: -amount, 
        icon: analysis.icon, 
        spendType: analysis.type
    });
    
    const todayNum = new Date().getDay();
    state.metrics.dayOfWeekBurn[todayNum] = ((state.metrics.dayOfWeekBurn[todayNum] || 0) + amount) / 2;

    state.graphData.push(state.balance); 
    
    closeVectorModal();
    save(); 
}

// --- V5 ADVANCED BURN RATE (WEIGHTED VELOCITY) ---
function calculateBurnRate() {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const recentExpenses = state.history.filter(t => t.amount < 0 && t.id > thirtyDaysAgo);
    const ultraRecent = state.history.filter(t => t.amount < 0 && t.id > sevenDaysAgo);
    
    const burnText = document.getElementById('burn-rate-display');
    
    if (recentExpenses.length > 1) {
        const totalBurn30 = recentExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const oldest30 = Math.min(...recentExpenses.map(t => t.id));
        const daysSpan30 = Math.max(1, (now - oldest30) / (1000 * 60 * 60 * 24));
        const baseBurn = totalBurn30 / daysSpan30;

        const totalBurn7 = ultraRecent.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const oldest7 = ultraRecent.length > 0 ? Math.min(...ultraRecent.map(t => t.id)) : now;
        const daysSpan7 = Math.max(1, (now - oldest7) / (1000 * 60 * 60 * 24));
        const velocityBurn = ultraRecent.length > 0 ? (totalBurn7 / daysSpan7) : baseBurn;

        state.trueDailyBurn = (velocityBurn * 0.6) + (baseBurn * 0.4); 

        const trendIcon = velocityBurn > baseBurn ? '<i class="fas fa-arrow-trend-up" style="color:var(--danger)"></i>' : '<i class="fas fa-arrow-trend-down" style="color:var(--success)"></i>';

        burnText.innerHTML = `${trendIcon} Kinetic Burn: ₱${state.trueDailyBurn.toFixed(0)} / day`;
        burnText.style.color = state.trueDailyBurn > (state.income / 7) ? '#fca5a5' : '#86efac';
    } else {
        state.trueDailyBurn = 0;
        burnText.innerText = "System calibrating neural weights...";
        burnText.style.color = "var(--text-muted)";
    }
}

// --- V5 AETHER LOGIC (CONTEXT-AWARE ADVISORY) ---
function calculateAetherLogic() {
    const healthEl = document.getElementById('health-score');
    const adviceEl = document.getElementById('smart-advice');
    const actionZone = document.getElementById('action-zone');
    actionZone.innerHTML = ""; 

    const todayDateString = new Date().toLocaleDateString();
    const alreadyConfirmed = state.lastFuelDate === todayDateString;
    const todayNum = new Date().getDay(); 
    const isPayday = state.incomeSchedule.includes(todayNum);
    
    const numPaydays = state.incomeSchedule.length || 1;
    const amountPerPayday = state.income / numPaydays;
    const dailyIncome = isPayday ? amountPerPayday : 0;
    
    if (state.goal.target > 0) {
        document.getElementById('goal-name-display').innerText = state.goal.name;
        const progress = Math.min((state.balance / state.goal.target) * 100, 100);
        document.getElementById('goal-progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-percent').innerText = `${Math.round(progress)}%`;
        
        const targetDate = new Date(state.goal.date);
        targetDate.setDate(targetDate.getDate() - state.goal.buffer);
        const daysLeft = Math.max(1, Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24)));
        const remaining = state.goal.target - state.balance;
        const dailyReq = remaining / daysLeft;

        document.getElementById('goal-stats').innerText = remaining > 0 ? `₱${Math.round(remaining).toLocaleString()} remaining` : "Quota Met";

        if (remaining <= 0) {
            healthEl.innerText = "MAX RESONANCE";
            healthEl.style.color = "var(--success)";
            adviceEl.innerText = `Objective '${state.goal.name}' secured. Awaiting manual extraction.`;
            actionZone.innerHTML = `<button onclick="redeemGoal()" class="claim-btn">REDEEM ASSET</button>`;
        } 
        else if (state.generalSavings >= remaining) {
            healthEl.innerText = "VAULT OVERRIDE AVAILABLE";
            healthEl.style.color = "#a855f7"; 
            adviceEl.innerHTML = `Your Vault reserves (₱${state.generalSavings.toFixed(0)}) exceed the remaining mission deficit (₱${remaining.toFixed(0)}). You can bypass the timeline and execute acquisition immediately.`;
            actionZone.innerHTML = `<button onclick="transferToMission()" class="btn-primary hover-glow" style="width:100%; margin-top:10px;">AUTHORIZE VAULT TRANSFER</button>`;
            generatePredictions(dailyReq, 0, state.trueDailyBurn);
        }
        else if (alreadyConfirmed) {
            healthEl.innerText = "SYNCED";
            healthEl.style.color = "var(--success)";
            adviceEl.innerHTML = `Neural pathways optimal. Today's required mass has been processed.<br><small style="color:var(--text-muted)">Projecting tomorrow's vector...</small>`;
            generatePredictions(dailyReq, 0, state.trueDailyBurn); 
        }
        else if (!isPayday) {
            healthEl.innerText = "DRIFTING";
            healthEl.style.color = "var(--warning)";
            adviceEl.innerHTML = `Non-income cycle. System is relying on existing mass. Maintain a burn rate below ₱${(state.balance/daysLeft).toFixed(0)} to prevent structural collapse.`;
            generatePredictions(dailyReq, 0, state.trueDailyBurn); 
        } 
        else {
            const projectedBurn = state.trueDailyBurn || (dailyIncome * 0.2);
            const surplus = dailyIncome - projectedBurn - dailyReq;

            if (dailyReq > dailyIncome) {
                healthEl.innerText = "CRITICAL DEFICIT";
                healthEl.style.color = "var(--danger)";
                adviceEl.innerHTML = `Mathematical impossibility detected. Mission requires <strong>₱${dailyReq.toFixed(0)}/day</strong>, but intake is capped at <strong>₱${dailyIncome.toFixed(0)}</strong>. Restructure timeline.`;
            } else if (surplus < 0) {
                healthEl.innerText = "UNSTABLE";
                healthEl.style.color = "var(--warning)";
                adviceEl.innerHTML = `High probability of failure. After mission allocation, your remaining fuel (₱${(dailyIncome - dailyReq).toFixed(0)}) is lower than your kinetic burn (₱${projectedBurn.toFixed(0)}).`;
            } else {
                healthEl.innerText = "OPTIMAL";
                healthEl.style.color = "var(--primary)";
                adviceEl.innerHTML = `Trajectories aligned. Process the sync to secure <strong>₱${dailyReq.toFixed(0)}</strong> for the mission. The remaining <strong>₱${surplus.toFixed(0)}</strong> will be routed to the Vault.`;
            }
            generatePredictions(dailyReq, surplus, projectedBurn);
        }
    } else {
        healthEl.innerText = "SOVEREIGN MODE"; 
        healthEl.style.color = "#60a5fa"; 
        
        adviceEl.innerHTML = `Wealth-Building Mode Active. No mission vectors detected. <strong>100% of incoming mass</strong> is being hard-routed to the Quantum Vault to maximize long-term reserves.`;
        
        document.getElementById('goal-name-display').innerText = "NO MISSION DETECTED";
        generatePredictions(0, dailyIncome, state.trueDailyBurn || 0);
    }
}

// --- V5 HYPER-PREDICTIVE MODEL ---
function generatePredictions(dailyTarget, dailySurplus, baseBurn) {
    const predBody = document.getElementById('prediction-body');
    const tableHead = document.querySelector('.prediction-table thead tr');
    if (tableHead) {
        tableHead.innerHTML = `<th>Timeline</th><th>Projected Balance</th><th>Vault Reserves</th>`;
    }

    let rows = "";
    let tempBalance = state.balance;
    let tempSavings = state.generalSavings || 0; 
    
    const numPaydays = state.incomeSchedule.length || 1;
    const amountPerPayday = state.income / numPaydays;
    
    for (let i = 1; i <= 7; i++) {
        let date = new Date();
        date.setDate(date.getDate() + i);
        const dayOfWeek = date.getDay(); 
        
        const learnedBurn = state.metrics.dayOfWeekBurn[dayOfWeek] || 0;
        const projectedBurnForDay = learnedBurn > 0 ? learnedBurn : baseBurn;
        
        if (state.incomeSchedule.includes(dayOfWeek)) {
            if (state.goal.target > 0) {
                tempBalance += amountPerPayday;
                tempBalance -= projectedBurnForDay;
                if (amountPerPayday > dailyTarget) {
                    tempBalance -= (amountPerPayday - dailyTarget); 
                    tempSavings += (amountPerPayday - dailyTarget);
                }
            } else {
                 tempSavings += amountPerPayday;
                 tempBalance -= projectedBurnForDay;
            }
        } else {
            tempBalance -= projectedBurnForDay;
        }
        
        const balanceColor = tempBalance < 0 ? "var(--danger)" : "var(--text-main)";

        rows += `
            <tr class="table-row-hover hover-lift-slight">
                <td>${date.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})} <small style="color:var(--text-muted); font-size:0.7em;">[-₱${projectedBurnForDay.toFixed(0)}]</small></td>
                <td style="color: ${balanceColor};">₱${tempBalance.toFixed(0)}</td>
                <td style="color: var(--primary); font-weight: bold;">₱${tempSavings.toFixed(0)}</td>
            </tr>`;
    }
    
    predBody.innerHTML = rows;
}

// STANDARD UTILS & UI CONTROLS
function checkFuelPanel() {
    const fuelPanel = document.getElementById('fuel-panel');
    const today = new Date().getDay();
    const todayDateString = new Date().toLocaleDateString();
    const isPayday = state.incomeSchedule.includes(today);
    const alreadyConfirmed = state.lastFuelDate === todayDateString;

    if (isPayday && !alreadyConfirmed) {
        if(state.goal.target > 0) {
            const targetDate = new Date(state.goal.date);
            targetDate.setDate(targetDate.getDate() - state.goal.buffer);
            const daysLeft = Math.max(1, Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24)));
            const remaining = state.goal.target - state.balance;
            const dailyReq = Math.max(0, remaining / daysLeft);
            document.getElementById('fuel-message').innerText = `Mission Sync: ${state.goal.name}. Confirm today's quota of ₱${dailyReq.toFixed(0)}?`;
            fuelPanel.setAttribute('data-pending', dailyReq); 
        } else {
             document.getElementById('fuel-message').innerText = `Wealth Sync: No active mission. Route full intake to Quantum Vault?`;
             fuelPanel.setAttribute('data-pending', 0); 
        }
        fuelPanel.style.display = 'block';
    } else {
        fuelPanel.style.display = 'none';
    }
}

function confirmFuel(received) {
    const fuelPanel = document.getElementById('fuel-panel');
    const msg = document.getElementById('fuel-message');

    if (received) {
        const pending = parseFloat(fuelPanel.getAttribute('data-pending')) || 0;
        const defaultVal = pending > 0
            ? pending
            : state.income / Math.max(1, state.incomeSchedule.length);

        msg.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-top:5px; flex-wrap:wrap;">
                <span>Confirm Intake: ₱</span>
                <input type="number" id="sync-amount" value="${defaultVal.toFixed(0)}"
                       min="1" step="1"
                       style="background:rgba(255,255,255,0.1); border:1px solid var(--primary); color:white; width:100px; padding:4px; border-radius:4px;">
                <button type="button" id="execute-sync-btn" class="btn-primary" style="padding:4px 12px; font-size:0.8rem;">EXECUTE</button>
            </div>
        `;

        document.getElementById('execute-sync-btn')
            .addEventListener('click', finalizeSync, { once: true });

    } else {
        state.lastFuelDate = new Date().toLocaleDateString();
        fuelPanel.style.display = 'none';
        save();
    }
}

function finalizeSync() {
    const input = document.getElementById('sync-amount');
    const amount = input ? parseFloat(input.value) : NaN;

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    state.lastFuelDate = new Date().toLocaleDateString();
    document.getElementById('fuel-panel').style.display = 'none';

    routeIncome(amount, "Daily Sync");
}

function transferToMission() {
    const remaining = state.goal.target - state.balance;
    const maxPossible = state.generalSavings;
    
    if (maxPossible <= 0) {
        alert("Quantum Vault is empty. No mass available for transfer.");
        return;
    }

    let defaultTransfer = Math.min(maxPossible, remaining);
    if (defaultTransfer < 0) defaultTransfer = 0;

    let amount = parseFloat(prompt(`VAULT EXTRACTION\nAvailable: ₱${maxPossible.toFixed(0)}\nNeeded for Mission: ₱${remaining.toFixed(0)}\n\nEnter amount to transfer:`, defaultTransfer.toFixed(0)));
    
    if (isNaN(amount) || amount <= 0) return; 

    if (amount > 0 && amount <= maxPossible) {
        state.generalSavings -= amount;
        state.balance += amount;
        state.history.unshift({
            id: Date.now(), date: new Date().toLocaleDateString(),
            desc: "🔄 VAULT EXTRACTION: Manual Sync", amount: amount, icon: '📦', spendType: 'income'
        });
        save();
        alert(`₱${amount.toFixed(0)} successfully fused with Mission Assets.`);
    } else if (amount > maxPossible) {
        alert("Transfer exceeds Vault capacity.");
    }
}

document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day);
        if (state.incomeSchedule.includes(day)) {
            state.incomeSchedule = state.incomeSchedule.filter(d => d !== day);
            btn.classList.remove('active');
        } else {
            state.incomeSchedule.push(day);
            btn.classList.add('active');
        }
        save();
    });
});

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 400); 
    } else {
        modal.style.display = 'flex';
        void modal.offsetWidth;
        modal.classList.add('active');
        document.getElementById('settings-name').value = state.settings.name;
        document.getElementById('dark-mode-toggle').checked = state.settings.darkMode;
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.toggle('active', state.incomeSchedule.includes(parseInt(btn.dataset.day)));
        });
    }
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
    if (chartInstance) {
        chartInstance.options.scales.x.grid.color = state.settings.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        chartInstance.options.scales.y.grid.color = state.settings.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        chartInstance.update();
    }
}

function redeemGoal() {
    const cost = state.goal.target;
    state.balance -= cost;
    state.history.unshift({
        id: Date.now(), date: new Date().toLocaleDateString(),
        desc: `🏆 SECURED: ${state.goal.name}`, amount: -cost, icon: '🎯', spendType: 'goal'
    });
    state.goal = { name: "VOID", target: 0, date: null, buffer: 0 };
    state.graphData.push(state.balance);
    
    save();
    alert("System Overload: Mission Accomplished. Asset acquired.");
}

document.getElementById('goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.goal = {
        name: document.getElementById('goal-name').value,
        target: parseFloat(document.getElementById('goal-target').value),
        date: document.getElementById('goal-date').value,
        buffer: parseInt(document.getElementById('goal-buffer').value) || 0
    };

    const remaining = state.goal.target - state.balance;
    if (state.generalSavings >= remaining && remaining > 0) {
        alert(`STRATEGIC INSIGHT: Your Quantum Vault already has enough mass to finance '${state.goal.name}' instantly.`);
    }

    save();
});

function editStat(type) {
    // Dynamically grab the current value based on the type requested. Default to 0 if missing.
    let currentValue = state[type] !== undefined ? state[type] : 0;
    
    // Format the display name to look better in the prompt (e.g., GENERALSAVINGS -> VAULT RESERVES)
    let displayName = type === 'generalSavings' ? 'VAULT RESERVES' : type.toUpperCase();
    
    let newVal = prompt(`Manual Override [${displayName}]:\nEnter new calibrated value:`, currentValue);
    
    // Ensure the user actually typed a number and didn't just hit cancel or leave it blank
    if (newVal !== null && newVal.trim() !== "" && !isNaN(newVal)) {
        state[type] = parseFloat(newVal);
        
        // Log the manual override in the history ledger for tracking
        state.history.unshift({
            id: Date.now(), 
            date: new Date().toLocaleDateString(),
            desc: `🔧 OVERRIDE: ${displayName} Calibrated`, 
            amount: parseFloat(newVal), 
            icon: '⚙️', 
            spendType: 'system'
        });
        
        save();
        alert(`System Alert: ${displayName} successfully recalibrated to ₱${parseFloat(newVal).toFixed(0)}`);
    }
}

function save() {
    localStorage.setItem('aetherCoreData', JSON.stringify(state));
    updateUI();
}

function updateUI() {
    checkAutoSweep();
    
    calculateBurnRate(); 
    calculateAetherLogic();
    
    document.getElementById('total-balance').innerText = `₱${state.balance.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
    const vaultEl = document.getElementById('savings-vault');
    if (vaultEl) vaultEl.innerText = `₱${(state.generalSavings || 0).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
    document.getElementById('weekly-inc').innerText = `₱${state.income.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
    document.getElementById('buffer-display').innerText = `${state.goal.buffer} Days`;
    document.getElementById('streak-count').innerText = `🔥 ${state.streak} Day Pulse`;
    
    const totalWealth = state.balance + (state.generalSavings || 0);
    const level = Math.max(1, Math.floor(totalWealth / 500) + 1);
    document.getElementById('aura-level').innerText = `LVL ${level}`;

    renderLedger();
    checkFuelPanel();
    if (chartInstance) updateChart();
}

function renderLedger() {
    const body = document.getElementById('history-body');
    body.innerHTML = state.history.slice(0, 6).map(item => `
        <tr class="table-row-hover hover-lift-slight">
            <td style="font-size: 1.2rem;">${item.icon || '💳'}</td>
            <td><strong>${item.desc}</strong><br><small style="color: var(--text-muted)">${item.date}</small></td>
            <td style="text-align:right; font-weight: 700; color: ${item.amount > 0 ? 'var(--success)' : 'var(--text-main)'}">
                ${item.amount > 0 ? '+' : ''}₱${Math.abs(item.amount).toFixed(0)}
            </td>
        </tr>
    `).join('');
}

function updateChart() {
    chartInstance.data.labels = state.history.slice(0, 15).reverse().map(i => i.date) || ['Sync'];
    chartInstance.data.datasets[0].data = state.graphData.slice(-15);
    chartInstance.update(); 
}

function initChart() {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sync'],
            datasets: [{
                label: 'Asset Vector', data: state.graphData, borderColor: '#6366f1',
                borderWidth: 3, tension: 0.4, fill: true, backgroundColor: gradient,
                pointBackgroundColor: '#a855f7', pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false, animation: { duration: 400, easing: 'easeOutQuart' },
            plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' } } }
        }
    });
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `AETHER_CORE_BACKUP_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

document.getElementById('clear-data').addEventListener('click', () => {
    if (confirm("WARNING: Initiating total system purge. All data will be destroyed. Proceed?")) {
        localStorage.clear();
        location.reload();
    }
});
