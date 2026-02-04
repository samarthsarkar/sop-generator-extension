// Get DOM elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusText = document.getElementById('status-text');
const stepCountDiv = document.getElementById('step-count');
const countSpan = document.getElementById('count');

// Check if recording is active
chrome.storage.local.get(['isRecording', 'stepCount'], (result) => {
    if (result.isRecording) {
        showRecordingUI();
        countSpan.textContent = result.stepCount || 0;
    }
});

// Start recording
startBtn.addEventListener('click', async () => {
    chrome.storage.local.set({
        isRecording: true,
        stepCount: 0,
        steps: []
    });

    // Send message to background script
    chrome.runtime.sendMessage({ action: 'startRecording' });

    showRecordingUI();
    console.log('Recording started');
});

// Stop recording
stopBtn.addEventListener('click', () => {
    chrome.storage.local.set({ isRecording: false });
    chrome.runtime.sendMessage({ action: 'stopRecording' });

    showReadyUI();
    console.log('Recording stopped');
});

function showRecordingUI() {
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    stepCountDiv.style.display = 'block';
    statusText.textContent = '🔴 Recording...';
}

function showReadyUI() {
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    stepCountDiv.style.display = 'none';
    statusText.textContent = 'Ready to record';
}

// Listen for step updates
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'stepCaptured') {
        countSpan.textContent = message.count;
    }
});
