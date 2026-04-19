let locale;

(() => {
  // Classi da istanziare per ogni tipo di pagina
  const classes = [
    [new RegExp(`^(\\/[a-z-]+)?\\/series\\/`), Series],
  ];
  
  // Mappa dei locales
  const locales = {
    ar: 'ar-SA',
    de: 'de-DE',
    es: 'es-419',
    'es-es': 'es-ES',
    fr: 'fr-FR',
    it: 'it-IT',
    'pt-br': 'pt-BR',
    'pt-pt': 'pt-PT',
    ru: 'ru-RU',
    hi: 'hi-IN',
  };
  
  let lastLocationPathName = '';
  let lastInstance = new Empty(); // Assicurati che Empty sia disponibile globalmente
  
  // Funzione che viene chiamata ad ogni cambio pagina
  const callback = () => {
    // Evita chiamate multiple per lo stesso path
    if (location.pathname === lastLocationPathName) return;
    lastLocationPathName = location.pathname;
    
    // Determina la classe da istanziare
    const clazz = classes.reduce((found, [regex, clazz]) => {
      return found || (regex.test(lastLocationPathName) ? clazz : found);
    }, undefined) || Empty;
    
    // Imposta il locale globale
    const pathSegment = location.pathname.split('/')[1];
    window.locale = locales[pathSegment] ?? 'en-US';
    
    // Aggiorna l'attributo HTML per il CSS
    if (clazz === Empty) {
      document.documentElement.removeAttribute('ic_page');
    } else {
      document.documentElement.setAttribute('ic_page', clazz.name.toLowerCase());
    }
    
    // Distruggi l'istanza precedente
    if (lastInstance && typeof lastInstance.destroy === 'function') {
      lastInstance.destroy();
    }
    
    // Crea la nuova istanza
    try {
      lastInstance = new clazz();
    } catch (error) {
      console.error('Error creating instance:', error);
      lastInstance = new Empty();
    }
  };
  
  // Metodo 1: Osserva i cambiamenti del titolo (utile per SPA)
  let title = document.title;
  const titleObserver = new MutationObserver(() => {
    if (document.title !== title) {
      title = document.title;
      callback();
    }
  });
  
  // Aspetta che head esista prima di osservare
  const waitForHead = () => {
    const head = document.querySelector('head');
    if (head) {
      titleObserver.observe(head, {
        childList: true,
        subtree: true,
        characterData: true
      });
    } else {
      setTimeout(waitForHead, 100);
    }
  };
  waitForHead();
  
  // Metodo 2: Intercetta pushState e replaceState
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    callback();
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    callback();
  };
  
  // Metodo 3: Ascolta gli eventi popstate (back/forward)
  window.addEventListener('popstate', callback);
  
  // Metodo 4: Osserva i cambi del DOM per rilevare navigazioni interne
  const domObserver = new MutationObserver((mutations) => {
    // Controlla se l'URL è cambiato senza triggerare gli eventi sopra
    if (location.pathname !== lastLocationPathName) {
      callback();
    }
  });
  
  // Inizia a osservare quando il body è disponibile
  const waitForBody = () => {
    if (document.body) {
      domObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      setTimeout(waitForBody, 100);
    }
  };
  waitForBody();
  
  // Inizializzazione iniziale
  callback();
  
  console.log('Page navigator initialized');
})();