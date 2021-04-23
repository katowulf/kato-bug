import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Validator} from "./Validator";
import * as corsLib from "cors";
const cors = corsLib({origin: true});

admin.initializeApp();

// A generic hosted function
// used in https://groups.google.com/a/google.com/d/msgid/firebase-discuss/feefb07c-599f-4b71-a162-460709bee5c9%40google.com?utm_medium=email&utm_source=footer
export const hostedFunction = functions.https.onRequest((req, res) => {
  res.send("♡\n<br>" + req.path + "\n<br>" + req.url);
});

// Example of JS validation using Functions
// See https://stackblitz.com/edit/typescript-nwc4cc?file=index.ts
export const validateWriteRequest = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    const validator = new Validator();
    validator.addField("string", "String", "string", NaN, 10);
    validator.addField("integer", "Integer", "number", 0, 1000);
    validator.addField("boolean", "Boolean", "boolean");
    validator.addField("timestamp", "Timestamp", "number", 0);

    console.log("req.body", req.body);
    console.log("req.params", req.params);
    const data = Object.assign({}, req.body);

    const errors = validator.validate(data);
    if (errors.length) {
      res.send({status: "invalid", errors: errors});
    } else {
      // convert timestamps
      data.timestamp = admin.firestore.Timestamp.fromDate(new Date(data.timestamp));

      admin.firestore().doc("firebase-talk/791dc982-ed39-4bb0-819f-d458e94f9bff").set(data)
          .then(() => res.send({status: "success"}))
          .catch(e => res.send({status: "error", error: e}));
    }
    res.send({
      status: errors.length ? "error" : "success",
      errors: errors.length ? errors : null
    });
  });
});


// Not sure where these came from

export const readRaw = functions.https.onCall((data/* , context*/) => {
  const path = data.path;
  if (!isValidPath(path)) {
    throw new functions.https.HttpsError("invalid-argument", "Path was not valid");
  }
  return readData(path);
});

export const getRaw = functions.https.onRequest((req, res) => {
  const path = req.params.path;
  console.log("Path", path);
  return cors(req, res, () => {
    if (isValidPath(path)) {
      readData(path).then((data) => res.send(data))
          .catch((e) => res.status(400).send({error: e}));
    } else {
      res.status(400).send({error: "Invalid path"});
    }
  });
});

export const buildToken = functions.https.onRequest((req, res) => {
  const data = Object.assign({}, req.body);
  functions.logger.log("data", data);
  const key = data.xkey;
  if (key !== "3H%*NrMs6Nb*73t15y$4sYzxfMl4%IezlJLDsl4h") {
    res.status(403).send("Unauthorized");
    return;
  }
  res.json({foo: "bar"});
  // const uid = data.uid;
  // const claims = data.claims;
  // admin
  //     .auth()
  //     .createCustomToken(uid, claims)
  //     .then((customToken) => {
  //       res.json({token: customToken});
  //     })
  //     .catch((error) => {
  //       console.log("Error creating custom token:", error);
  //       res.status(500).send("Error occurred");
  //     });
});

function isValidPath(path: string) {
  switch (path) {
    case "/groups/NXfFvMfA6bg":
      return true;
    default:
      return false;
  }
}

function readData(path: string) {
  return admin.database().ref(path).once("value").then(snap => snap.val());
}
