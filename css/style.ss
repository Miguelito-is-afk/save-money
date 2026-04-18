:root {
    --bg-color: #f4f7f6;
    --card-bg: #ffffff;
    --primary: #27ae60;
    --secondary: #2c3e50;
    --accent: #e67e22;
    --danger: #e74c3c;
    --text: #333;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: var(--bg-color);
    color: var(--text);
    margin: 0;
}

.container {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    background: var(--secondary);
    color: white;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.card {
    background: var(--card-bg);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    margin-bottom: 20px;
}

.grid-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.grid-forms {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

input, select, button {
    width: 100%;
    padding: 10px;
    margin: 8px 0;
    border: 1px solid #ddd;
    border-radius: 6px;
}

button {
    background: var(--primary);
    color: white;
    font-weight: bold;
    cursor: pointer;
    border: none;
}

.progress-container {
    background: #eee;
    height: 20px;
    border-radius: 10px;
    overflow: hidden;
}

.progress-bar {
    background: var(--primary);
    width: 0%;
    height: 100%;
    transition: width 0.3s;
}

.status-card {
    margin-top: auto;
    background: #34495e;
    padding: 15px;
    border-radius: 8px;
    font-size: 0.9em;
}

.warning { color: var(--accent); border-left: 4px solid var(--accent); padding-left: 10px; }
.success { color: #2ecc71; }

.btn-danger { background: var(--danger); margin-top: 20px; }

@media (max-width: 768px) {
    .container { flex-direction: column; }
    .sidebar { width: 100%; }
    .grid-forms { grid-template-columns: 1fr; }
}
