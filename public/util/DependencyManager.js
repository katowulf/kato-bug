
class DependencyManager {
  constructor(firebaseVersion, firebaseLibs) {
    this.parallelLibs = [];
    this.afterLibs = [];
    if( firebaseVersion > "4.1.0" ) {
      this.preLibs = [`/__/firebase/${version}/firebase-app.js`];
      this.firebaseLibs = firebaseLibs.map(lib => `/__/firebase/${firebaseVersion}/firebase-${lib}.js`);
    }
    else {
      this.preLibs = [];
      this.firebaseLibs = [`https://www.gstatic.com/firebasejs/${version}/firebase.js`];
    }
    this.firebaseLibs.push(`/__/firebase/init.js`); // it's okay to call init while still loading libs
  }

  /**
   * Load libraries that don't depend on Firebase and therefore can be loaded in parallel for improved speed.
   * @param list Array of urls
   */
  parallel(list) {
    this.parallelLibs.push(...list);
  }

  /**
   * Load these libraries after Firebase since they depend on the functionality provided there.
   * @param list
   */
  after(list) {
    this.afterLibs.push(...list);
  }

  async load() {
    console.log('Fetching dependencies in this order');
    console.log(' - Pre: ', this.preLibs);
    console.log(' - Main: ', this.firebaseLibs);
    console.log(' - After: ', this.afterLibs);
    console.log('In parallel: ', this.parallelLibs);

    function doScripts(list) {
      return Promise.all(list.map(DependencyManager.buildScript));
    }

    const batch1 = doScripts(this.parallelLibs);
    const batch2 = doScripts(this.preLibs)
        .then(() => doScripts(this.firebaseLibs))
        .then(() => doScripts(this.afterLibs));

    return Promise.all([batch1, batch2]);
  }

  static buildScript(url) {
    return new Promise((resolver, rejecter) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.async = true;
      script.onload = () => {
        console.log("Finished loading", url);
        resolver();
      };
      document.body.appendChild(script);
    });
  }
}