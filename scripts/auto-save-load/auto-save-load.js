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
      // Show version selector instead of going directly to fullscreen
      if (window.EJS_VersionSelector) {
        window.EJS_VersionSelector.show('new');
      } else {
        window.EJS_startNewGame = true;
        window.EJS_emulator.startButtonClicked.bind(window.EJS_emulator)(e);
        document.querySelector('.ejs_start_button').remove();
        newButton.remove();
        goFullScreen();
      }
    } else {
      e.preventDefault();
    }
  });
};

const observer = new MutationObserver((mutationsList, observer) => {
  console.log('observing document for start button...');
  if (document.querySelector('.ejs_start_button')) {
    const startButton = document.querySelector('.ejs_start_button');
    observer.disconnect();
    console.log('found the button');
    
    //Start Game or Continue button
    if (localStorage.getItem('gameActive') === 'true') {
      startButton.innerText = "Continue";
      startButton.style.right = "50%";
      startButton.style.transform = "translateX(6%)";
      startButton.style.paddingLeft = "30px";
      startButton.style.paddingRight = "30px";
      createNewButton();
      startButton.addEventListener("click", (e) => {
        e.stopPropagation();
        // Show version selector instead of going directly to fullscreen
        if (window.EJS_VersionSelector) {
          window.EJS_VersionSelector.show('continue');
        } else {
          startButton.remove();
          document.querySelector('.ejs_new_button')?.remove();
          goFullScreen();
        }
      });
    } else {
      document.querySelector('.ejs_start_button').innerText = "Start Game";
      window.EJS_emulator.addEventListener(startButton, "touchstart", (e) => {
        e.stopPropagation();
        window.EJS_emulator.touch = true;
      });
      window.EJS_emulator.addEventListener(startButton, "click", (e) => {
        e.stopPropagation();
        // Show version selector instead of going directly to fullscreen
        if (window.EJS_VersionSelector) {
          window.EJS_VersionSelector.show('start');
        } else {
          goFullScreen();
        }
      });
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });

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

// Load save state automatically to continue game
EJS_onGameStart = async function(emulator) {
  if (localStorage.getItem('gameActive') === 'true') {
    try {
      const saveName = window.EJS_emulator.getBaseFileName() + ".state";
      if (window.EJS_startNewGame) {
        delete window.EJS_startNewGame;
        return;
      }
      
      // Get the current profile from the version selector or multi-save manager
      let currentProfile = 'default';
      if (window.EJS_VersionSelector && window.EJS_VersionSelector.getSelectedVersion()) {
        currentProfile = window.EJS_VersionSelector.getSelectedVersion().profileName;
      } else if (window.EJS_MultiSaveStateManager) {
        currentProfile = window.EJS_MultiSaveStateManager.getCurrentProfile();
      }
      
      console.log(`Loading save state for profile: ${currentProfile}`);
      
      const state = await window.EJS_emulator.storage.states.get(saveName);
      if (state) {
        console.log("Save state found, attempting to restore...");
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
  } else {
    localStorage.setItem('gameActive', 'true');
  }
};

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

async function saveState() {
  const state = await window.EJS_emulator.gameManager.getState();
  const called = window.EJS_emulator.callEvent("saveState", { state: state });
  if (called > 0) return;
  if (window.EJS_emulator.saveInBrowserSupported()) {
    // Get the current profile for saving
    let currentProfile = 'default';
    if (window.EJS_VersionSelector && window.EJS_VersionSelector.getSelectedVersion()) {
      currentProfile = window.EJS_VersionSelector.getSelectedVersion().profileName;
    } else if (window.EJS_MultiSaveStateManager) {
      currentProfile = window.EJS_MultiSaveStateManager.getCurrentProfile();
    }
    
    console.log(`Saving game state to profile: ${currentProfile}`);
    await window.EJS_emulator.storage.states.put(window.EJS_emulator.getBaseFileName() + ".state", state);
    console.log('Game state saved to browser');
  }
};

window.addEventListener('popstate', async () => {
  console.log('back navigation detected');
  await saveState();
  window.history.back();
});
