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
}

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
}

window.addEventListener('popstate', async () => {
    console.log('Saving state before navigating back');
    await saveState();
    window.history.back();
})
