/**
 * AI LENSER Extension - Background Service Worker
 */

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SELECTED_TEXT') {
        // Store selected text and open popup
        chrome.storage.local.set({ pending_text: message.text });

        // Show notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'AI LENSER',
            message: 'Text captured! Click extension to analyze.'
        });
    }

    if (message.type === 'ANALYZE_TEXT') {
        analyzeText(message.text).then(sendResponse);
        return true; // Async response
    }
});

// Analyze text via API
async function analyzeText(text) {
    try {
        const response = await fetch('http://localhost:5000/api/analyze-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// Context menu for right-click analysis
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'ailenser-analyze',
        title: 'Analyze with AI LENSER',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'ailenser-analyze' && info.selectionText) {
        chrome.storage.local.set({ pending_text: info.selectionText });
        chrome.action.openPopup();
    }
});
