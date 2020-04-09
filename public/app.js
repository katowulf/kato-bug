document.addEventListener('DOMContentLoaded', async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const version = urlParams.get('v') || '7.13.2';
  const versions = ["7.13.2", "6.6.2", "5.10.1", "4.7.0", "4.1.0"];
  let app = null;

  // ☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃
  // Load util libs
  // ☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃☃
  const logger = new Logger("#log", "li");

  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  // // The Firebase SDK is initialized and available here!
  //
  // firebase.auth().onAuthStateChanged(user => { });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  try {
    const mgr = new DependencyManager(version, ['auth', 'firestore', 'database']);
    mgr.parallel(['util/DomHelper.js', 'util/StatusIcon.js']);
    await mgr.load();
    app = firebase.app();
    let features = ['auth', 'database', 'firestore', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
    logger.log(`Firebase SDK ${version} loaded with ${features.join(', ')}`);
  } catch (e) {
    logger.error(e);
    return;
  }

  // Construct some helpers for managing UI state
  const authButtonToggle = DomHelper.buttonToggle(['signIn', 'signOut'], 'off');
  const authIcon = new StatusIcon("#auth div.state i", ['success', 'error']);
  const rtdbIcon = new StatusIcon("#rtdb div.state i");
  const fsIcon = new StatusIcon("#firestore div.state i");

  // generate versions suggest list
  const list = '<a href="/">latest</a>, ' + versions.map(v => `<a href='#' data-version='${v}'>${v}</a>`).join(', ');
  DomHelper.html("#version small", list);

  // monitor auth state and update toggle buttons
  app.auth().onAuthStateChanged(user => {
    logger.log('onAuthStateChanged: ', user? user.uid : null);
    const isSignedIn = user !== null;
    let msg = !isSignedIn? "Signed out" : `Logged in as ${user.displayName || user.providerData[0].displayName || user.uid}.`;
    DomHelper.text("#auth small", msg);
    authButtonToggle(isSignedIn? 'signOut' : 'signIn');
  });

  // handle sign in attempts
  DomHelper.click("button[data-action=signIn]", e => {
    authIcon.wait();
    const provider = new firebase.auth.GoogleAuthProvider();
    app.auth().signInWithPopup(provider).then(function(result) {
      logger.log(`Logged in as ${result.user.uid} => ${result.user.displayName}`);
      authIcon.success();
    }).catch(logger.catch(authIcon));
  });

  // handle sign out attempts
  document.querySelector("button[data-action=signOut  ]").addEventListener("click", e => {
    authIcon.clear();
    app.auth().signOut().then(logger.then("Signed out")).catch(logger.catch());
  });

  // handle version changes
  function loadVersion(newVersion) {
    if( newVersion.match(/^[0-9]+\.[0-9]+\.[0-9]+$/) ) {
      window.location.href = `index.html?v=${newVersion}`;
    }
    else {
      logger.error(new Error("Invalid version, must match x.x.x format: " + newVersion));
    }
  }
  DomHelper.click("#version a[data-version]", e => loadVersion(e.target.dataset.version));
  DomHelper.click("#version button", e => loadVersion(DomHelper.val("#version input")));

  // save data to rtdb
  DomHelper.click("#rtdb button", e => {
    rtdbIcon.wait();
    const val = DomHelper.val("#rtdb input");
    app.database().ref("app/foo").set(val)
        .then(logger.then("Wrote to RTDB", rtdbIcon))
        .catch(logger.catch(rtdbIcon));
  });

  // save data to firestore
  DomHelper.click("#firestore button", e => {
    fsIcon.wait();
    const val = DomHelper.val("#firestore input");
    app.firestore().doc("app/foo").set({foo: val}, {merge: true})
        .then(logger.then("Wrote to Firestore", fsIcon))
        .catch(logger.catch(fsIcon));
  });
});

