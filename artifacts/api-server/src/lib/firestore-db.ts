import { db } from "./firebase-admin";

export async function getAll(collection: string) {
  const snapshot = await db.collection(collection).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getOne(collection: string, id: string) {
  const doc = await db.collection(collection).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

export async function create(collection: string, data: any) {
  const docRef = await db.collection(collection).add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
}

export async function update(collection: string, id: string, data: any) {
  await db.collection(collection).doc(id).update({
    ...data,
    updatedAt: new Date(),
  });
  return getOne(collection, id);
}

export async function remove(collection: string, id: string) {
  await db.collection(collection).doc(id).delete();
  return true;
}

export async function query(collection: string, field: string, operator: any, value: any) {
  const snapshot = await db.collection(collection).where(field, operator, value).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
