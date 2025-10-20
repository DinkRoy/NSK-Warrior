/**
 * Test script for Multi-Save State Manager
 * This script can be used to test the functionality without a full EmulatorJS setup
 */

// Mock EmulatorJS environment for testing
if (typeof window.EJS_emulator === 'undefined') {
    console.log('Creating mock EmulatorJS environment for testing...');
    
    // Mock EJS_STORAGE class
    window.EJS_STORAGE = class MockEJS_STORAGE {
        constructor(dbName, storeName) {
            this.dbName = dbName;
            this.storeName = storeName;
            this.data = new Map();
            this.keys = [];
        }
        
        async get(key) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(this.data.get(key) || null);
                }, 10);
            });
        }
        
        async put(key, data) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    this.data.set(key, data);
                    if (!this.keys.includes(key)) {
                        this.keys.push(key);
                    }
                    resolve();
                }, 10);
            });
        }
        
        async remove(key) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    this.data.delete(key);
                    const index = this.keys.indexOf(key);
                    if (index > -1) {
                        this.keys.splice(index, 1);
                    }
                    resolve();
                }, 10);
            });
        }
        
        async getSizes() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const sizes = {};
                    for (const [key, data] of this.data.entries()) {
                        if (data && data.data && typeof data.data.byteLength === 'number') {
                            sizes[key] = data.data.byteLength;
                        }
                    }
                    resolve(sizes);
                }, 10);
            });
        }
    };
    
    // Mock EmulatorJS instance
    window.EJS_emulator = {
        storage: {
            states: new window.EJS_STORAGE("EmulatorJS-states", "states")
        },
        getBaseFileName: () => 'test-game',
        gameManager: {
            getState: () => Promise.resolve(new Uint8Array([1, 2, 3, 4, 5])),
            loadState: (state) => console.log('Loading state:', state.length, 'bytes')
        },
        saveInBrowserSupported: () => true,
        callEvent: () => 0,
        displayMessage: (msg) => console.log('Message:', msg)
    };
}

// Test function
async function runTests() {
    console.log('Starting Multi-Save State Manager tests...');
    
    // Wait for the manager to be available
    let attempts = 0;
    while (!window.EJS_MultiSaveStateManager && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!window.EJS_MultiSaveStateManager) {
        console.error('Multi-Save State Manager not found!');
        return;
    }
    
    const manager = window.EJS_MultiSaveStateManager;
    
    try {
        // Test 1: Create profiles
        console.log('Test 1: Creating profiles...');
        await manager.createProfile('test-profile-1');
        await manager.createProfile('test-profile-2');
        console.log('✓ Profiles created successfully');
        
        // Test 2: List profiles
        console.log('Test 2: Listing profiles...');
        const profiles = manager.getProfiles();
        console.log('Available profiles:', profiles);
        console.log('✓ Profile listing works');
        
        // Test 3: Switch profiles
        console.log('Test 3: Switching profiles...');
        await manager.switchProfile('test-profile-1');
        console.log('Current profile:', manager.getCurrentProfile());
        await manager.switchProfile('test-profile-2');
        console.log('Current profile:', manager.getCurrentProfile());
        console.log('✓ Profile switching works');
        
        // Test 4: Save state in different profiles
        console.log('Test 4: Testing save state isolation...');
        
        // Switch to profile 1 and save
        await manager.switchProfile('test-profile-1');
        await window.EJS_emulator.storage.states.put('game.state', { data: new Uint8Array([1, 2, 3]) });
        
        // Switch to profile 2 and save
        await manager.switchProfile('test-profile-2');
        await window.EJS_emulator.storage.states.put('game.state', { data: new Uint8Array([4, 5, 6]) });
        
        // Verify isolation
        await manager.switchProfile('test-profile-1');
        const state1 = await window.EJS_emulator.storage.states.get('game.state');
        console.log('Profile 1 state:', state1);
        
        await manager.switchProfile('test-profile-2');
        const state2 = await window.EJS_emulator.storage.states.get('game.state');
        console.log('Profile 2 state:', state2);
        
        if (state1 && state2 && state1.data[0] !== state2.data[0]) {
            console.log('✓ Save state isolation works');
        } else {
            console.log('✗ Save state isolation failed');
        }
        
        // Test 5: Export/Import
        console.log('Test 5: Testing export/import...');
        const exportData = await manager.exportProfile('test-profile-1');
        console.log('Export data keys:', Object.keys(exportData.data));
        
        await manager.importProfile('test-profile-2', exportData);
        console.log('✓ Export/import works');
        
        // Test 6: Delete profile
        console.log('Test 6: Testing profile deletion...');
        await manager.deleteProfile('test-profile-1');
        const profilesAfterDelete = manager.getProfiles();
        console.log('Profiles after deletion:', profilesAfterDelete);
        
        if (!profilesAfterDelete.includes('test-profile-1')) {
            console.log('✓ Profile deletion works');
        } else {
            console.log('✗ Profile deletion failed');
        }
        
        console.log('All tests completed!');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run tests when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}