function getTranslation(key) {
  const translations = {
    'ar-SA': {
      'markAsWatched': 'وضع كمشاهدة',
      'markAsNotWatched': 'وضع كغير مشاهد',
      'markOnlyThisOne': 'هذه الحلقة فقط',
      'markAllPrevious': 'جميع الحلقات السابقة',
      'markAllNext': 'جميع الحلقات التالية'
    },
    'de-DE': {
      'markAsWatched': 'Als gesehen markieren',
      'markAsNotWatched': 'Als nicht gesehen markieren',
      'markOnlyThisOne': 'Nur diese Episode',
      'markAllPrevious': 'Alle vorherigen Episoden',
      'markAllNext': 'Alle nächsten Episoden'
    },
    'es-419': {
      'markAsWatched': 'Marcar como visto',
      'markAsNotWatched': 'Marcar como no visto',
      'markOnlyThisOne': 'Solo este episodio',
      'markAllPrevious': 'Todos los episodios anteriores',
      'markAllNext': 'Todos los episodios siguientes'
    },
    'fr-FR': {
      'markAsWatched': 'Marquer comme vu',
      'markAsNotWatched': 'Marquer comme non vu',
      'markOnlyThisOne': 'Seul cet épisode',
      'markAllPrevious': 'Tous les épisodes précédents',
      'markAllNext': 'Tous les épisodes suivants'
    },
    'it-IT': {
      'markAsWatched': 'Segna come visto',
      'markAsNotWatched': 'Segna come non visto',
      'markOnlyThisOne': 'Solo questo episodio',
      'markAllPrevious': 'Tutti gli episodi precedenti',
      'markAllNext': 'Tutti gli episodi successivi'
    },
    'pt-BR': {
      'markAsWatched': 'Marcar como assistido',
      'markAsNotWatched': 'Marcar como não assistido',
      'markOnlyThisOne': 'Apenas este episódio',
      'markAllPrevious': 'Todos os episódios anteriores',
      'markAllNext': 'Todos os próximos episódios'
    },
    'ru-RU': {
      'markAsWatched': 'Отметить как просмотренное',
      'markAsNotWatched': 'Отметить как непросмотренное',
      'markOnlyThisOne': 'Только эту серию',
      'markAllPrevious': 'Все предыдущие серии',
      'markAllNext': 'Все следующие серии'
    },
    'hi-IN': {
      'markAsWatched': 'देखा गया चिह्नित करें',
      'markAsNotWatched': 'नहीं देखा गया चिह्नित करें',
      'markOnlyThisOne': 'केवल यह एपिसोड',
      'markAllPrevious': 'सभी पिछले एपिसोड',
      'markAllNext': 'सभी अगले एपिसोड'
    }
  };
  
  const localeTranslations = translations[window.locale] || translations['en-US'];
  const fallbackTranslations = {
    'markAsWatched': 'Mark as watched',
    'markAsNotWatched': 'Mark as not watched',
    'markOnlyThisOne': 'Only this episode',
    'markAllPrevious': 'All previous episodes',
    'markAllNext': 'All next episodes'
  };
  
  return localeTranslations[key] || fallbackTranslations[key] || key;
}

class Renderer {
  constructor(tagName) {
    this.element = this.create(tagName);
  }
  
  static translate(key) {
    return getTranslation(key);
  }

  create(tagName) {
    return document.createElement(tagName);
  }

  getElement() {
    return this.element;
  }

  addClass(...classes) {
    this.element.classList.add(...classes);
    return this;
  }

  removeClass(...classes) {
    this.element.classList.remove(...classes);
    return this;
  }

  setAttribute(name, value) {
    this.element.setAttribute(name, value);
    return this;
  }

  removeAttribute(name) {
    this.element.removeAttribute(name);
    return this;
  }

  setStyle(key, value) {
    this.element.style[key] = value;
    return this;
  }

  setText(text) {
    this.element.textContent = text;
    return this;
  }

  appendChildren(...children) {
    children.forEach((child) => {
      if (child instanceof Renderer) {
        this.element.appendChild(child.getElement());
      } else {
        this.element.appendChild(child);
      }
    });
    return this;
  }

  addEventListener(type, listener) {
    this.element.addEventListener(type, listener);
    return this;
  }

  click() {
    this.element.click();
  }

  focus() {
    this.element.focus();
  }

  remove() {
    this.element.remove();
  }

  removeChildren() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    return this;
  }
}

class InputRenderer extends Renderer {
  getValue() {
    return this.element.value;
  }

  setValue(value) {
    this.element.value = value;
    return this;
  }

  setDisabled(value) {
    this.element.disabled = value;
    return this;
  }
}

class SelectRenderer extends InputRenderer {
  constructor() {
    super('select');
  }

  getValue() {
    const value = super.getValue();
    if (value.match(/^\d+$/)) {
      return +value;
    }
    return value;
  }

  getOptionDOM() {
    return this.element.options[this.element.selectedIndex];
  }
}

class SvgRenderer extends Renderer {
  create(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }
}


class MenuRenderer {
  name;
  subMenu;

  constructor(entry) {
    this.name = entry.name;
    this.subMenu = entry.subMenu;
  }

  render() {
    const actionMenuEntry = new Renderer('div');
    actionMenuEntry
      .setText(Renderer.translate(this.name))
      .addClass('ic_action_menu_parent')
      .addEventListener('click', (event) => (event.target === actionMenuEntry ? event.stopPropagation() : undefined))
      .appendChildren(this.subMenu.render());
    return actionMenuEntry;
  }
}

class ActionRenderer {
  name;
  action;

  constructor(entry) {
    this.name = entry.name;
    this.action = entry.action;
  }

  render() {
    return new Renderer('div')
      .addClass('ic_action_menu_action')
      .setText(Renderer.translate(this.name))
      .addEventListener('click', () => {
        document.documentElement.classList.add('ic_loading');
        Promise.resolve(this.action())
          .then(() => document.documentElement.classList.remove('ic_loading'))
          .catch(() => document.documentElement.classList.remove('ic_loading'));
      });
  }
}

class ActionMenuRenderer {
  entries;

  constructor(entries) {
    this.entries = entries
      .map((entry) => {
        if (entry && (typeof entry.if !== 'function' || entry.if())) {
          if (entry.type === 'menu') {
            entry.subMenu = new ActionMenuRenderer(entry.subMenus);
            if (entry.subMenu.entries.length === 1) {
              const child = entry.subMenu.entries[0];
              child.name = entry.name;
              return child;
            }
            return new MenuRenderer(entry);
          } else if (entry.type === 'action') {
            if (typeof entry.action === 'function') {
              return new ActionRenderer(entry);
            }
          }
        }
      })
      .filter((entry) => entry);
    this.length = this.entries.length;
  }

  render() {
    return new Renderer('div')
      .addClass('ic_action_menu')
      .appendChildren(...this.entries.map((entry) => entry.render()));
  }
}