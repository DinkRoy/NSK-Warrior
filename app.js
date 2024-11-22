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

window.addEventListener('popstate', async () => {
    console.log('Saving state before navigating back');
    await saveState();
    window.history.back();
})
