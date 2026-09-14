import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer, collection, getDocs, setDoc, query, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the databaseId provided in firebase-applet-config if specified
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Validates Firestore database connectivity at startup
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firestore] Connected successfully.');
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] Client is offline or database initializing.');
      return false;
    }
    // Expected if document doesn't exist yet, but connection was made
    console.log('[Firestore] Connection validated.');
    return true;
  }
}

/**
 * Saves or updates user detail in Firestore
 */
export async function saveUserToFirestore(userData: {
  email: string;
  uid: string;
  displayName: string;
  role?: string;
}) {
  try {
    // Sanitize document ID using base64 or alphanumeric
    const docId = userData.email.replace(/[^a-zA-Z0-9]/g, '_');
    const userRef = doc(db, 'users', docId);
    await setDoc(
      userRef,
      {
        email: userData.email,
        uid: userData.uid,
        displayName: userData.displayName,
        role: userData.role || (userData.email === 'deepsonpokhrel12@gmail.com' ? 'admin' : 'user'),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('[Firestore] Error saving user:', err);
    return false;
  }
}

/**
 * Saves a confirmed transaction to Firestore for the Admin Panel
 */
export async function saveTransactionToFirestore(txData: {
  orderId: string;
  billId: string;
  userEmail: string;
  userUid: string;
  amount: number;
  credits: number;
  utrReference?: string;
  status: 'completed' | 'pending' | 'rejected';
}) {
  try {
    const txRef = doc(db, 'transactions', txData.orderId);
    await setDoc(txRef, {
      ...txData,
      verifiedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('[Firestore] Error saving transaction:', err);
    return false;
  }
}

/**
 * Loads all confirmed transactions for the Admin Panel from Firestore
 */
export async function fetchTransactionsFromFirestore() {
  try {
    const txCol = collection(db, 'transactions');
    const q = query(txCol, orderBy('verifiedAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  } catch (err) {
    console.error('[Firestore] Error fetching transactions:', err);
    return [];
  }
}

/**
 * Loads all registered users from Firestore for the Admin Panel
 */
export async function fetchUsersFromFirestore() {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    return snapshot.docs.map((d) => d.data());
  } catch (err) {
    console.error('[Firestore] Error fetching users:', err);
    return [];
  }
}
