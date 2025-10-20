/**
 * Debug script to help identify event listener conflicts
 * This script can be temporarily included to debug event listener issues
 */

function debugEventListeners() {
    console.log('=== Event Listener Debug ===');
    
    // Check for start button
    const startButton = document.querySelector('.ejs_start_button');
    if (startButton) {
        console.log('Start button found:', startButton);
        console.log('Start button event listeners:', getEventListeners ? getEventListeners(startButton) : 'getEventListeners not available');
        
        // Test click event
        console.log('Testing start button click...');
        startButton.click();
    } else {
        console.log('Start button not found');
    }
    
    // Check for new button
    const newButton = document.querySelector('.ejs_new_button');
    if (newButton) {
        console.log('New button found:', newButton);
        console.log('New button event listeners:', getEventListeners ? getEventListeners(newButton) : 'getEventListeners not available');
    } else {
        console.log('New button not found');
    }
    
    // Check for version selector
    if (window.EJS_VersionSelector) {
        console.log('Version selector available:', window.EJS_VersionSelector);
        console.log('Version selector visible:', window.EJS_VersionSelector.isVisible);
    } else {
        console.log('Version selector not available');
    }
    
    console.log('=== End Debug ===');
}

// Add to global scope for easy testing
window.debugEventListeners = debugEventListeners;

// Auto-run after a delay to let everything load
setTimeout(() => {
    console.log('Running event listener debug...');
    debugEventListeners();
}, 2000);