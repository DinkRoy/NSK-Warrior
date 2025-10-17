if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
      console.log('ServiceWorker registration successful with scope: ', registration.scope);

      // Helper to handle an installing worker's lifecycle
      const handleInstalling = (worker) => {
        if (!worker) return;
        console.log('Service worker installing:', worker);
        worker.addEventListener('statechange', () => {
          console.log('Installing worker statechange:', worker.state);
          if (worker.state === 'installed') {
            // If there's an active controller, this is an update (not first install)
            if (navigator.serviceWorker.controller) {
              console.log('New service worker installed (update).');
              showUpdateNotification();
            } else {
              console.log('Service worker installed for the first time (no prior controller).');
            }
          }
        });
      };

      // If there's already a waiting worker, treat that as an available update
      if (registration.waiting) {
        console.log('Found waiting worker on register — treating as update.');
        showUpdateNotification();   
      }

      // If there's an installing worker already, attach listeners
      if (registration.installing) {
        handleInstalling(registration.installing);
      }

      // Always attach updatefound to catch new installs — do this BEFORE update()
      registration.addEventListener('updatefound', () => {
        console.log('updatefound fired on registration');
        handleInstalling(registration.installing);
      });

      // Check for updates (async). We add listeners before calling update() to avoid race.
      try {
        await registration.update();
        console.log('registration.update() completed.');
      } catch (err) {
        console.warn('registration.update() failed:', err);
      }

      // Optional: listen for controllerchange to detect when a new worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('controllerchange detected — a new service worker has taken control.');
        // You can reload here if you want to force using the new SW:
        // window.location.reload();
      });
    } catch (error) {
      console.log('ServiceWorker registration failed: ', error);
    }
  });
}

function showUpdateNotification() {
  console.log('showUpdateNotification called');
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div id="update-notification" style="position: fixed; top: -100px; left: 50%; transform: translateX(-50%); width: fit-content; height: fit-content; backdrop-filter: blur(10px); border-radius: 20px; background-color: rgba(255, 255, 255, 0.3); display: flex; align-items: center; text-align: center; color: white; font-size: 1em; font-family: system-ui; padding: 10px; z-index: 9999; transition: top 0.5s ease-in-out;">
      <p style="display: flex; align-items: center; gap: 10px; white-space: nowrap; margin:0;">An update is available!
        <button id="update-button" style="margin-left:8px; background: #a00000; color: white; font-size: 1em; font-weight: 600; border: none; padding: 6px 10px; border-radius: 6px;">Reload</button>
      </p>
    </div>
  `;
  document.body.appendChild(notification);
  
  // Allow the element to be attached then animate it into view
  setTimeout(() => {
    const el = document.getElementById('update-notification');
    if (el) el.style.top = '10px';
  }, 100);

  setTimeout(() => {
    document.getElementById('update-notification').style.top = '-100px';
  }, 5000);

  const updateButton = document.getElementById('update-button');
  if (updateButton) {
    updateButton.addEventListener('click', () => {
      // It is intentional to reload the page to pick up the new SW-controlled assets
      window.location.reload();
    });
  } else {
    console.warn('update-button not found when wiring click handler.');
  }
}
