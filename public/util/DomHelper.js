
class DomHelper {

  static iconToggle(selector, possibleStates) {
    return (icon, state) => {
      DomHelper.text(selector, icon);
      DomHelper.class(selector, state, possibleStates);
    };
  }

  static buttonToggle(dataActionNames, offState) {
    return (activeName) => {
      const sel = dataActionNames.map(name => `button[data-action=${name}]`).join(',');
      DomHelper.class(sel, offState);
      DomHelper.class(`button[data-action=${activeName}]`, null, offState);
    };
  }

  static val(selector, newVal=undefined) {
    const el = document.querySelector(selector);
    const oldVal = el.value;
    if( newVal !== undefined ) { el.value = newVal; }
    return oldVal;
  }

  static make(elType, classes=[]) {
    const el = document.createElement(elType);
    el.classList.add(...classes);
  }

  static get(selector) {
    return document.querySelectorAll(selector);
  }

  static html(selector, currentState) {
    DomHelper.get(selector).forEach(el => el.innerHTML = currentState);
  }

  static class(selector, addClasses, removeClasses) {
    DomHelper.get(selector).forEach(el => {
      if( removeClasses ) { el.classList.remove(...[].concat(removeClasses)); }
      if( addClasses ) { el.classList.add(...[].concat(addClasses)); }
    });
  }

  static text(selector, text) {
    DomHelper.get(selector).forEach(el => el.innerText = text);
  }

  static click(selector, fn) {
    DomHelper.get(selector).forEach(el => el.addEventListener('click', e => {
      e.preventDefault();
      fn(e);
    }));
  }
}