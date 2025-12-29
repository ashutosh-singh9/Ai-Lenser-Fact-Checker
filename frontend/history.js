/**
 * AI LENSER - History Page JavaScript
 */

// Local Storage Keys
const STORAGE_KEYS = {
    theme: 'ailenser-theme',
    history: 'ailenser-history',
    stats: 'ailenser-stats'
};

// Demo history data (shown when no history exists)
const DEMO_HISTORY = [
    {
        id: 1,
        text: "Government announces free laptops for all students under new digital education scheme",
        result: { prediction: "FAKE", confidence: 0.89, trustScore: 15 },
        timestamp: "2 hours ago",
        fullTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 2,
        text: "RBI increases repo rate by 25 basis points to combat inflation",
        result: { prediction: "REAL", confidence: 0.94, trustScore: 92 },
        timestamp: "5 hours ago",
        fullTimestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 3,
        text: "WhatsApp message claims drinking hot water kills COVID-19 virus",
        result: { prediction: "FAKE", confidence: 0.97, trustScore: 8 },
        timestamp: "Yesterday",
        fullTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 4,
        text: "ISRO successfully launches Chandrayaan-3 mission from Sriharikota",
        result: { prediction: "REAL", confidence: 0.99, trustScore: 98 },
        timestamp: "Yesterday",
        fullTimestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 5,
        text: "5G towers emit harmful radiation causing health issues in nearby residents",
        result: { prediction: "FAKE", confidence: 0.92, trustScore: 12 },
        timestamp: "2 days ago",
        fullTimestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 6,
        text: "Supreme Court upholds reservation policy in educational institutions",
        result: { prediction: "REAL", confidence: 0.88, trustScore: 85 },
        timestamp: "3 days ago",
        fullTimestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 7,
        text: "Viral video shows earthquake in Delhi - actually footage from Turkey",
        result: { prediction: "FAKE", confidence: 0.95, trustScore: 10 },
        timestamp: "4 days ago",
        fullTimestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 8,
        text: "Mumbai Metro Line 3 inaugurated, connecting key areas of the city",
        result: { prediction: "REAL", confidence: 0.91, trustScore: 88 },
        timestamp: "5 days ago",
        fullTimestamp: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString()
    }
];

// DOM Elements
const historyList = document.getElementById('historyList');
const emptyState = document.getElementById('emptyState');
const totalChecksEl = document.getElementById('totalChecks');
const verifiedCountEl = document.getElementById('verifiedCount');
const fakeCountEl = document.getElementById('fakeCount');
const clearAllBtn = document.getElementById('clearAllBtn');
const themeToggle = document.getElementById('themeToggle');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadHistory();
    initEventListeners();
});

// Theme
function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    });
}

// Load history
function loadHistory() {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');

    // If no history, use demo data
    if (history.length === 0) {
        history = DEMO_HISTORY;
        // Save demo data to localStorage so it persists
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    }

    renderHistory(history);
    updateStats(history);
}

// Render history
function renderHistory(history) {
    if (!history || history.length === 0) {
        historyList.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';

    historyList.innerHTML = history.map((item, index) => {
        const prediction = item.result?.prediction || 'UNKNOWN';
        const predictionClass = prediction.toLowerCase();
        const trustScore = item.result?.trustScore || 50;
        const confidence = item.result?.confidence || 0.5;
        const text = item.text || item.fullText || 'Unknown text';
        const timestamp = item.timestamp || formatTimestamp(item.fullTimestamp);

        const statusIcon = prediction === 'REAL'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';

        return `
            <div class="history-card" data-index="${index}">
                <div class="status-indicator ${predictionClass}"></div>
                <div class="card-content">
                    <p class="card-text">${text}</p>
                    <div class="card-meta">
                        <span class="card-badge ${predictionClass}">
                            ${statusIcon}
                            ${prediction === 'REAL' ? 'Verified' : 'Debunked'}
                        </span>
                        <span class="card-score">Trust: ${trustScore}%</span>
                        <span class="card-time">${timestamp}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="action-btn recheck" title="Check Again" onclick="recheckItem(${index})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 4v6h-6M1 20v-6h6"/>
                            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" title="Delete" onclick="deleteItem(${index})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Update stats
function updateStats(history) {
    const total = history.length;
    const verified = history.filter(h => h.result?.prediction === 'REAL').length;
    const fake = history.filter(h => h.result?.prediction === 'FAKE').length;

    totalChecksEl.textContent = total;
    verifiedCountEl.textContent = verified;
    fakeCountEl.textContent = fake;

    // Also update localStorage stats
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify({ verified, fake }));
}

// Format timestamp
function formatTimestamp(isoString) {
    if (!isoString) return 'Unknown';

    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString();
}

// Event listeners
function initEventListeners() {
    clearAllBtn.addEventListener('click', clearAllHistory);
}

// Clear all history
function clearAllHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        localStorage.removeItem(STORAGE_KEYS.history);
        localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify({ verified: 0, fake: 0 }));
        renderHistory([]);
        updateStats([]);
    }
}

// Delete single item
window.deleteItem = function (index) {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
    history.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    renderHistory(history);
    updateStats(history);
};

// Recheck item
window.recheckItem = function (index) {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
    const item = history[index];
    if (item) {
        // Store text in sessionStorage and redirect
        sessionStorage.setItem('ailenser-recheck', item.text || item.fullText);
        window.location.href = 'index.html';
    }
};
