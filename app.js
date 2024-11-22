window.addEventListener('popstate', async () => {
    console.log('Saving state before navigating back');
    await saveState();
    window.history.back();
});
