// Load and display steps
async function loadSteps() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('steps-container');
    const clearBtn = document.getElementById('clear-btn');

    loading.style.display = 'block';
    container.innerHTML = '';

    chrome.storage.local.get(['steps', 'stepCount'], (result) => {
        loading.style.display = 'none';

        const steps = result.steps || [];

        // Calculate storage size
        const storageSize = JSON.stringify(steps).length;
        const storageMB = (storageSize / (1024 * 1024)).toFixed(2);
        const storageElement = document.getElementById('storage-used');
        if (storageElement) {
            storageElement.textContent = storageMB;
        }

        if (steps.length === 0) {
            container.innerHTML = `
        <div class="no-steps">
          <div class="no-steps-icon">📸</div>
          <h2>No steps captured yet</h2>
          <p>Click "Start Recording" in the extension popup and click around any webpage to capture steps!</p>
        </div>
      `;
            clearBtn.style.display = 'none';
            return;
        }

        clearBtn.style.display = 'block';

        // Display all steps
        container.innerHTML = steps.map(step => {
            const time = new Date(step.timestamp).toLocaleString();

            // Truncate URL if too long
            const displayUrl = step.url.length > 80
                ? step.url.substring(0, 77) + '...'
                : step.url;

            return `
        <div class="step">
          <div class="step-header">
            <span class="step-number">Step ${step.stepNumber}</span>
            <span class="step-time">${time}</span>
          </div>
          
          <div class="step-description">${step.description}</div>
          
          <div class="step-meta">
            <div><strong>Page:</strong> ${step.pageTitle || 'Unknown'}</div>
            <div style="word-break: break-all;"><strong>URL:</strong> <a href="${step.url}" target="_blank" title="${step.url}" style="color: #1976d2; text-decoration: none;">${displayUrl}</a></div>
            <div><strong>Element:</strong> ${step.clickData.tagName} - "${step.clickData.elementText}"</div>
          </div>
          
          <img src="${step.screenshot}" alt="Step ${step.stepNumber} screenshot" 
               onclick="window.open('${step.screenshot}', '_blank')">
        </div>
      `;
        }).join('');

        console.log(`✅ Loaded ${steps.length} steps (${storageMB} MB)`);
    });
}

// Refresh button
document.getElementById('refresh-btn').addEventListener('click', () => {
    console.log('🔄 Refreshing...');
    loadSteps();
});

// Clear all steps
document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all captured steps? This cannot be undone.')) {
        chrome.storage.local.set({ steps: [], stepCount: 0 }, () => {
            console.log('🗑️ All steps cleared');
            loadSteps();
        });
    }
});

// Load steps on page load
loadSteps();

console.log('✅ Viewer loaded');
