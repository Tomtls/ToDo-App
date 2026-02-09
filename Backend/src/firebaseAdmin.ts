import fs from "node:fs";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

let firebaseApp: admin.app.App | null = null;

function loadServiceAccount(): admin.ServiceAccount {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    return JSON.parse(rawJson) as admin.ServiceAccount;
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (filePath) {
    const contents = fs.readFileSync(filePath, "utf8");
    return JSON.parse(contents) as admin.ServiceAccount;
  }

  throw new Error(
    "Missing Firebase service account. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH."
  );
}

export function isFirebaseAdminConfigured() {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  );
}

export function getFirebaseAdminApp() {
  if (firebaseApp) return firebaseApp;
  const serviceAccount = loadServiceAccount();
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return firebaseApp;
}

export function getAdminAuth() {
  return getFirebaseAdminApp().auth();
}

export function getAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}
