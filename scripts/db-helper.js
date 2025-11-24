// Runs ahead of EmulatorJS to make sure database is ready
(function() {
  const TARGET_DB = 'EmulatorJS-states';
  const REQUIRED_STORE = 'states';

  const req = window.indexedDB.open(TARGET_DB);

  req.onsuccess = function(e) {
    const db = e.target.result;
    
    if (!db.objectStoreNames.contains(REQUIRED_STORE)) {
      console.error(`[Fix] Corrupted DB found: '${TARGET_DB}' exists but is missing '${REQUIRED_STORE}'.`);
      db.close();

      const deleteReq = window.indexedDB.deleteDatabase(TARGET_DB);
      deleteReq.onsuccess = () => {
        console.log(`[Fix] '${TARGET_DB}' deleted successfully. Reloading page to re-initialize...`);
        // Force reload so the emulator runs its "first-time setup" logic
        window.location.reload();
      };
    } else {
      console.log(`[Fix] Database '${TARGET_DB}' is healthy.`);
      db.close();
    }
  };
  
  req.onerror = function(e) {
    // If we can't open it, it might not exist yet, which is fine (Emulator will create it)
    console.log("[Fix] No existing DB found to check.");
  };
})();
