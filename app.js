if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        registration.update();
        registration.addEventListener('updatefound', () => {
          if (localStorage.getItem('gameActive') === 'true') {
            showUpdateNotification();
          }
        })
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div id="update-notification" style="position: fixed; top: -50px; left: 50%; transform: translateX(-50%); width: fit-content; height: fit-content; backdrop-filter: blur(10px); border-radius: 20px; z-index: 9999; transition: top 0.5s;">
      <p style="display: flex; align-items: center; gap: 10px; white-space: nowrap;">
        An update is available!
        <button id="update-button" style="background: #a00000; color: white; font-size: 1em; font-weight: bold; border: none; border-radius: 10px; padding: 5px 15px; cursor: pointer;">
          Update
        </button>
        <button id="dismiss-button" style="background: #888; color: white; font-size: 1em; font-weight: bold; border: none; border-radius: 10px; padding: 5px 15px; cursor: pointer;">
          Dismiss
        </button>
      </p>
    </div>
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    document.getElementById('update-notification').style.top = '10px';
  }, 100);

  const updateButton = document.getElementById('update-button');
  updateButton.addEventListener('click', () => {
    window.location.reload();
  });

  const dismissButton = document.getElementById('dismiss-button');
  dismissButton.addEventListener('click', () => {
    notification.remove();
  });
}
