/**
 * Version Selector for EmulatorJS
 * 
 * This script creates a sliding UI that appears when Start Game/Continue/New Game is clicked.
 * It shows 3 game version options that the user can select from.
 */

class VersionSelector {
    constructor() {
        this.isVisible = false;
        this.currentAction = null; // 'start', 'continue', 'new'
        this.selectedVersion = null;
        this.versions = [
            {
                id: 'version1',
                name: 'Version 1',
                description: 'Original game experience',
                profileName: 'version1'
            },
            {
                id: 'version2', 
                name: 'Version 2',
                description: 'Enhanced gameplay',
                profileName: 'version2'
            },
            {
                id: 'version3',
                name: 'Version 3', 
                description: 'Alternative story path',
                profileName: 'version3'
            }
        ];
        
        this.init();
    }

    init() {
        this.createUI();
        this.setupEventListeners();
        console.log('Version Selector initialized');
    }

    createUI() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'ejs_version_selector_overlay';
        overlay.id = 'ejs-version-overlay';
        document.body.appendChild(overlay);

        // Create main selector container
        const selector = document.createElement('div');
        selector.className = 'ejs_version_selector';
        selector.id = 'ejs-version-selector';

        // Create inner container
        const container = document.createElement('div');
        container.className = 'ejs_version_selector_container';

        // Create title
        const title = document.createElement('h2');
        title.className = 'ejs_version_selector_title';
        title.textContent = 'Select Game Version';
        container.appendChild(title);

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'ejs_version_button_close';
        closeButton.innerHTML = '×';
        closeButton.title = 'Close';
        closeButton.addEventListener('click', () => this.hide());
        container.appendChild(closeButton);

        // Create version buttons
        this.versions.forEach((version, index) => {
            const button = document.createElement('button');
            button.className = 'ejs_version_button';
            button.id = `ejs-version-${version.id}`;
            
            const buttonContent = document.createElement('div');
            buttonContent.innerHTML = `
                <div>${version.name}</div>
                <div class="ejs_version_button_description">${version.description}</div>
            `;
            button.appendChild(buttonContent);
            
            button.addEventListener('click', () => this.selectVersion(version));
            container.appendChild(button);
        });

        selector.appendChild(container);
        document.body.appendChild(selector);
    }

    setupEventListeners() {
        // Close on overlay click
        const overlay = document.getElementById('ejs-version-overlay');
        overlay.addEventListener('click', () => this.hide());

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });

        // Prevent body scroll when selector is open
        this.originalOverflow = document.body.style.overflow;
    }

    show(action) {
        if (this.isVisible) return;
        
        this.currentAction = action;
        this.isVisible = true;
        
        // Update title based on action
        const title = document.querySelector('.ejs_version_selector_title');
        switch(action) {
            case 'start':
                title.textContent = 'Select Game Version';
                break;
            case 'continue':
                title.textContent = 'Continue - Select Version';
                break;
            case 'new':
                title.textContent = 'New Game - Select Version';
                break;
        }

        // Show overlay and selector
        const overlay = document.getElementById('ejs-version-overlay');
        const selector = document.getElementById('ejs-version-selector');
        
        overlay.classList.add('show');
        selector.classList.add('show');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus first button for accessibility
        setTimeout(() => {
            const firstButton = selector.querySelector('.ejs_version_button');
            if (firstButton) firstButton.focus();
        }, 100);
    }

    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.currentAction = null;
        this.selectedVersion = null;
        
        // Hide overlay and selector
        const overlay = document.getElementById('ejs-version-overlay');
        const selector = document.getElementById('ejs-version-selector');
        
        overlay.classList.remove('show');
        selector.classList.remove('show');
        
        // Restore body scroll
        document.body.style.overflow = this.originalOverflow;
    }

    selectVersion(version) {
        this.selectedVersion = version;
        console.log(`Selected version: ${version.name} (${version.profileName})`);
        console.log(`Current action: ${this.currentAction}`);
        
        // Hide the selector
        this.hide();
        
        // Trigger the appropriate action with the selected version
        this.executeAction(version);
    }

    executeAction(version) {
        // Set the profile for the multi-save state manager
        if (window.EJS_MultiSaveStateManager) {
            // Switch to the selected version's profile
            window.EJS_MultiSaveStateManager.switchProfile(version.profileName)
                .then(() => {
                    console.log(`Switched to profile: ${version.profileName}`);
                    this.proceedWithAction();
                })
                .catch((error) => {
                    console.error('Error switching profile:', error);
                    // Create the profile if it doesn't exist
                    window.EJS_MultiSaveStateManager.createProfile(version.profileName)
                        .then(() => {
                            console.log(`Created and switched to profile: ${version.profileName}`);
                            this.proceedWithAction();
                        })
                        .catch((createError) => {
                            console.error('Error creating profile:', createError);
                            this.proceedWithAction(); // Proceed anyway
                        });
                });
        } else {
            // If multi-save manager isn't available, proceed anyway
            this.proceedWithAction();
        }
    }

    proceedWithAction() {
        // Execute the original action (start, continue, or new game)
        switch(this.currentAction) {
            case 'start':
                this.startGame();
                break;
            case 'continue':
                this.continueGame();
                break;
            case 'new':
                this.newGame();
                break;
        }
    }

    startGame() {
        console.log('Starting game with version:', this.selectedVersion.name);
        // Call the original start game function
        if (window.EJS_emulator && window.EJS_emulator.startButtonClicked) {
            console.log('Calling startButtonClicked');
            window.EJS_emulator.startButtonClicked();
        }
        console.log('Calling goFullScreen');
        goFullScreen();
    }

    continueGame() {
        console.log('Continuing game with version:', this.selectedVersion.name);
        // Remove the buttons and proceed with continue
        const startButton = document.querySelector('.ejs_start_button');
        const newButton = document.querySelector('.ejs_new_button');
        
        if (startButton) startButton.remove();
        if (newButton) newButton.remove();
        
        // Call the original continue functionality
        goFullScreen();
    }

    newGame() {
        console.log('Starting new game with version:', this.selectedVersion.name);
        // Set the new game flag and proceed
        window.EJS_startNewGame = true;
        
        // Remove the buttons first
        const startButton = document.querySelector('.ejs_start_button');
        const newButton = document.querySelector('.ejs_new_button');
        
        if (startButton) startButton.remove();
        if (newButton) newButton.remove();
        
        // Call the original start functionality
        if (window.EJS_emulator && window.EJS_emulator.startButtonClicked) {
            window.EJS_emulator.startButtonClicked();
        }
        
        goFullScreen();
    }

    // Public method to get current selected version
    getSelectedVersion() {
        return this.selectedVersion;
    }

    // Public method to get all available versions
    getVersions() {
        return this.versions;
    }
}

// Initialize the version selector
let versionSelector;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        versionSelector = new VersionSelector();
    });
} else {
    versionSelector = new VersionSelector();
}

// Export for global access
window.EJS_VersionSelector = versionSelector;