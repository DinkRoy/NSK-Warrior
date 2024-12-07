if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
    if (navigator.serviceWorker.controller) {
      console.log('Service worker installed');
    }
    navigator.serviceWorker.oncontrollerchange = (e) => {
      console.log('New service worker activated');
    };
  });
};

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'hidden') {
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
    await window.EJS_emulator.storage.states.put(window.EJS_emulator.getBaseFileName() + ".state", state);
    console.log('Game state saved to browser');
  }
};

window.addEventListener('popstate', async () => {
    console.log('Saving state before navigating back');
    await saveState();
    window.history.back();
});

// Adjust position of virtual gamepad 
document.addEventListener('DOMContentLoaded', (event) => {
  function applyCustomStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
            .ejs_virtualGamepad_left {
                position: absolute;
                bottom: 50px;
                width: 125px;
                height: 125px;
                left: 7%; /* Adjusted left position */
            }
            .ejs_virtualGamepad_right {
                position: absolute;
                bottom: 50px;
                width: 130px;
                height: 130px;
                right: 7%; /* Adjusted right position */
            }
        `;
    document.head.appendChild(style);
  }

  function applyStyles() {
    const virtualGamepadLeft = document.querySelector('.ejs_virtualGamepad_left');
    const virtualGamepadRight = document.querySelector('.ejs_virtualGamepad_right');

    if (virtualGamepadLeft && virtualGamepadRight) {
      applyCustomStyles();
    }
  }

  const observer = new MutationObserver((mutationsList, observer) => {
    if (document.querySelector('.ejs_virtualGamepad_left') && document.querySelector('.ejs_virtualGamepad_right')) {
      applyStyles();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  applyStyles();
});
