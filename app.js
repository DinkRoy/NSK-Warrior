if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        registration.update();
        registration.addEventListener('updatefound', () => {
          showUpdateNotification();
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
    <div id="update-notification" style="position: fixed; top: -50px; left: 50%; transform: translateX(-50%); width: fit-content; height: fit-content; backdrop-filter: blur(10px); border-radius: 20px; background-color: rgba(255, 255, 255, 0.3); display: flex; align-items: center; text-align: center; color: white; font-size: 1em; font-family: system-ui; padding: 10px; z-index: 1000; transition: top 0.5s ease-in-out;">
      <p style="display: flex; align-items: center; gap: 10px; white-space: nowrap; ">An update is available!<button id="update-button" style="background: #a00000; color: white; font-size: 1em; font-weight: 600; padding: 10px 15px; border: none; border-radius: 10px;">Update</button></p>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    document.getElementById('update-notification').style.top = '10px';
  }, 100); // Delay to trigger the CSS transition
  
  const updateButton = document.getElementById('update-button');
  updateButton.addEventListener('click', () => {
    window.location.reload();
  });
}
