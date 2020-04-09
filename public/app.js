document.addEventListener('DOMContentLoaded', async function() {
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  // // The Firebase SDK is initialized and available here!
  //
  // firebase.auth().onAuthStateChanged(user => { });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

  const urlParams = new URLSearchParams(window.location.search);
  const version = urlParams.get('v') || '7.13.2';
  const versions = ["7.13.2", "6.6.2", "5.10.1", "4.7.0", "4.1.0"];

  function wait(set) {
    const icon = document.querySelector(`#${set} div.state i`);
    icon.innerText = 'hourglass_empty';
    icon.classList.remove('success', 'error');
  }

  function logResult(success, set, msg) {
    const icon = document.querySelector(`#${set} div.state i`);
    icon.innerText = success? 'check_circle' : 'error';
    icon.classList.toggle('success', success);
    icon.classList.toggle('error', !success);
    if( success ) { log(msg || `set ${set} successfully`); }
    else { logError(msg); }
  }

  function logError(e) {
    console.error(e);
    const s = e.toString();
    const li = document.createElement("li");
    li.innerText = s;
    li.classList.add("error");
    document.getElementById('log').prepend(li);
  }

  function log(o) {
    console.log(o);
    const li = document.createElement("li");
    li.innerText = o + '';
    document.getElementById('log').prepend(li);
  }

  function loadScripts(version) {
    const scripts = [];

    if( version > "4.1.0" ) {
      scripts.push(...[
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
      scripts.push(...[
        `https://www.gstatic.com/firebasejs/${version}/firebase.js`,
        `/__/firebase/init.js`
      ]);
    }

    return Promise.all(scripts.map(
        u => (new Promise((resolver, rejecter) => {
          console.log(`Loading script ${u}`);
          const script = document.createElement("script");
          script.type = "text/javascript";
          script.src = u;
          script.async = false;
          script.onload = () => { console.log("onload", u); resolver(); };
          document.body.appendChild(script);
        }))
    ));
  }

  let app = null;

  try {
    await loadScripts(version);
    app = firebase.app();
    let features = ['auth', 'database', 'firestore', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
    document.getElementById('load').innerHTML = `Firebase SDK ${version} loaded with ${features.join(', ')}`;
  } catch (e) {
    console.error(e);
    document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
    return;
  }

  // generate versions suggest list
  document.querySelector("#version small").innerHTML = '<a href="/">latest</a>, ' +
      versions.map(v => `<a href='#' data-version='${v}'>${v}</a>`).join(', ');

  // monitor auth state
  app.auth().onAuthStateChanged(user => {
    log('onAuthStateChanged: ' + (user? user.uid : null));
    let msg = "Signed out";
    if( user !== null ) {
      const displayName = user.displayName || user.providerData[0].displayName || user.uid;
      msg = `Logged in as ${displayName}.`;
    }
    document.querySelector("#auth p").innerText = msg;
    document.querySelector('button[data-action=signIn').classList.toggle('off', user !== null);
    document.querySelector('button[data-action=signOut').classList.toggle('off', user == null);
  });

  // handle sign in attempts
  document.querySelector("button[data-action=signIn]").addEventListener("click", e => {
    wait("auth");
    var provider = new firebase.auth.GoogleAuthProvider();
    app.auth().signInWithPopup(provider).then(function(result) {
      const msg = `Logged in as ${result.user.uid} => ${result.user.displayName}`;
      logResult(true, "auth", msg);
    }).catch(function(error) {
      logResult(false, "auth", error);
    });
  });

  // handle sign out attempts
  document.querySelector("button[data-action=signOut  ]").addEventListener("click", e => {
    wait("auth");
    app.auth().signOut().then(() => logResult(true, "auth", "Signed out"))
        .catch(e => logResult(false, "auth", e));
  });

  // handle version changes
  const selectFn = e => {
    e.preventDefault();
    document.querySelector("#version input").value = e.target.dataset.version;
  };
  document.querySelectorAll("#version a[data-version]").forEach(el => el.addEventListener("click", selectFn));

  // handle version changes
  document.querySelector("#version button").addEventListener("click", e => {
    const version = document.querySelector("#version input").value;
    if( version.match(/^[0-9]+\.[0-9]+\.[0-9]+$/) ) {
      window.location.href = `index.html?v=${version}`;
    }
    else {
      logError(new Error("Invalid version, must match x.x.x format: " + version));
    }
  });

  // save data to rtdb
  document.querySelector("#rtdb button").addEventListener("click", e => {
    wait("rtdb");
    const val = document.querySelector("#rtdb input").value;
    app.database().ref("app/foo").set(val).then(() => logResult(true, "rtdb"))
        .catch(e => logResult(false, "rtdb", e));
  });

  // save data to firestore
  document.querySelector("#firestore button").addEventListener("click", e => {
    wait("firestore");
    const val = document.querySelector("#firestore input").value;
    app.firestore().doc("app/foo").set({foo: val})
        .then(() => logResult(true, "firestore"))
        .catch(e => logResult(false, "firestore", e));
  });
});

