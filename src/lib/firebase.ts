import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Workout, WorkoutTemplate, PersonalRecord, UserProfile } from '../types';

// 1. Initialize Firebase App and Services
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/* CRITICAL: The app will break without specifying firestoreDatabaseId */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// 2. Structured Error Handling as mandated by the Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Boot-time Connection Probe to Firestore
export async function testConnection(): Promise<boolean> {
  try {
    const probeRef = doc(db, 'test', 'connection');
    await getDocFromServer(probeRef);
    console.info('[Firebase] Cloud Firestore connected and online');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Firestore client is offline or network is degraded');
    } else {
      console.info('[Firebase] Connection probe completed:', error instanceof Error ? error.message : error);
    }
    return false;
  }
}

// Run connection probe on module evaluation
testConnection().catch(() => {});

// 4. Google Authentication Helper (configured via OAuth Client ID in project)
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Ensure user record is initialized in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        id: user.uid,
        email: user.email || '',
        username: user.displayName || user.email?.split('@')[0] || 'Athlete',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(err => {
      console.warn('[Firebase] Non-fatal user doc sync warning:', err);
    });

    return user;
  } catch (error) {
    console.error('[Firebase] Google sign-in failed:', error);
    throw error;
  }
}

export async function signOutFromFirebase(): Promise<void> {
  await signOut(auth);
}

// 5. Cloud Firestore Persistence Operations for Workouts
export async function saveWorkoutToFirestore(userId: string, workout: Workout): Promise<void> {
  const path = `users/${userId}/workouts/${workout.id}`;
  try {
    const workoutRef = doc(db, 'users', userId, 'workouts', workout.id);
    const cleanWorkout: Record<string, any> = {
      id: String(workout.id),
      userId: String(userId),
      name: String(workout.name || 'Workout Session'),
      startedAt: String(workout.startedAt || new Date().toISOString()),
      updatedAt: new Date().toISOString(),
    };

    if (workout.completedAt) cleanWorkout.completedAt = String(workout.completedAt);
    if (typeof workout.durationSeconds === 'number') cleanWorkout.durationSeconds = workout.durationSeconds;
    if (typeof workout.totalVolumeKg === 'number') cleanWorkout.totalVolumeKg = workout.totalVolumeKg;
    if (typeof workout.totalSets === 'number') cleanWorkout.totalSets = workout.totalSets;
    if (workout.notes) cleanWorkout.notes = String(workout.notes).slice(0, 2000);
    if (Array.isArray(workout.exercises)) cleanWorkout.exercises = workout.exercises;
    if (Array.isArray(workout.musclesTrained)) cleanWorkout.musclesTrained = workout.musclesTrained;

    await setDoc(workoutRef, cleanWorkout, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteWorkoutFromFirestore(userId: string, workoutId: string): Promise<void> {
  const path = `users/${userId}/workouts/${workoutId}`;
  try {
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
    await deleteDoc(workoutRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getWorkoutsFromFirestore(userId: string): Promise<Workout[]> {
  const path = `users/${userId}/workouts`;
  try {
    const workoutsCol = collection(db, 'users', userId, 'workouts');
    const snap = await getDocs(workoutsCol);
    const results: Workout[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      results.push({
        id: data.id || docSnap.id,
        name: data.name || 'Workout',
        startedAt: data.startedAt || new Date().toISOString(),
        completedAt: data.completedAt,
        durationSeconds: data.durationSeconds || 0,
        totalVolumeKg: data.totalVolumeKg || 0,
        totalSets: data.totalSets || 0,
        notes: data.notes || '',
        exercises: data.exercises || [],
        musclesTrained: data.musclesTrained || []
      });
    });

    // Sort by startedAt descending
    results.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 6. Templates Cloud Persistence
export async function saveTemplateToFirestore(userId: string, template: WorkoutTemplate): Promise<void> {
  const path = `users/${userId}/templates/${template.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'templates', template.id);
    await setDoc(
      docRef,
      {
        id: template.id,
        userId,
        name: template.name,
        description: template.description || '',
        category: template.category || 'other',
        exercises: template.exercises || [],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getTemplatesFromFirestore(userId: string): Promise<WorkoutTemplate[]> {
  const path = `users/${userId}/templates`;
  try {
    const colRef = collection(db, 'users', userId, 'templates');
    const snap = await getDocs(colRef);
    const list: WorkoutTemplate[] = [];
    snap.forEach(d => {
      list.push(d.data() as WorkoutTemplate);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 7. Personal Records Cloud Persistence
export async function savePersonalRecordToFirestore(userId: string, record: PersonalRecord): Promise<void> {
  const recordId = record.exerciseId;
  const path = `users/${userId}/personalRecords/${recordId}`;
  try {
    const docRef = doc(db, 'users', userId, 'personalRecords', recordId);
    await setDoc(
      docRef,
      {
        id: recordId,
        userId,
        exerciseId: record.exerciseId,
        exerciseName: record.exerciseName || '',
        maxWeightKg: Number(record.maxWeightKg || 0),
        maxReps: Number(record.maxReps || 0),
        estimated1RMKg: Number(record.estimated1RMKg || 0),
        achievedAt: record.achievedAt || new Date().toISOString(),
        workoutId: record.workoutId || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getPersonalRecordsFromFirestore(userId: string): Promise<PersonalRecord[]> {
  const path = `users/${userId}/personalRecords`;
  try {
    const colRef = collection(db, 'users', userId, 'personalRecords');
    const snap = await getDocs(colRef);
    const list: PersonalRecord[] = [];
    snap.forEach(d => {
      const data = d.data();
      list.push({
        exerciseId: data.exerciseId || d.id,
        exerciseName: data.exerciseName || '',
        maxWeightKg: Number(data.maxWeightKg ?? (data as any).weightKg ?? 0),
        maxReps: Number(data.maxReps ?? (data as any).reps ?? 0),
        estimated1RMKg: Number(data.estimated1RMKg ?? (data as any).estimated1RM ?? 0),
        achievedAt: data.achievedAt || new Date().toISOString(),
        workoutId: data.workoutId || ''
      });
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 8. User Profile Cloud Persistence
export async function saveUserProfileToFirestore(userId: string, profile: UserProfile): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userDoc = doc(db, 'users', userId);
    await setDoc(
      userDoc,
      {
        id: userId,
        profile,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const userDoc = doc(db, 'users', userId);
    const snap = await getDoc(userDoc);
    if (snap.exists() && snap.data().profile) {
      return snap.data().profile as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
