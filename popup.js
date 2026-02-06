// Get DOM elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusBar = document.getElementById('status-bar');
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const recordingInfo = document.getElementById('recording-info');
const stepCount = document.getElementById('step-count');
const viewStepsBtn = document.getElementById('view-steps-btn');
const totalStepsText = document.getElementById('total-steps-text');

// Update total steps count
function updateTotalSteps() {
    chrome.storage.local.get(['stepCount'], (result) => {
        const count = result.stepCount || 0;
        if (totalStepsText) {
            totalStepsText.textContent = `${count} step${count !== 1 ? 's' : ''} saved`;

            // Disable/enable button based on step count
            if (viewStepsBtn) {
                if (count === 0) {
                    viewStepsBtn.style.opacity = '0.5';
                    viewStepsBtn.style.cursor = 'not-allowed';
                    viewStepsBtn.disabled = true;
                } else {
                    viewStepsBtn.style.opacity = '1';
                    viewStepsBtn.style.cursor = 'pointer';
                    viewStepsBtn.disabled = false;
                }
            }
        }
    });
}

// Check if recording is active on popup open
chrome.storage.local.get(['isRecording', 'stepCount'], (result) => {
    if (result.isRecording) {
        showRecordingUI();
        if (stepCount) {
            stepCount.textContent = result.stepCount || 0;
        }
    }
    updateTotalSteps();
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
    updateTotalSteps();
    console.log('Recording started');
});

// Stop recording
stopBtn.addEventListener('click', () => {
    chrome.storage.local.set({ isRecording: false });
    chrome.runtime.sendMessage({ action: 'stopRecording' });
    showReadyUI();
    updateTotalSteps();
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
        if (stepCount) {
            stepCount.textContent = message.count;

            // Animation
            stepCount.style.transform = 'scale(1.3)';
            stepCount.style.color = '#4CAF50';
            setTimeout(() => {
                stepCount.style.transform = 'scale(1)';
                stepCount.style.color = '#1971c2';
            }, 300);
        }

        updateTotalSteps();
    }
});

// View steps button
if (viewStepsBtn) {
    viewStepsBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('viewer.html') });
    });
}
