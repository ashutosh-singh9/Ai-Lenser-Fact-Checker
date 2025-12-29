/**
 * AI LENSER - Frontend JavaScript
 * Fake News Detection Web App
 */

// API Configuration
const API_BASE = 'http://localhost:5000/api';

// Local Storage Keys
const STORAGE_KEYS = {
    theme: 'ailenser-theme',
    history: 'ailenser-history',
    stats: 'ailenser-stats'
};

// DOM Elements
const elements = {
    // Side Panel
    sidePanel: document.getElementById('sidePanel'),
    menuBtn: document.getElementById('menuBtn'),
    panelClose: document.getElementById('panelClose'),
    panelOverlay: document.getElementById('panelOverlay'),
    extensionLink: document.getElementById('extensionLink'),

    // Theme
    themeToggle: document.getElementById('themeToggle'),

    // Stats
    verifiedCount: document.getElementById('verifiedCount'),
    fakeCount: document.getElementById('fakeCount'),

    // Input
    tabBtns: document.querySelectorAll('.tab-btn'),
    textTab: document.getElementById('textTab'),
    imageTab: document.getElementById('imageTab'),
    newsInput: document.getElementById('newsInput'),
    micBtn: document.getElementById('micBtn'),
    listeningIndicator: document.getElementById('listeningIndicator'),
    imageUploadArea: document.getElementById('imageUploadArea'),
    imageInput: document.getElementById('imageInput'),
    imagePreview: document.getElementById('imagePreview'),
    previewImg: document.getElementById('previewImg'),
    removeImage: document.getElementById('removeImage'),
    verifyBtn: document.getElementById('verifyBtn'),

    // Result
    resultSection: document.getElementById('resultSection'),
    resultBadge: document.getElementById('resultBadge'),
    meterFill: document.getElementById('meterFill'),
    meterNeedle: document.getElementById('meterNeedle'),
    trustScore: document.getElementById('trustScore'),
    verdictText: document.getElementById('verdictText'),
    confidenceText: document.getElementById('confidenceText'),
    analysisText: document.getElementById('analysisText'),
    shareBtn: document.getElementById('shareBtn'),
    newCheckBtn: document.getElementById('newCheckBtn'),
};

// State
let currentTab = 'text';
let isListening = false;
let recognition = null;
let uploadedImage = null;
let sidebarOpen = false; // Track sidebar state

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidePanel();
    initTabs();
    initImageUpload();
    initVoiceInput();
    initVerification();
    loadStats();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');

    elements.themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    });
}

// Side Panel - Simple sliding sidebar
function initSidePanel() {
    // Toggle sidebar on menu button click
    elements.menuBtn.addEventListener('click', toggleSidebar);

    // Close button
    elements.panelClose.addEventListener('click', closeSidebar);

    // Overlay click closes sidebar
    elements.panelOverlay.addEventListener('click', closeSidebar);

    // Extension link click
    elements.extensionLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Extension files are available in the /extension folder. Load it as an unpacked extension in Chrome.');
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            // On desktop, keep sidebar open
            elements.panelOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

function toggleSidebar() {
    sidebarOpen = !sidebarOpen;

    if (sidebarOpen) {
        elements.sidePanel.classList.add('open');
        if (window.innerWidth <= 1024) {
            elements.panelOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } else {
        elements.sidePanel.classList.remove('open');
        elements.panelOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeSidebar() {
    sidebarOpen = false;
    elements.sidePanel.classList.remove('open');
    elements.panelOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Tab Management
function initTabs() {
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (tab === currentTab) return;

            // Update active tab button
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show corresponding content
            elements.textTab.classList.toggle('active', tab === 'text');
            elements.imageTab.classList.toggle('active', tab === 'image');

            currentTab = tab;
        });
    });
}

// Image Upload
function initImageUpload() {
    // Click to upload
    elements.imageUploadArea.addEventListener('click', (e) => {
        if (!e.target.closest('.remove-image')) {
            elements.imageInput.click();
        }
    });

    // File input change
    elements.imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleImageFile(file);
    });

    // Drag and drop
    elements.imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.imageUploadArea.classList.add('dragover');
    });

    elements.imageUploadArea.addEventListener('dragleave', () => {
        elements.imageUploadArea.classList.remove('dragover');
    });

    elements.imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.imageUploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    });

    // Remove image
    elements.removeImage.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedImage = null;
        elements.imagePreview.classList.remove('active');
        elements.imageInput.value = '';
    });
}

function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage = e.target.result;
        elements.previewImg.src = uploadedImage;
        elements.imagePreview.classList.add('active');
    };
    reader.readAsDataURL(file);
}

// Voice Input
function initVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        elements.micBtn.style.display = 'none';
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
        isListening = true;
        elements.micBtn.classList.add('listening');
        elements.listeningIndicator.classList.add('active');
    };

    recognition.onend = () => {
        isListening = false;
        elements.micBtn.classList.remove('listening');
        elements.listeningIndicator.classList.remove('active');
    };

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        elements.newsInput.value = transcript;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        elements.micBtn.classList.remove('listening');
        elements.listeningIndicator.classList.remove('active');
    };

    elements.micBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
}

// Verification
function initVerification() {
    elements.verifyBtn.addEventListener('click', handleVerify);
    elements.newCheckBtn.addEventListener('click', resetForm);
    elements.shareBtn.addEventListener('click', shareResult);

    // Enter key to submit
    elements.newsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleVerify();
        }
    });
}

async function handleVerify() {
    if (elements.verifyBtn.classList.contains('loading')) return;

    let textToAnalyze = '';

    if (currentTab === 'text') {
        textToAnalyze = elements.newsInput.value.trim();
        if (!textToAnalyze) {
            shakeElement(elements.newsInput);
            return;
        }
    } else {
        if (!uploadedImage) {
            shakeElement(elements.imageUploadArea);
            return;
        }
        // For demo, we'll simulate OCR with a placeholder
        textToAnalyze = "Extracted text from uploaded image for analysis";
    }

    // Show loading
    elements.verifyBtn.classList.add('loading');
    elements.verifyBtn.disabled = true;

    try {
        const endpoint = currentTab === 'text' ? 'analyze-text' : 'analyze-image';
        const payload = currentTab === 'text'
            ? { text: textToAnalyze }
            : { image: uploadedImage, extracted_text: textToAnalyze };

        const response = await fetch(`${API_BASE}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            showResult(data.result);
            updateStatsDisplay(data.stats);
            // Save to local storage as backup
            saveToLocalHistory(textToAnalyze, data.result);
            loadHistory();
        } else {
            throw new Error(data.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Verification error:', error);
        // Fallback to local demo
        showDemoResult(textToAnalyze);
    } finally {
        elements.verifyBtn.classList.remove('loading');
        elements.verifyBtn.disabled = false;
    }
}

function showDemoResult(text) {
    // Demo fallback when API is not available
    const isFake = /forward|share|viral|breaking|urgent|cure|miracle/i.test(text);
    const trustScore = isFake ? Math.floor(Math.random() * 30) + 10 : Math.floor(Math.random() * 30) + 65;

    const result = {
        prediction: trustScore < 40 ? 'FAKE' : trustScore > 60 ? 'REAL' : 'UNCERTAIN',
        trust_score: trustScore,
        confidence: Math.floor(Math.random() * 20) + 75,
        label: trustScore < 40 ? 'Likely Fake' : trustScore > 60 ? 'Likely Authentic' : 'Verification Needed',
        details: trustScore < 40
            ? '⚠️ Contains patterns commonly found in misinformation'
            : trustScore > 60
                ? '✓ Text appears to follow credible news patterns'
                : '◐ Inconclusive - manual verification recommended'
    };

    showResult(result);

    // Save to local history - THIS WAS MISSING!
    saveToLocalHistory(text, result);

    // Update local stats
    updateLocalStats(result.prediction);

    // Reload history display
    loadHistory();
}

// Save to local storage
function saveToLocalHistory(text, result) {
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');

    const historyItem = {
        id: Date.now(),
        text: text.length > 100 ? text.substring(0, 100) + '...' : text,
        fullText: text,
        result: result,
        timestamp: new Date().toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
        }),
        type: currentTab
    };

    // Add to beginning
    history.unshift(historyItem);

    // Keep only last 50
    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
}

// Update local stats
function updateLocalStats(prediction) {
    let stats = JSON.parse(localStorage.getItem(STORAGE_KEYS.stats) || '{"verified": 0, "fake": 0}');

    if (prediction === 'FAKE') {
        stats.fake++;
    } else {
        stats.verified++;
    }

    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
    updateStatsDisplay(stats);
}

function showResult(result) {
    // Show result section
    elements.resultSection.classList.add('active');

    // Update badge
    elements.resultBadge.textContent = result.label;
    elements.resultBadge.className = 'result-badge';
    if (result.prediction === 'FAKE') {
        elements.resultBadge.classList.add('fake');
    } else if (result.prediction === 'REAL') {
        elements.resultBadge.classList.add('real');
    } else {
        elements.resultBadge.classList.add('uncertain');
    }

    // Animate trust meter
    const score = result.trust_score;
    setTimeout(() => {
        elements.meterNeedle.style.left = `${score}%`;
        elements.trustScore.textContent = score;
    }, 100);

    // Update details
    elements.verdictText.textContent = result.prediction;
    elements.confidenceText.textContent = `${result.confidence}%`;
    elements.analysisText.textContent = result.details;

    // Scroll to result
    elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetForm() {
    elements.newsInput.value = '';
    elements.resultSection.classList.remove('active');
    uploadedImage = null;
    elements.imagePreview.classList.remove('active');
    elements.imageInput.value = '';

    // Reset meter
    elements.meterNeedle.style.left = '0%';
    elements.trustScore.textContent = '0';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function shareResult() {
    const text = `AI LENSER Analysis:\n${elements.verdictText.textContent} - Trust Score: ${elements.trustScore.textContent}%\n${elements.analysisText.textContent}`;

    if (navigator.share) {
        navigator.share({
            title: 'AI LENSER - Fact Check Result',
            text: text,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Result copied to clipboard!');
        });
    }
}

// Load Stats - Check both API and local storage
async function loadStats() {
    let stats = { verified: 0, fake: 0 };

    // Try API first
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const data = await response.json();

        if (data.success) {
            stats = data.stats;
        }
    } catch (error) {
        console.log('API not available, using local stats');
    }

    // If no API stats, use local storage
    if (stats.verified === 0 && stats.fake === 0) {
        stats = JSON.parse(localStorage.getItem(STORAGE_KEYS.stats) || '{"verified": 0, "fake": 0}');
    }

    updateStatsDisplay(stats);
}

function updateStatsDisplay(stats) {
    if (stats) {
        animateNumber(elements.verifiedCount, stats.verified || 0);
        animateNumber(elements.fakeCount, stats.fake || 0);
    }
}

function animateNumber(element, target) {
    const start = parseInt(element.textContent) || 0;
    const duration = 500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const current = Math.round(start + (target - start) * easeOutQuart(progress));
        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Utility Functions
function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
    }
    .shake {
        animation: shake 0.3s ease-in-out;
        border-color: #ef4444 !important;
    }
`;
document.head.appendChild(style);
