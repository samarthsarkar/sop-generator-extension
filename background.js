// Background script for SOP Generator
console.log('🚀 WikiGen script loaded');
function compressImage(dataUrl, quality = 0.8) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Convert to compressed JPEG
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
        };
        img.src = dataUrl;
    });
}
// Listen for messages from popup and content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === 'startRecording') {
        console.log('📹 Recording started');
        chrome.storage.local.set({
            isRecording: true,
            steps: [],
            stepCount: 0
        });
        sendResponse({ success: true });

    } else if (message.action === 'stopRecording') {
        console.log('⏹️ Recording stopped');
        chrome.storage.local.set({ isRecording: false });
        sendResponse({ success: true });

    } else if (message.action === 'captureScreenshot') {
        // Capture screenshot when user clicks something
        captureAndSaveScreenshot(message.clickData, sender.tab);
        sendResponse({ success: true });
    }

    return true; // Keep message channel open for async
});

// Main function to capture and save screenshot
async function captureAndSaveScreenshot(clickData, tab) {
    try {
        console.log('📸 Capturing screenshot...');

        // Capture screenshot
        const screenshotDataUrl = await chrome.tabs.captureVisibleTab(
            tab.windowId,
            { format: 'jpeg', quality: 80 } // CHANGED: Use JPEG instead of PNG
        );

        // Get current steps
        const result = await chrome.storage.local.get(['steps', 'stepCount', 'isRecording']);

        if (!result.isRecording) {
            console.log('⚠️ Not recording, skipping');
            return;
        }

        const steps = result.steps || [];
        const stepCount = (result.stepCount || 0) + 1;

        // Create step
        const newStep = {
            id: Date.now(),
            stepNumber: stepCount,
            screenshot: screenshotDataUrl, // Already compressed
            timestamp: new Date().toISOString(),
            url: tab.url,
            pageTitle: tab.title,
            clickData: clickData || {},
            description: generateBasicDescription(clickData, stepCount)
        };

        steps.push(newStep);

        // Check storage size (warn if getting full)
        const storageSize = JSON.stringify(steps).length;
        const storageMB = (storageSize / (1024 * 1024)).toFixed(2);
        console.log(`💾 Storage used: ${storageMB} MB`);

        if (storageSize > 4 * 1024 * 1024) { // 4MB warning
            console.warn('⚠️ Storage getting full! Consider clearing old steps.');
        }

        // Save
        await chrome.storage.local.set({ steps, stepCount });

        console.log(`✅ Step ${stepCount} saved (${storageMB} MB total)`);

        // Notify popup
        chrome.runtime.sendMessage({
            action: 'stepCaptured',
            count: stepCount
        }).catch(() => { });

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Generate basic description (we'll improve this with AI later)
function generateBasicDescription(clickData, stepNumber) {
    if (!clickData || !clickData.elementText) {
        return `Step ${stepNumber}`;
    }

    const element = clickData.elementText;
    const tagName = clickData.tagName?.toLowerCase();

    // Generate description based on element type
    if (tagName === 'button') {
        return `Click "${element}" button`;
    } else if (tagName === 'a') {
        return `Click "${element}" link`;
    } else if (tagName === 'input') {
        return `Type in "${element}" field`;
    } else if (element) {
        return `Click "${element}"`;
    } else {
        return `Step ${stepNumber}`;
    }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('✅ SOP Generator installed successfully');
});
