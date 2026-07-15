// series/home.js
// CrOptix: sposta la sezione "Continua a guardare" in cima al feed della home.

class Home extends Empty {
  // data-id fornito come fallback (selettore principale: la history collection)
  static TARGET_DATA_ID = '01K5ZEN3ZCEKAB8VC3J8XN20YG';

  constructor() {
    super();
    this._scheduled = false;
    this.scheduleMove = this.scheduleMove.bind(this);

    this.observer = new MutationObserver(this.scheduleMove);

    const start = () => {
      if (!document.body) {
        setTimeout(start, 100);
        return;
      }
      this.observer.observe(document.body, { childList: true, subtree: true });
      this.scheduleMove();
    };
    start();

    this.onDestroy(() => {
      this.observer.disconnect();
    });
  }

  scheduleMove() {
    if (this._scheduled) return;
    this._scheduled = true;
    requestAnimationFrame(() => {
      this._scheduled = false;
      this.moveContinueWatching();
    });
  }

  // Trova il figlio diretto di .dynamic-feed-wrapper che rappresenta la sezione
  findSection(wrapper) {
    // Selettore robusto: la sezione "Continua a guardare" contiene la history collection
    const marker =
      wrapper.querySelector('[data-t="history"]') ||
      wrapper.querySelector('[data-t="view-history-btn"]');
    const section = marker ? this.toDirectChild(wrapper, marker) : null;
    if (section) return section;

    // Fallback: data-id esplicito
    const byId = wrapper.querySelector(`[data-id="${Home.TARGET_DATA_ID}"]`);
    return byId ? this.toDirectChild(wrapper, byId) : null;
  }

  toDirectChild(parent, el) {
    let node = el;
    while (node && node.parentElement !== parent) {
      node = node.parentElement;
    }
    return node && node.parentElement === parent ? node : null;
  }

  moveContinueWatching() {
    const wrapper = document.querySelector('.dynamic-feed-wrapper');
    if (!wrapper) return;
    const section = this.findSection(wrapper);
    if (!section) return;
    if (wrapper.firstElementChild === section) return; // gia in cima
    wrapper.insertBefore(section, wrapper.firstElementChild);
  }
}
