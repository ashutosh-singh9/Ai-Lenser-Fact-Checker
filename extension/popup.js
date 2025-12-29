/**
 * AI LENSER Extension - Popup Script
 */

const API_BASE = 'http://localhost:5000/api';

// DOM Elements
const elements = {
    openWebsite: document.getElementById('openWebsite'),
    navBtns: document.querySelectorAll('.nav-btn'),
    checkTab: document.getElementById('checkTab'),
    scanTab: document.getElementById('scanTab'),
    historyTab: document.getElementById('historyTab'),
    textInput: document.getElementById('textInput'),
    verifyBtn: document.getElementById('verifyBtn'),
    resultContainer: document.getElementById('resultContainer'),
    resultBadge: document.getElementById('resultBadge'),
    resultScore: document.getElementById('resultScore'),
    trustFill: document.getElementById('trustFill'),
    resultDetails: document.getElementById('resultDetails'),
    scanPageBtn: document.getElementById('scanPageBtn'),
    snippetBtn: document.getElementById('snippetBtn'),
    selectTextBtn: document.getElementById('selectTextBtn'),
    scanStatus: document.getElementById('scanStatus'),
    historyList: document.getElementById('historyList'),
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initVerification();
    initScanOptions();
    loadHistory();

    // Open website button
    elements.openWebsite.addEventListener('click', () => {
        chrome.tabs.create({ url: 'http://localhost:5000' });
    });
});

// Navigation
function initNavigation() {
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            elements.navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            elements.checkTab.classList.toggle('active', tab === 'check');
            elements.scanTab.classList.toggle('active', tab === 'scan');
            elements.historyTab.classList.toggle('active', tab === 'history');

            if (tab === 'history') {
                loadHistory();
            }
        });
    });
}

// Verification
function initVerification() {
    elements.verifyBtn.addEventListener('click', handleVerify);

    elements.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleVerify();
        }
    });
}

async function handleVerify() {
    const text = elements.textInput.value.trim();
    if (!text) {
        elements.textInput.style.borderColor = '#ef4444';
        setTimeout(() => {
            elements.textInput.style.borderColor = '';
        }, 1000);
        return;
    }

    elements.verifyBtn.classList.add('loading');

    try {
        const response = await fetch(`${API_BASE}/analyze-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (data.success) {
            showResult(data.result);
            saveToHistory(text, data.result);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('API Error:', error);
        // Fallback demo result
        const demoResult = getDemoResult(text);
        showResult(demoResult);
        saveToHistory(text, demoResult);
    } finally {
        elements.verifyBtn.classList.remove('loading');
    }
}

function getDemoResult(text) {
    const isFake = /forward|share|viral|breaking|urgent|cure|miracle|whatsapp/i.test(text);
    const trustScore = isFake ? Math.floor(Math.random() * 30) + 10 : Math.floor(Math.random() * 30) + 65;

    return {
        prediction: trustScore < 40 ? 'FAKE' : trustScore > 60 ? 'REAL' : 'UNCERTAIN',
        trust_score: trustScore,
        confidence: Math.floor(Math.random() * 20) + 75,
        details: trustScore < 40
            ? '⚠️ Contains patterns commonly found in misinformation'
            : '✓ Text appears to follow credible news patterns'
    };
}

function showResult(result) {
    const score = result.trust_score;

    elements.resultBadge.textContent = result.prediction;
    elements.resultBadge.className = 'result-badge';
    if (result.prediction === 'FAKE') {
        elements.resultBadge.classList.add('fake');
    } else if (result.prediction === 'REAL') {
        elements.resultBadge.classList.add('real');
    }

    elements.resultScore.textContent = `${score}%`;
    elements.trustFill.style.width = `${100 - score}%`;
    elements.resultDetails.textContent = result.details;
}

// Scan Options
function initScanOptions() {
    elements.scanPageBtn.addEventListener('click', scanPage);
    elements.snippetBtn.addEventListener('click', startSnippet);
    elements.selectTextBtn.addEventListener('click', selectText);
}

async function scanPage() {
    updateScanStatus('Scanning page...', 'loading');

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                // Get main text content from the page
                const article = document.querySelector('article');
                const main = document.querySelector('main');
                const body = document.body;

                let text = '';
                if (article) {
                    text = article.innerText;
                } else if (main) {
                    text = main.innerText;
                } else {
                    // Get paragraphs
                    const paragraphs = document.querySelectorAll('p');
                    text = Array.from(paragraphs).map(p => p.innerText).join(' ');
                }

                return text.substring(0, 1000); // Limit to 1000 chars
            }
        });

        if (results && results[0] && results[0].result) {
            const pageText = results[0].result;
            elements.textInput.value = pageText;

            // Switch to check tab
            elements.navBtns[0].click();

            // Auto verify
            handleVerify();

            updateScanStatus('Page scanned successfully!', 'success');
        } else {
            updateScanStatus('No content found', 'error');
        }
    } catch (error) {
        console.error('Scan error:', error);
        updateScanStatus('Unable to scan page', 'error');
    }
}

async function startSnippet() {
    updateScanStatus('Click and drag to capture area...', 'loading');

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                // Inject snippet selector
                if (document.getElementById('ailenser-overlay')) return;

                const overlay = document.createElement('div');
                overlay.id = 'ailenser-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.3);
                    z-index: 999999;
                    cursor: crosshair;
                `;

                const selection = document.createElement('div');
                selection.id = 'ailenser-selection';
                selection.style.cssText = `
                    position: fixed;
                    border: 2px solid #0891b2;
                    background: rgba(8, 145, 178, 0.1);
                    z-index: 1000000;
                    display: none;
                `;

                document.body.appendChild(overlay);
                document.body.appendChild(selection);

                let startX, startY;

                overlay.addEventListener('mousedown', (e) => {
                    startX = e.clientX;
                    startY = e.clientY;
                    selection.style.left = startX + 'px';
                    selection.style.top = startY + 'px';
                    selection.style.display = 'block';
                });

                overlay.addEventListener('mousemove', (e) => {
                    if (!startX) return;
                    const width = e.clientX - startX;
                    const height = e.clientY - startY;
                    selection.style.width = Math.abs(width) + 'px';
                    selection.style.height = Math.abs(height) + 'px';
                    if (width < 0) selection.style.left = e.clientX + 'px';
                    if (height < 0) selection.style.top = e.clientY + 'px';
                });

                overlay.addEventListener('mouseup', () => {
                    overlay.remove();
                    selection.remove();
                    alert('Screenshot captured! (Demo mode - OCR would process here)');
                });

                overlay.addEventListener('click', (e) => {
                    if (e.detail === 2) { // Double click to cancel
                        overlay.remove();
                        selection.remove();
                    }
                });
            }
        });

        // Close popup to let user interact
        window.close();
    } catch (error) {
        console.error('Snippet error:', error);
        updateScanStatus('Unable to start snippet tool', 'error');
    }
}

async function selectText() {
    updateScanStatus('Select text on the page...', 'loading');

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                document.addEventListener('mouseup', function handler() {
                    const selectedText = window.getSelection().toString().trim();
                    if (selectedText) {
                        // Send to extension
                        chrome.runtime.sendMessage({
                            type: 'SELECTED_TEXT',
                            text: selectedText
                        });
                    }
                    document.removeEventListener('mouseup', handler);
                }, { once: true });
            }
        });

        window.close();
    } catch (error) {
        console.error('Select text error:', error);
        updateScanStatus('Unable to start text selection', 'error');
    }
}

function updateScanStatus(message, type) {
    const statusIcon = elements.scanStatus.querySelector('.status-icon');
    const statusText = elements.scanStatus.querySelector('p');

    statusText.textContent = message;

    if (type === 'success') {
        elements.scanStatus.style.background = 'rgba(16, 185, 129, 0.1)';
        elements.scanStatus.style.color = '#10b981';
    } else if (type === 'error') {
        elements.scanStatus.style.background = 'rgba(239, 68, 68, 0.1)';
        elements.scanStatus.style.color = '#ef4444';
    } else {
        elements.scanStatus.style.background = 'rgba(8, 145, 178, 0.1)';
        elements.scanStatus.style.color = '#0891b2';
    }
}

// History
async function loadHistory() {
    const history = await getLocalHistory();
    renderHistory(history);
}

async function getLocalHistory() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['ailenser_history'], (result) => {
            resolve(result.ailenser_history || []);
        });
    });
}

async function saveToHistory(text, result) {
    const history = await getLocalHistory();

    history.unshift({
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        result,
        timestamp: new Date().toLocaleString()
    });

    // Keep only last 20
    if (history.length > 20) {
        history.pop();
    }

    chrome.storage.local.set({ ailenser_history: history });
}

function renderHistory(history) {
    if (history.length === 0) {
        elements.historyList.innerHTML = `
            <div class="empty-history">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
                <p>No history yet</p>
            </div>
        `;
        return;
    }

    elements.historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-text">${item.text}</div>
            <div class="history-meta">
                <span class="history-badge ${item.result.prediction.toLowerCase()}">${item.result.prediction}</span>
                <span>${item.timestamp}</span>
            </div>
        </div>
    `).join('');
}
