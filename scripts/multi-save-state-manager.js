/**
 * Multi-Save State Manager for EmulatorJS
 * 
 * This script extends EmulatorJS to support multiple save state stores,
 * allowing users to create, switch between, and manage different save state profiles.
 * 
 * Features:
 * - Create multiple save state stores (profiles)
 * - Switch between different save state profiles
 * - Save/load states to/from specific profiles
 * - List all available profiles
 * - Delete profiles
 * - Export/import save state data
 */

class MultiSaveStateManager {
    constructor() {
        this.currentProfile = 'default';
        this.profileKey = 'ejs_current_profile';
        this.profilesKey = 'ejs_available_profiles';
        this.init();
    }

    /**
     * Initialize the multi-save state manager
     */
    init() {
        // Load current profile from localStorage
        const savedProfile = localStorage.getItem(this.profileKey);
        if (savedProfile) {
            this.currentProfile = savedProfile;
        }

        // Ensure we have a profiles list with version profiles
        if (!localStorage.getItem(this.profilesKey)) {
            localStorage.setItem(this.profilesKey, JSON.stringify(['default', 'version1', 'version2', 'version3']));
        } else {
            // Add version profiles if they don't exist
            const profiles = this.getProfiles();
            const versionProfiles = ['version1', 'version2', 'version3'];
            let updated = false;
            
            versionProfiles.forEach(profile => {
                if (!profiles.includes(profile)) {
                    profiles.push(profile);
                    updated = true;
                }
            });
            
            if (updated) {
                localStorage.setItem(this.profilesKey, JSON.stringify(profiles));
            }
        }

        // Override the original storage.states with our enhanced version
        this.enhanceEmulatorStorage();
        
        // Add UI controls
        this.addUI();
        
        console.log(`Multi-Save State Manager initialized. Current profile: ${this.currentProfile}`);
    }

    /**
     * Enhance the emulator's storage.states to use profile-based storage
     */
    enhanceEmulatorStorage() {
        if (!window.EJS_emulator || !window.EJS_emulator.storage) {
            // Wait for emulator to be ready
            setTimeout(() => this.enhanceEmulatorStorage(), 100);
            return;
        }

        const originalStorage = window.EJS_emulator.storage.states;
        
        // Create enhanced storage that uses profile-based keys
        const enhancedStorage = {
            get: async (key) => {
                const profileKey = this.getProfileKey(key);
                return await originalStorage.get(profileKey);
            },
            
            put: async (key, data) => {
                const profileKey = this.getProfileKey(key);
                return await originalStorage.put(profileKey, data);
            },
            
            remove: async (key) => {
                const profileKey = this.getProfileKey(key);
                return await originalStorage.remove(profileKey);
            },
            
            getSizes: async () => {
                const allSizes = await originalStorage.getSizes();
                const profileSizes = {};
                
                for (const [key, size] of Object.entries(allSizes)) {
                    if (key.startsWith(`${this.currentProfile}:`)) {
                        const originalKey = key.substring(`${this.currentProfile}:`.length);
                        profileSizes[originalKey] = size;
                    }
                }
                
                return profileSizes;
            }
        };

        // Replace the original storage
        window.EJS_emulator.storage.states = enhancedStorage;
    }

    /**
     * Get the profile-prefixed key for storage
     */
    getProfileKey(key) {
        return `${this.currentProfile}:${key}`;
    }

    /**
     * Create a new save state profile
     */
    async createProfile(profileName) {
        if (!profileName || profileName.trim() === '') {
            throw new Error('Profile name cannot be empty');
        }

        const profiles = this.getProfiles();
        if (profiles.includes(profileName)) {
            throw new Error('Profile already exists');
        }

        profiles.push(profileName);
        localStorage.setItem(this.profilesKey, JSON.stringify(profiles));
        
        console.log(`Created new profile: ${profileName}`);
        this.updateUI();
        
        return profileName;
    }

    /**
     * Switch to a different save state profile
     */
    async switchProfile(profileName) {
        const profiles = this.getProfiles();
        if (!profiles.includes(profileName)) {
            throw new Error('Profile does not exist');
        }

        this.currentProfile = profileName;
        localStorage.setItem(this.profileKey, profileName);
        
        // Re-enhance storage with new profile
        this.enhanceEmulatorStorage();
        
        console.log(`Switched to profile: ${profileName}`);
        this.updateUI();
        
        // Trigger a custom event for other scripts to listen to
        window.dispatchEvent(new CustomEvent('ejs-profile-changed', {
            detail: { profile: profileName }
        }));
    }

    /**
     * Delete a save state profile
     */
    async deleteProfile(profileName) {
        if (profileName === 'default') {
            throw new Error('Cannot delete the default profile');
        }

        const profiles = this.getProfiles();
        if (!profiles.includes(profileName)) {
            throw new Error('Profile does not exist');
        }

        // Remove all save states for this profile
        const originalStorage = window.EJS_emulator.storage.states;
        const allKeys = await this.getAllProfileKeys(profileName);
        
        for (const key of allKeys) {
            await originalStorage.remove(key);
        }

        // Remove from profiles list
        const updatedProfiles = profiles.filter(p => p !== profileName);
        localStorage.setItem(this.profilesKey, JSON.stringify(updatedProfiles));

        // If we're currently using this profile, switch to default
        if (this.currentProfile === profileName) {
            await this.switchProfile('default');
        }

        console.log(`Deleted profile: ${profileName}`);
        this.updateUI();
    }

    /**
     * Get all keys for a specific profile
     */
    async getAllProfileKeys(profileName) {
        const originalStorage = window.EJS_emulator.storage.states;
        const allKeys = await originalStorage.get('?EJS_KEYS!') || [];
        return allKeys.filter(key => key.startsWith(`${profileName}:`));
    }

    /**
     * Get list of available profiles
     */
    getProfiles() {
        const profiles = localStorage.getItem(this.profilesKey);
        return profiles ? JSON.parse(profiles) : ['default'];
    }

    /**
     * Get current profile name
     */
    getCurrentProfile() {
        return this.currentProfile;
    }

    /**
     * Export save state data for a profile
     */
    async exportProfile(profileName) {
        const originalStorage = window.EJS_emulator.storage.states;
        const profileKeys = await this.getAllProfileKeys(profileName);
        const exportData = {};

        for (const key of profileKeys) {
            const data = await originalStorage.get(key);
            if (data) {
                const originalKey = key.substring(`${profileName}:`.length);
                exportData[originalKey] = data;
            }
        }

        return {
            profileName,
            timestamp: new Date().toISOString(),
            data: exportData
        };
    }

    /**
     * Import save state data to a profile
     */
    async importProfile(profileName, importData) {
        const originalStorage = window.EJS_emulator.storage.states;
        
        for (const [key, data] of Object.entries(importData.data)) {
            const profileKey = `${profileName}:${key}`;
            await originalStorage.put(profileKey, data);
        }

        console.log(`Imported data to profile: ${profileName}`);
    }

    /**
     * Add UI controls for profile management
     */
    addUI() {
        // Load CSS
        // this.loadCSS();

        // Create the UI container
        const uiContainer = document.createElement('div');
        uiContainer.id = 'ejs-multi-save-ui';

        // Title
        const title = document.createElement('h3');
        title.textContent = 'Save State Profiles';

        // Current profile display
        const currentProfileDiv = document.createElement('div');
        currentProfileDiv.id = 'ejs-current-profile';

        // Profile selector
        const profileSelect = document.createElement('select');
        profileSelect.id = 'ejs-profile-select';
        profileSelect.title = 'Select a save state profile';

        // New profile controls
        const newProfileDiv = document.createElement('div');
        newProfileDiv.className = 'profile-controls';
        
        const newProfileInput = document.createElement('input');
        newProfileInput.type = 'text';
        newProfileInput.placeholder = 'New profile name';
        newProfileInput.title = 'Enter a name for the new profile';

        const newProfileBtn = document.createElement('button');
        newProfileBtn.textContent = '+';
        newProfileBtn.className = 'new-profile-btn';
        newProfileBtn.title = 'Create new profile';

        // Delete profile button
        const deleteProfileBtn = document.createElement('button');
        deleteProfileBtn.textContent = 'Delete Profile';
        deleteProfileBtn.className = 'delete-profile-btn';
        deleteProfileBtn.title = 'Delete the selected profile';

        // Export/Import buttons
        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Export';
        exportBtn.className = 'export-btn';
        exportBtn.title = 'Export current profile data';
        exportBtn.style.cssText = `
            width: 48%;
            background: #2196F3;
            color: white;
            margin-right: 2%;
        `;

        const importBtn = document.createElement('button');
        importBtn.textContent = 'Import';
        importBtn.className = 'import-btn';
        importBtn.title = 'Import profile data';
        importBtn.style.cssText = `
            width: 48%;
            background: #FF9800;
            color: white;
            margin-left: 2%;
        `;

        const importFile = document.createElement('input');
        importFile.type = 'file';
        importFile.accept = '.json';
        importFile.style.display = 'none';
        importFile.title = 'Select a JSON file to import';

        // Event listeners
        profileSelect.addEventListener('change', async (e) => {
            try {
                uiContainer.classList.add('profile-switching');
                await this.switchProfile(e.target.value);
                setTimeout(() => uiContainer.classList.remove('profile-switching'), 300);
            } catch (error) {
                alert(`Error switching profile: ${error.message}`);
            }
        });

        newProfileBtn.addEventListener('click', async () => {
            const profileName = newProfileInput.value.trim();
            if (profileName) {
                try {
                    await this.createProfile(profileName);
                    newProfileInput.value = '';
                    this.updateUI();
                    this.showMessage(`Profile "${profileName}" created successfully!`);
                } catch (error) {
                    this.showMessage(`Error creating profile: ${error.message}`, 'error');
                }
            }
        });

        deleteProfileBtn.addEventListener('click', async () => {
            const selectedProfile = profileSelect.value;
            if (selectedProfile && selectedProfile !== 'default') {
                if (confirm(`Delete profile "${selectedProfile}"? This will remove all save states in this profile.`)) {
                    try {
                        await this.deleteProfile(selectedProfile);
                        this.updateUI();
                        this.showMessage(`Profile "${selectedProfile}" deleted successfully!`);
                    } catch (error) {
                        this.showMessage(`Error deleting profile: ${error.message}`, 'error');
                    }
                }
            }
        });

        exportBtn.addEventListener('click', async () => {
            try {
                const exportData = await this.exportProfile(this.currentProfile);
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ejs-profile-${this.currentProfile}-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.showMessage(`Profile "${this.currentProfile}" exported successfully!`);
            } catch (error) {
                this.showMessage(`Error exporting profile: ${error.message}`, 'error');
            }
        });

        importBtn.addEventListener('click', () => {
            importFile.click();
        });

        importFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const text = await file.text();
                    const importData = JSON.parse(text);
                    
                    // Create new profile if it doesn't exist
                    const profiles = this.getProfiles();
                    if (!profiles.includes(importData.profileName)) {
                        await this.createProfile(importData.profileName);
                    }
                    
                    await this.importProfile(importData.profileName, importData);
                    this.updateUI();
                    this.showMessage(`Profile "${importData.profileName}" imported successfully!`);
                } catch (error) {
                    this.showMessage(`Error importing profile: ${error.message}`, 'error');
                }
            }
        });

        // Assemble UI
        newProfileDiv.appendChild(newProfileInput);
        newProfileDiv.appendChild(newProfileBtn);
        
        uiContainer.appendChild(title);
        uiContainer.appendChild(currentProfileDiv);
        uiContainer.appendChild(profileSelect);
        uiContainer.appendChild(newProfileDiv);
        uiContainer.appendChild(deleteProfileBtn);
        uiContainer.appendChild(exportBtn);
        uiContainer.appendChild(importBtn);
        uiContainer.appendChild(importFile);

        // Add to page
        document.body.appendChild(uiContainer);
        
        // Initial UI update
        this.updateUI();
    }

    /**
     * Load CSS styles
     */
    loadCSS() {
        if (document.getElementById('ejs-multi-save-css')) return;

        const link = document.createElement('link');
        link.id = 'ejs-multi-save-css';
        link.rel = 'stylesheet';
        link.href = '/scripts/multi-save-state-manager.css';
        document.head.appendChild(link);
    }

    /**
     * Show a message to the user
     */
    showMessage(message, type = 'success') {
        // Remove existing message
        const existingMessage = document.getElementById('ejs-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.id = 'ejs-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'error' ? '#f44336' : '#4CAF50'};
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 10001;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(messageDiv);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    /**
     * Update the UI with current profile information
     */
    updateUI() {
        const profileSelect = document.getElementById('ejs-profile-select');
        const currentProfileDiv = document.getElementById('ejs-current-profile');
        
        if (profileSelect && currentProfileDiv) {
            // Update profile list
            profileSelect.innerHTML = '';
            const profiles = this.getProfiles();
            profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile;
                option.textContent = profile;
                if (profile === this.currentProfile) {
                    option.selected = true;
                }
                profileSelect.appendChild(option);
            });

            // Update current profile display
            currentProfileDiv.textContent = `Current: ${this.currentProfile}`;
        }
    }
}

// Initialize the multi-save state manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.EJS_MultiSaveStateManager = new MultiSaveStateManager();
});

// Also initialize if DOMContentLoaded has already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.EJS_MultiSaveStateManager = new MultiSaveStateManager();
    });
} else {
    window.EJS_MultiSaveStateManager = new MultiSaveStateManager();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiSaveStateManager;
}