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
      
      // Check for updates before calling update() to avoid race.
      try {
        await registration.update();
        console.log('registration.update() completed.');
      } catch (err) {
        console.warn('registration.update() failed:', err);
      }
      
      // Optional: listen for controllerchange to detect when a new worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('controllerchange detected — a new service worker has taken control.');
        // reload here to force using the new SW:
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
    <div id="update-notification" style="position: fixed; top: -150px; left: 50%; transform: translateX(-50%); transition: top 0.5s ease-in-out;">
      <p id="modal-message">An update is available!</p>
      <div id="modal-buttons">
        <button id="update-button" style="background: #a00000;">Reload</button>
      </div>
    </div>
  `;
  document.body.appendChild(notification);
  
  // Allow the element to be attached then animate it into view
  setTimeout(() => {
    const el = document.getElementById('update-notification');
    if (el) el.style.top = '20px';
  }, 100);
  
  setTimeout(() => {
    document.getElementById('update-notification').style.top = '-150px';
  }, 5000);
  
  const updateButton = document.getElementById('update-button');
  if (updateButton) {
    updateButton.addEventListener('click', () => {
      window.location.reload();
    });
  } else {
    console.warn('update-button not found when wiring click handler.');
  }
}