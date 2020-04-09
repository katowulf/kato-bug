
class DependencyManager {
  static loadFirebase(version) {
    const firebaseLibs = [];

    if( version > "4.1.0" ) {
      firebaseLibs.push(...[
        `/__/firebase/${version}/firebase-app.js`,
        `/__/firebase/${version}/firebase-auth.js`,
        `/__/firebase/${version}/firebase-database.js`,
        `/__/firebase/${version}/firebase-messaging.js`,
        `/__/firebase/${version}/firebase-storage.js`,
        `/__/firebase/${version}/firebase-firestore.js`,
        `/__/firebase/init.js`
      ]);
    }
    else {
      firebaseLibs.push(...[
        `https://www.gstatic.com/firebasejs/${version}/firebase.js`,
        `/__/firebase/init.js`
      ]);
    }

    return DependencyManager.deps(firebaseLibs);
  }

  static deps(list) {
    console.log('Fetching dependencies: ', list);
    return Promise.all(list.map(
        u => (new Promise((resolver, rejecter) => {
          const script = document.createElement("script");
          script.type = "text/javascript";
          script.src = u;
          script.async = false;
          script.onload = () => { console.log("Finished loading", u); resolver(); };
          document.body.appendChild(script);
        }))
    ));
  }
}