import React, { useState, useEffect, useRef } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { AlertConfig, SavedIncidentReport, UserProfile } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };

  const isPermissionDenied =
    errMsg.includes('permission-denied') ||
    errMsg.includes('Missing or insufficient permissions') ||
    errMsg.includes('insufficient permissions');

  if (isPermissionDenied) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn('Firestore Operation Notice (Offline/Fallback):', JSON.stringify(errInfo));
  }
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [signingIn, setSigningIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isSigningInRef = useRef<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (fbUser) {
        const userProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Operator',
          photoURL: fbUser.photoURL,
          role: 'operator',
        };

        setUser(userProfile);

        // Sync or create user record in Firestore
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          await setDoc(
            userDocRef,
            {
              id: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || 'Operator',
              photoURL: fbUser.photoURL,
              role: 'operator',
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (e: any) {
          handleFirestoreError(e, OperationType.WRITE, `users/${fbUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    // Guard against concurrent popup requests to prevent "INTERNAL ASSERTION FAILED: Pending promise was never set"
    if (isSigningInRef.current) {
      console.info('Sign-in operation already in progress, ignoring duplicate request.');
      return;
    }

    isSigningInRef.current = true;
    setSigningIn(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      const errCode = err?.code || '';
      const errMsg = err?.message || '';

      if (
        errCode === 'auth/cancelled-popup-request' ||
        errCode === 'auth/popup-closed-by-user' ||
        errCode === 'auth/user-cancelled' ||
        errMsg.includes('cancelled-popup-request') ||
        errMsg.includes('popup-closed-by-user') ||
        errMsg.includes('Pending promise was never set')
      ) {
        // Expected cancellation when user closes the popup or retries
        console.info('Google Sign-In popup was closed or superseded.');
      } else if (errCode === 'auth/popup-blocked') {
        console.warn('Google Sign-In popup was blocked by the browser. Please allow popups.');
        setError('Popup blocked by browser. Please enable popups and try again.');
      } else {
        console.warn('Google Sign-In notice:', errMsg || errCode);
        setError(errMsg || 'Google sign-in could not be completed');
      }
    } finally {
      isSigningInRef.current = false;
      setSigningIn(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.warn('Logout notice:', err);
    }
  };

  return { user, loading, signingIn, error, loginWithGoogle, logout };
}

// Firestore operations for persisting user alert configurations
export async function saveUserAlertConfigToFirestore(userId: string, config: AlertConfig, theme: string, sectorId: string) {
  try {
    const configDocRef = doc(db, 'userConfigs', userId);
    await setDoc(configDocRef, {
      userId,
      alertConfig: config,
      theme,
      activeSectorId: sectorId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `userConfigs/${userId}`);
    return false;
  }
}

export async function loadUserAlertConfigFromFirestore(userId: string): Promise<AlertConfig | null> {
  try {
    const configDocRef = doc(db, 'userConfigs', userId);
    const snap = await getDoc(configDocRef);
    if (snap.exists()) {
      return snap.data()?.alertConfig as AlertConfig;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `userConfigs/${userId}`);
  }
  return null;
}

// Firestore persistent incident dispatch logging
export async function logIncidentToFirestore(incident: Omit<SavedIncidentReport, 'id' | 'createdAt'>) {
  try {
    const colRef = collection(db, 'incidentReports');
    const docRef = await addDoc(colRef, {
      ...incident,
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'incidentReports');
    return null;
  }
}

// Subscribe to real-time incident reports across all sectors
export function subscribeIncidentReports(callback: (reports: SavedIncidentReport[]) => void) {
  try {
    const colRef = collection(db, 'incidentReports');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(20));
    return onSnapshot(
      q,
      (snapshot) => {
        const reports: SavedIncidentReport[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        callback(reports);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'incidentReports');
      }
    );
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, 'incidentReports');
    return () => {};
  }
}
