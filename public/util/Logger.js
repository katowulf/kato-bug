
class Logger {
  constructor(selector, childType) {
    this.parentEl = document.querySelector(selector);
    this.childType = childType;
  }

  log(...messages) {
    console.log(...messages);
    const msg = Logger.ts() + messages.join(' ');
    const el = document.createElement(this.childType);
    el.innerText = msg;
    this.parentEl.prepend(el);
  }

  error(e) {
    console.error(e);
    const el = document.createElement(this.childType);
    el.innerText = Logger.ts() + e;
    el.classList.add('error');
    this.parentEl.prepend(el);
  }

  then(msg, icon=null) {
    return (o) => {
      this.log(msg || o);
      if( icon ) icon.success();
    }
  }

  catch(icon=null) {
    return (e) => {
      this.error(e);
      if( icon ) icon.error();
    }
  }

  static ts() {
    return "[" + new Date().toLocaleTimeString() + "] ";
  }
}