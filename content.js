// Content script for detecting user clicks
console.log('👁️ SOP Generator content script loaded on:', window.location.href);

let isRecording = false;

// Check if recording is active
chrome.storage.local.get(['isRecording'], (result) => {
    isRecording = result.isRecording || false;
    if (isRecording) {
        console.log('🔴 Recording active on this page');
    }
});

// Listen for recording state changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.isRecording) {
        isRecording = changes.isRecording.newValue;
        if (isRecording) {
            console.log('🔴 Recording started');
        } else {
            console.log('⚪ Recording stopped');
        }
    }
});

// Add click listener to document
document.addEventListener('click', handleClick, true);

function handleClick(event) {
    // Only capture if recording is active
    if (!isRecording) {
        return;
    }

    console.log('🖱️ Click detected!');

    const clickedElement = event.target;

    // Get element information
    const clickData = {
        elementText: getElementText(clickedElement),
        tagName: clickedElement.tagName,
        id: clickedElement.id || '',
        className: clickedElement.className || '',
        xpath: getXPath(clickedElement),
        coordinates: {
            x: event.clientX,
            y: event.clientY
        },
        timestamp: new Date().toISOString()
    };

    console.log('📝 Click data:', clickData);

    // Send message to background script with error handling
    try {
        chrome.runtime.sendMessage({
            action: 'captureScreenshot',
            clickData: clickData
        }, function (response) {
            if (chrome.runtime.lastError) {
                console.error('❌ Message error:', chrome.runtime.lastError.message);
            } else {
                console.log('✅ Screenshot request sent', response);
            }
        });
    } catch (error) {
        console.error('❌ Exception sending message:', error);
    }
}

// Helper function to get element text
function getElementText(element) {
    let text = '';

    text = element.textContent?.trim();

    if (!text && element.value) {
        text = element.value;
    }

    if (!text && element.placeholder) {
        text = element.placeholder;
    }

    if (!text && element.alt) {
        text = element.alt;
    }

    if (!text && element.title) {
        text = element.title;
    }

    if (!text && element.getAttribute('aria-label')) {
        text = element.getAttribute('aria-label');
    }

    if (text && text.length > 50) {
        text = text.substring(0, 47) + '...';
    }

    return text || 'Element';
}

// Helper function to get XPath of element
function getXPath(element) {
    if (element.id) {
        return `//*[@id="${element.id}"]`;
    }

    if (element === document.body) {
        return '/html/body';
    }

    let ix = 0;
    const siblings = element.parentNode?.childNodes || [];

    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === element) {
            const parentPath = element.parentNode ? getXPath(element.parentNode) : '';
            return `${parentPath}/${element.tagName.toLowerCase()}[${ix + 1}]`;
        }
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
            ix++;
        }
    }

    return '';
}

console.log('✅ Click listener registered');
