import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "materiales-torrecillas",
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

export default admin;
