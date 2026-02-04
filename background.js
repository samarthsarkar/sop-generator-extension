// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startRecording') {
        console.log('Background: Recording started');
        // We'll add screenshot logic tomorrow
    } else if (message.action === 'stopRecording') {
        console.log('Background: Recording stopped');
    }
});

console.log('SOP Generator background script loaded');
