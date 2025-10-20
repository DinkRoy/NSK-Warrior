//New Game button for restart
const createNewButton = () => {
  const newButton = window.EJS_emulator.createElement("div");
  newButton.classList.add("ejs_new_button");
  newButton.innerText = "New Game";
  newButton.setAttribute('data-our-listener', 'true');
  window.EJS_emulator.elements.parent.appendChild(newButton);
  
  newButton.addEventListener("touchstart", () => {
    window.EJS_emulator.touch = true;
  });
  
  newButton.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    console.log('New Game button clicked');
    
    let result = confirm("Are you sure? This deletes your save.");
    if (result) {
      // Show version selector instead of going directly to fullscreen
      if (window.EJS_VersionSelector) {
        console.log('Showing version selector for new game');
        window.EJS_VersionSelector.show('new');
      } else {
        console.log('Version selector not available, falling back to direct new game');
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
      
      // Completely replace the button to remove all event listeners
      const newStartButton = startButton.cloneNode(true);
      startButton.parentNode.replaceChild(newStartButton, startButton);
      
      // Add our custom event listeners
      newStartButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('Continue button clicked - showing version selector');
        
        // Show version selector instead of going directly to fullscreen
        if (window.EJS_VersionSelector) {
          window.EJS_VersionSelector.show('continue');
        } else {
          console.log('Version selector not available, falling back to direct continue');
          newStartButton.remove();
          document.querySelector('.ejs_new_button')?.remove();
          goFullScreen();
        }
      });
    } else {
      document.querySelector('.ejs_start_button').innerText = "Start Game";
      
      // Completely replace the button to remove all event listeners
      const newStartButton = startButton.cloneNode(true);
      startButton.parentNode.replaceChild(newStartButton, startButton);
      
      // Add our custom event listeners
      newStartButton.addEventListener("touchstart", (e) => {
        e.stopPropagation();
        window.EJS_emulator.touch = true;
      });
      
      newStartButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('Start Game button clicked - showing version selector');
        
        // Show version selector instead of going directly to fullscreen
        if (window.EJS_VersionSelector) {
          window.EJS_VersionSelector.show('start');
        } else {
          console.log('Version selector not available, falling back to direct start');
          goFullScreen();
        }
      });
    }
    
    // Set up a periodic check to re-apply our event listeners if EmulatorJS overrides them
    const checkInterval = setInterval(() => {
      const currentButton = document.querySelector('.ejs_start_button');
      if (currentButton && !currentButton.hasAttribute('data-our-listener')) {
        console.log('Detected button override, re-applying our listeners');
        currentButton.setAttribute('data-our-listener', 'true');
        
        // Remove all existing listeners by cloning
        const newButton = currentButton.cloneNode(true);
        currentButton.parentNode.replaceChild(newButton, currentButton);
        newButton.setAttribute('data-our-listener', 'true');
        
        // Re-add our listeners
        if (localStorage.getItem('gameActive') === 'true') {
          newButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('Continue button clicked (re-applied) - showing version selector');
            if (window.EJS_VersionSelector) {
              window.EJS_VersionSelector.show('continue');
            } else {
              newButton.remove();
              document.querySelector('.ejs_new_button')?.remove();
              goFullScreen();
            }
          });
        } else {
          newButton.addEventListener("touchstart", (e) => {
            e.stopPropagation();
            window.EJS_emulator.touch = true;
          });
          newButton.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('Start Game button clicked (re-applied) - showing version selector');
            if (window.EJS_VersionSelector) {
              window.EJS_VersionSelector.show('start');
            } else {
              goFullScreen();
            }
          });
        }
      }
    }, 1000);
    
    // Stop checking after 30 seconds
    setTimeout(() => clearInterval(checkInterval), 30000);
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
