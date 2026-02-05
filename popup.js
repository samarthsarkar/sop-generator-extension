// Get DOM elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusBar = document.getElementById('status-bar');
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const recordingInfo = document.getElementById('recording-info');
const stepCount = document.getElementById('step-count');

// Check if recording is active
chrome.storage.local.get(['isRecording', 'stepCount'], (result) => {
    if (result.isRecording) {
        showRecordingUI();
        stepCount.textContent = result.stepCount || 0;
    }
});

// Start recording
startBtn.addEventListener('click', () => {
    chrome.storage.local.set({
        isRecording: true,
        stepCount: 0,
        steps: []
    });

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
    recordingInfo.style.display = 'block';
    statusBar.classList.add('recording');
    statusIcon.textContent = '🔴';
    statusText.textContent = 'Recording...';
}

function showReadyUI() {
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    recordingInfo.style.display = 'none';
    statusBar.classList.remove('recording');
    statusIcon.textContent = '⚪';
    statusText.textContent = 'Ready to record';
}

// Listen for step updates
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'stepCaptured') {
        stepCount.textContent = message.count;
    }
});
