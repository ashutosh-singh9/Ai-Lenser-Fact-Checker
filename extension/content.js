/**
 * AI LENSER Extension - Content Script
 */

// Listen for selection events when in select mode
let selectMode = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_SELECT_MODE') {
        selectMode = true;
        document.body.style.cursor = 'text';

        // Add visual indicator
        const indicator = document.createElement('div');
        indicator.id = 'ailenser-indicator';
        indicator.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #0891b2, #22d3ee);
                color: white;
                padding: 12px 20px;
                border-radius: 10px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 20px rgba(8, 145, 178, 0.4);
                z-index: 999999;
                animation: slideIn 0.3s ease;
            ">
                🔍 Select text to analyze with AI LENSER
            </div>
            <style>
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            </style>
        `;
        document.body.appendChild(indicator);

        setTimeout(() => {
            indicator.remove();
        }, 3000);
    }
});

// Handle text selection
document.addEventListener('mouseup', () => {
    if (!selectMode) return;

    const selectedText = window.getSelection().toString().trim();
    if (selectedText && selectedText.length > 10) {
        chrome.runtime.sendMessage({
            type: 'SELECTED_TEXT',
            text: selectedText
        });

        selectMode = false;
        document.body.style.cursor = '';
    }
});

// Add keyboard shortcut listener
document.addEventListener('keydown', (e) => {
    // Alt + L to open AI LENSER with selected text
    if (e.altKey && e.key === 'l') {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            chrome.runtime.sendMessage({
                type: 'SELECTED_TEXT',
                text: selectedText
            });
        }
    }
});
