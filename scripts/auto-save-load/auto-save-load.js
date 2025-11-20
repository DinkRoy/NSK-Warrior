function goFullScreen() {
  const el = document.body;
  const isFullscreenEnabled =
    document.fullscreenEnabled ||
    document.webkitFullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullscreenEnabled;
  
  if (!isFullscreenEnabled) {
    console.warn('Fullscreen is not supported by this browser or environment.');
    return;
  }
  
  const requestFS =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  
  if (requestFS) {
    requestFS.call(el)
      .then(() => {})
      .catch((error) => {
        console.error('Failed to enter fullscreen mode:', error);
      });
  }
};

/**
 * Manually deletes a key from the EJS IndexedDB,
 * bypassing the broken .delete() function.
 */
function manualStateDelete(key) {
  const dbName = "EJS_states"; // Hardcoded from EJS source
  const storeName = "states"; // Hardcoded from EJS source
  
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      return reject(new Error('IndexedDB not supported.'));
    }
    
    const openRequest = indexedDB.open(dbName, 1);
    
    openRequest.onerror = (e) => reject(new Error('IndexedDB open error: ' + e.target.error));
    
    openRequest.onsuccess = (e) => {
      let db;
      try {
        db = e.target.result;
        
        // Prevent errors if the store doesn't exist
        if (!db.objectStoreNames.contains(storeName)) {
          db.close();
          return reject(new Error(`Object store "${storeName}" not found.`));
        }
        
        const transaction = db.transaction([storeName], "readwrite");
        const objectStore = transaction.objectStore(storeName);
        const deleteRequest = objectStore.delete(key);
        
        deleteRequest.onsuccess = () => {
          console.log(`Manually deleted key: ${key}`);
          resolve();
        };
        
        deleteRequest.onerror = (e) => reject(new Error('Delete request error: ' + e.target.error));
        
        transaction.oncomplete = () => db.close();
        transaction.onerror = (e) => reject(new Error('Transaction error: ' + e.target.error));
        
      } catch (err) {
        if (db) db.close();
        reject(err);
      }
    };
    
    // This handles the case where the DB hasn't been created,
    // though it's unlikely to be hit in this flow.
    openRequest.onupgradeneeded = (e) => {
      let db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      };
    };
  });
}

//New Game button for restart
const createNewButton = () => {
  const newButton = window.EJS_emulator.createElement("div");
  newButton.classList.add("ejs_new_button");
  newButton.innerText = "New Game";
  window.EJS_emulator.elements.parent.appendChild(newButton);
  window.EJS_emulator.addEventListener(newButton, "touchstart", () => {
    window.EJS_emulator.touch = true;
  });
  window.EJS_emulator.addEventListener(newButton, "click", async (e) => {
    e.stopPropagation();
    let result = confirm("Are you sure? This deletes your save.");
    if (result) {
      let saveName = "ERROR.state"; // Default in case of failure
      try {
        if (!window.EJS_gameName) throw new Error("EJS_gameName is not defined.");
        saveName = EJS_gameName + ".state";
        
        // Call the localforage 'removeItem' directly instead of the EJS 'delete' wrapper
        await manualStateDelete(saveName);
        
        console.log(saveName, ' deleted.');
        
        window.history.pushState({ gameStart: true }, '', '#game');
        window.EJS_startNewGame = true;
        window.EJS_emulator.startButtonClicked.bind(window.EJS_emulator)(e);
        document.querySelector('.ejs_start_button').remove();
        newButton.remove();
        goFullScreen();
        
      } catch (err) {
        console.error('Failed to delete ', saveName, err);
        alert("Error: Could not delete save file. Please clear site data manually if the problem persists.");
      }
    } else {
      e.preventDefault();
    }
  });
};

//Start Game or Continue button
EJS_ready = async function() {
  const startButton = document.querySelector('.ejs_start_button');
  if (!startButton) return;
  
  let saveName = "ERROR.state";
  try {
    if (!window.EJS_gameName) throw new Error("EJS_gameName is not defined.");
    saveName = EJS_gameName + ".state";
    
    const state = await window.EJS_emulator.storage.states.get(saveName);
    
    if (state) {
      console.log(saveName, 'game save found');
      startButton.innerText = "Continue";
      startButton.style.right = "50%";
      startButton.style.transform = "translateX(6%)";
      startButton.style.paddingLeft = "30px";
      startButton.style.paddingRight = "30px";
      createNewButton();
      startButton.addEventListener("click", (e) => {
        e.stopPropagation();
        window.history.pushState({ gameStart: true }, '', '#game');
        startButton.remove();
        document.querySelector('.ejs_new_button')?.remove();
        goFullScreen();
      });
    } else {
      console.log(saveName, 'no game save found');
      document.querySelector('.ejs_start_button').innerText = "Start Game";
      window.EJS_emulator.addEventListener(startButton, "touchstart", (e) => {
        e.stopPropagation();
        window.EJS_emulator.touch = true;
      });
      window.EJS_emulator.addEventListener(startButton, "click", (e) => {
        window.history.pushState({ gameStart: true }, '', '#game');
        goFullScreen();
      });
    }
  } catch (err) {
    console.error("Error checking for save state:", err);
    // Fallback to "Start Game" if check fails
    document.querySelector('.ejs_start_button').innerText = "Start Game";
  }
};

function displayIcon(icon) {
  const emulator = window.EJS_emulator;

  if (!emulator.iconElem) {
    emulator.iconElem = emulator.createElement("div");
    emulator.iconElem.classList.add("icon");
    
    const s = emulator.iconElem.style;
    s.position = "absolute";
    s.top = "12em";
    s.left = "50%";
    s.transform = "translate(-50%, -50%)"; // Centers the div perfectly
    s.zIndex = "1000";                     // Ensures it sits on top
    s.width = "100px";                     // Set a reasonable size for the icon
    s.height = "100px";
    s.color = "white";                     // Sets the SVG fill color (if using currentColor)
    s.opacity = "0";                       // Start hidden
    s.transition = "opacity 0.5s ease";    // The fade animation magic
    s.pointerEvents = "none";              // Allows clicking 'through' the icon to the game
    s.display = "flex";                    // Helps center the SVG inside the div
    s.justifyContent = "center";
    s.alignItems = "center";
    
    emulator.elements.parent.appendChild(emulator.iconElem);
  }
  
  clearTimeout(emulator.iconTimeout);
  clearTimeout(emulator.iconCleanupTimeout);
  emulator.iconElem.innerHTML = icon;
  
  requestAnimationFrame(() => {
      emulator.iconElem.style.opacity = "1";
  });

  emulator.iconTimeout = setTimeout(() => {
    emulator.iconElem.style.opacity = "0";
    emulator.iconCleanupTimeout = setTimeout(() => {
        emulator.iconElem.innerHTML = "";
    }, 500); 
  }, 1500);
}

async function saveState() {
  if (!window.EJS_emulator || !window.EJS_emulator.gameManager) {
    console.log("Emulator not ready, cannot save state.");
    return;
  }
  try {
    const state = await window.EJS_emulator.gameManager.getState();
    const called = window.EJS_emulator.callEvent("saveState", { state: state });
    if (called > 0) return;
    if (window.EJS_emulator.saveInBrowserSupported()) {
      // --- FIX: Use global EJS_gameName for consistency ---
      if (!window.EJS_gameName) throw new Error("EJS_gameName is not defined.");
      const saveName = EJS_gameName + ".state";
      
      await window.EJS_emulator.storage.states.put(saveName, state);
      console.log('Game state saved to browser');
      
      const saveSVG = `
        <svg viewBox="0 0 448 512"><path fill="currentColor" d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"/></svg>
      `;
      displayIcon(saveSVG);
    }
    
  } catch (err) {
    console.error("Error saving state:", err);
  }
  
  const screenshotData = window.EJS_emulator.gameManager.screenshot();
  const blob = new Blob([screenshotData], { type: 'image/png' });
  const date = new Date();
  const timeString = (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  try {
    const currentSaveKey = EJS_gameName;
    const record = {
      image: blob,
      created: timeString
    };
    
    await saveScreenshot(currentSaveKey, record);
    console.log(`Screenshot saved with timestamp: ${timeString}`);
    
  } catch (error) {
    console.error("Failed to save screenshot:", error);
  }
}

// Load save state automatically to continue game
EJS_onGameStart = async function(emulator) {
  try {
    // --- FIX: Use global EJS_gameName for consistency ---
    if (!window.EJS_gameName) throw new Error("EJS_gameName is not defined.");
    const saveName = EJS_gameName + ".state";
    
    if (window.EJS_startNewGame) {
      delete window.EJS_startNewGame;
      return;
    }
    const state = await window.EJS_emulator.storage.states.get(saveName);
    if (state) {
      console.log(saveName, "Save state found, attempting to restore...");
      // Wait for the emulator to initialize before loading state
      await new Promise(res => setTimeout(res, 500));
      window.EJS_emulator.gameManager.loadState(state);
      console.log("Save state restored successfully!");
    } else {
      console.log("No saved state found, starting a new game.");
    }
  } catch (err) {
    console.error("Error checking or restoring save state:", err);
    alert("Could not restore your save due to an error. Starting a new game.");
  }
  
  //Try to save state automatically on exiting app
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') {
      console.log('visibility change detected');
      await saveState();
    }
  });
  
  window.onbeforeunload = (e) => {
    e.preventDefault();
    e.returnValue = '';
  };
};

EJS_onSaveState = async function() {
  saveState();
  
};