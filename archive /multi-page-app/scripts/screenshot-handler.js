const DB_NAME = 'EmulatorSaves';
const STORE_NAME = 'screenshots';

/**
 * Opens and initializes the IndexedDB.
 * This will create the 'screenshots' store if it doesn't exist.
 */
function openScreenshotDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        // This event runs if the database needs to be created or upgraded
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME); // Simple key-value store
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(`IndexedDB error: ${event.target.errorCode}`);
        };
    });
}

/**
 * Saves a screenshot Blob to IndexedDB with a specific key.
 * @param {string} key - The unique ID for this screenshot (e.g., "save_slot_1").
 * @param {Blob} blob - The screenshot Blob data to save.
 */
async function saveScreenshot(key, blob) {
    const db = await openScreenshotDB();
    return new Promise((resolve, reject) => {
        // Start a "readwrite" transaction
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Put the blob into the store with the given key
        const request = store.put(blob, key);

        request.onsuccess = () => {
            resolve(request.result); // Returns the key
        };

        request.onerror = (event) => {
            reject(`Error saving screenshot: ${event.target.error}`);
        };
    });
}

/**
 * Loads a screenshot Blob from IndexedDB by its key.
 * @param {string} key - The unique ID of the screenshot to retrieve.
 */
async function loadScreenshot(key) {
    const db = await openScreenshotDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        // Get the data by its key
        const request = store.get(key);

        request.onsuccess = (event) => {
            if (event.target.result) {
                resolve(event.target.result); // Returns the Blob
            } else {
                // It's better to resolve with 'undefined' than to reject,
                // so the caller can handle "no screenshot" gracefully.
                resolve(undefined);
            }
        };

        request.onerror = (event) => {
            reject(`Error loading screenshot: ${event.target.error}`);
        };
    });
}
