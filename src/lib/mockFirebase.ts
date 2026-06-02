/**
 * Mock Firebase SDK Implementation for Standalone/Offline mode.
 * Persists all collections (users, businesses, opportunities, notices) to localStorage.
 * Seamlessly supports full reactive updates (onSnapshot), queries, auth, and image uploading!
 */

// Global mock state management
interface Store {
  users: Record<string, any>;
  businesses: Record<string, any>;
  notices: Record<string, any>;
  opportunities: Record<string, any>;
  [key: string]: Record<string, any>;
}

const getStore = (): Store => {
  const data = localStorage.getItem('bethalhub_mock_db');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // Corrupt data, fallback to seed
    }
  }

  const defaultStore: Store = {
    users: {
      "bethal-admin-user": {
        uid: "bethal-admin-user",
        email: "admin@bethalhub.co.za",
        displayName: "Sipho Khumalo (Host)",
        phoneNumber: "017 647 1111",
        role: "admin",
        isVerified: true,
        location: "Bethal Central",
        bio: "Bethal Hub Admin. Serving the local Govan Mbeki municipal community with pride.",
        createdAt: new Date().toISOString()
      },
      "local-resident-1": {
        uid: "local-resident-1",
        email: "resident@gmail.com",
        displayName: "Sarah Nkosi",
        phoneNumber: "082 123 4567",
        role: "individual",
        isVerified: true,
        location: "eMzinoni",
        bio: "Active community volunteer in eMzinoni.",
        createdAt: new Date().toISOString()
      }
    },
    businesses: {
      "biz-1": {
        id: "biz-1",
        name: "Bethal Food & Veg",
        category: "Grocery",
        description: "Fresh local produce for the Bethal community.",
        location: "Bethal Central",
        contact: "017 647 1234",
        verified: true,
        ownerId: "system",
        website: "https://example.com",
        createdAt: new Date().toISOString()
      },
      "biz-2": {
        id: "biz-2",
        name: "Govan Mbeki Tech Solutions",
        category: "IT Services",
        description: "Professional computer repairs and networking.",
        location: "eMzinoni",
        contact: "017 647 5678",
        verified: true,
        ownerId: "system",
        createdAt: new Date().toISOString()
      },
      "biz-3": {
        id: "biz-3",
        name: "Highveld Agriculture Corp",
        category: "Agriculture",
        description: "Local grain and livestock farming suppliers.",
        location: "Bethal North",
        contact: "017 647 9999",
        verified: false,
        ownerId: "system",
        createdAt: new Date().toISOString()
      }
    },
    opportunities: {
      "opp-1": {
        id: "opp-1",
        title: "Municipal Waste Management Tender",
        organization: "Govan Mbeki Municipality",
        category: "Tender",
        description: "The municipality invites bids for waste collection services in Bethal and surrounding areas.",
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Secunda/Bethal",
        status: "open",
        authorId: "bethal-admin-user",
        createdAt: new Date().toISOString()
      },
      "opp-2": {
        id: "opp-2",
        title: "Junior Admin Assistant",
        organization: "Bethal Agri-Business",
        category: "Job",
        description: "Looking for a motivated individual to help with daily administrative tasks.",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Bethal North",
        status: "open",
        authorId: "bethal-admin-user",
        createdAt: new Date().toISOString()
      }
    },
    notices: {
      "notice-1": {
        id: "notice-1",
        title: "Scheduled Power Maintenance",
        content: "Electricity will be down in Bethal West on Wednesday from 08:00 to 16:00 for infrastructure upgrades.",
        type: "Water/Electricity",
        priority: "high",
        authorId: "bethal-admin-user",
        createdAt: new Date().toISOString()
      },
      "notice-2": {
        id: "notice-2",
        title: "Community Clean-up Day",
        content: "Join us this Saturday at the Town Square for our monthly neighborhood cleanup. Refuse bags provided.",
        type: "Event",
        priority: "medium",
        authorId: "bethal-admin-user",
        createdAt: new Date().toISOString()
      }
    }
  };

  saveStore(defaultStore);
  return defaultStore;
};

const saveStore = (store: Store) => {
  localStorage.setItem('bethalhub_mock_db', JSON.stringify(store));
  triggerCallbacks();
};

// Subscriber system for onSnapshot
const listeners = new Set<() => void>();

const registerListener = (callback: () => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

const triggerCallbacks = () => {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (err) {
      console.error("Error in mock subscriber callback:", err);
    }
  });
};

/* ================== APP & GENERAL ================== */
export const initializeApp = (_config: any) => ({ name: "[MockApp]" });

/* ================== AUTHENTICATION ================== */
class MockAuth {
  private authListeners = new Set<(user: any) => void>();
  private currentUserId: string | null = null;

  constructor() {
    this.currentUserId = localStorage.getItem('bethalhub_logged_user_id');
  }

  getCurrentUser() {
    if (!this.currentUserId) return null;
    const store = getStore();
    const mockUser = store.users[this.currentUserId];
    if (!mockUser) {
      this.currentUserId = null;
      localStorage.removeItem('bethalhub_logged_user_id');
      return null;
    }
    return {
      uid: mockUser.uid,
      email: mockUser.email,
      displayName: mockUser.displayName || 'Bethal Resident',
      photoURL: mockUser.photoURL || null,
      emailVerified: true,
      phoneNumber: mockUser.phoneNumber || '',
    };
  }

  registerAuthListener(callback: (user: any) => void) {
    this.authListeners.add(callback);
    // Invoke asynchronously
    setTimeout(() => {
      callback(this.getCurrentUser());
    }, 0);
    return () => {
      this.authListeners.delete(callback);
    };
  }

  notifyAuthListeners() {
    const user = this.getCurrentUser();
    this.authListeners.forEach(cb => {
      try {
        cb(user);
      } catch (err) {
        console.error("Auth listener error:", err);
      }
    });
  }

  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
    if (userId) {
      localStorage.setItem('bethalhub_logged_user_id', userId);
    } else {
      localStorage.removeItem('bethalhub_logged_user_id');
    }
    this.notifyAuthListeners();
  }
}

export class GoogleAuthProvider {
  static PROVIDER_ID = 'google.com';
}

export async function signInWithPopup(auth: any, provider: any) {
  const store = getStore();
  const email = "google-resident@gmail.com";
  
  let existingUser = Object.values(store.users).find(
    (u: any) => u.email.trim().toLowerCase() === email
  );

  if (!existingUser) {
    const uid = 'user_' + Math.random().toString(36).substring(2, 11);
    existingUser = {
      uid,
      email: email,
      displayName: "Sarah Google Resident",
      role: 'individual',
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    store.users[uid] = existingUser;
    saveStore(store);
  }

  authInstance.setCurrentUser(existingUser.uid);
  return {
    user: authInstance.getCurrentUser()
  };
}

const authInstance = new MockAuth();

export const getAuth = (_app?: any) => {
  return authInstance;
};

export function onAuthStateChanged(_auth: any, callback: (user: any) => void) {
  return authInstance.registerAuthListener(callback);
}

export async function signOut(_auth: any) {
  authInstance.setCurrentUser(null);
}

export async function signInWithEmailAndPassword(_auth: any, email: string, _password?: string) {
  const store = getStore();
  const trimmedEmail = email.trim().toLowerCase();
  
  const existingUser = Object.values(store.users).find(
    (u: any) => u.email.trim().toLowerCase() === trimmedEmail
  );

  if (!existingUser) {
    throw new Error("auth/user-not-found: No user found with this email. Please register first!");
  }

  authInstance.setCurrentUser(existingUser.uid);
  return {
    user: authInstance.getCurrentUser()
  };
}

export async function createUserWithEmailAndPassword(_auth: any, email: string, _password?: string) {
  const store = getStore();
  const trimmedEmail = email.trim().toLowerCase();

  const existingUser = Object.values(store.users).find(
    (u: any) => u.email.trim().toLowerCase() === trimmedEmail
  );

  if (existingUser) {
    throw new Error("auth/email-already-in-use: An account already exists with this email address.");
  }

  const uid = 'user_' + Math.random().toString(36).substring(2, 11);
  const newUser = {
    uid,
    email: trimmedEmail,
    displayName: email.split('@')[0],
    role: 'individual',
    isVerified: false,
    createdAt: new Date().toISOString()
  };

  store.users[uid] = newUser;
  saveStore(store);

  authInstance.setCurrentUser(uid);
  return {
    user: authInstance.getCurrentUser()
  };
}

export async function updateProfile(user: any, updates: { displayName?: string; photoURL?: string }) {
  if (!user) return;
  const store = getStore();
  const uid = user.uid;

  if (store.users[uid]) {
    if (updates.displayName !== undefined) store.users[uid].displayName = updates.displayName;
    if (updates.photoURL !== undefined) store.users[uid].photoURL = updates.photoURL;
    saveStore(store);
  }

  authInstance.notifyAuthListeners();
}

export async function sendPasswordResetEmail(_auth: any, email: string) {
  console.log("Mock password reset instructions sent to:", email);
  return { success: true };
}

export async function deleteUser(user: any) {
  if (!user) return;
  const store = getStore();
  const uid = user.uid;

  if (store.users[uid]) {
    delete store.users[uid];
    saveStore(store);
  }

  authInstance.setCurrentUser(null);
}

/* ================== FIRESTORE DATABASE ================== */
export const getFirestore = (_app?: any, _dbId?: string) => ({ type: 'firestore' });

export const doc = (_db: any, collectionOrPath: string, ...paths: string[]) => {
  let path = '';
  if (paths.length > 0) {
    path = `${collectionOrPath}/${paths.join('/')}`;
  } else {
    path = collectionOrPath;
  }
  const parts = path.split('/');
  return {
    type: 'doc',
    collectionName: parts[0],
    id: parts[1] || '',
    path
  };
};

export const collection = (_db: any, collectionName: string) => {
  return {
    type: 'collection',
    name: collectionName
  };
};

export const query = (target: any, ...constraints: any[]) => {
  return {
    type: 'query',
    target,
    constraints
  };
};

export const where = (field: string, op: string, value: any) => {
  return { type: 'where', field, op, value };
};

export const orderBy = (field: string, direction: 'asc' | 'desc' = 'asc') => {
  return { type: 'orderBy', field, direction };
};

export const limit = (value: number) => {
  return { type: 'limit', value };
};

function getSnapshot(ref: any) {
  const store = getStore();

  if (ref.type === 'doc') {
    const colName = ref.collectionName;
    const docId = ref.id;
    const item = store[colName]?.[docId] || null;

    return {
      id: docId,
      exists: () => !!item,
      data: () => item ? { ...item } : undefined,
      ref,
    };
  }

  let colName = '';
  let constraints: any[] = [];

  if (ref.type === 'collection') {
    colName = ref.name;
  } else if (ref.type === 'query') {
    colName = ref.target.name;
    constraints = ref.constraints || [];
  } else {
    throw new Error("Invalid query or collection ref passed to mock Firestore");
  }

  const collectionData = store[colName] || {};
  let list = Object.entries(collectionData).map(([id, val]) => ({
    id,
    ...val,
  }));

  // Apply filters ('where')
  for (const c of constraints) {
    if (c.type === 'where') {
      const { field, op, value } = c;
      list = list.filter(item => {
        const itemVal = item[field];
        if (op === '==' || op === '===') return itemVal === value;
        if (op === '!=') return itemVal !== value;
        if (op === '>') return itemVal > value;
        if (op === '<') return itemVal < value;
        if (op === '>=') return itemVal >= value;
        if (op === '<=') return itemVal <= value;
        return true;
      });
    }
  }

  // Apply ordering ('orderBy')
  const orderConstraint = constraints.find(c => c.type === 'orderBy');
  if (orderConstraint) {
    const { field, direction } = orderConstraint;
    list.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (valA && typeof valA === 'object' && valA.seconds !== undefined) {
        valA = valA.seconds;
      }
      if (valB && typeof valB === 'object' && valB.seconds !== undefined) {
        valB = valB.seconds;
      }

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Apply limit ('limit')
  const limitConstraint = constraints.find(c => c.type === 'limit');
  if (limitConstraint) {
    list = list.slice(0, limitConstraint.value);
  }

  const docs = list.map(item => ({
    id: item.id,
    exists: () => true,
    data: () => ({ ...item }),
  }));

  return {
    docs,
    size: docs.length,
    empty: docs.length === 0,
    forEach: (cb: (doc: any) => void) => {
      docs.forEach(cb);
    }
  };
}

export function onSnapshot(ref: any, onNext: (snapshot: any) => void, onError?: (err: any) => void) {
  const run = () => {
    try {
      const snap = getSnapshot(ref);
      onNext(snap);
    } catch (err) {
      if (onError) onError(err);
    }
  };

  run();
  return registerListener(run);
}

export const getDoc = async (docRef: any) => {
  return getSnapshot(docRef);
};

export const getDocs = async (ref: any) => {
  return getSnapshot(ref);
};

export const getDocFromServer = async (docRef: any) => {
  return getSnapshot(docRef);
};

export const addDoc = async (colRef: any, data: any) => {
  const store = getStore();
  const colName = colRef.name;
  const id = Math.random().toString(36).substring(2, 15);
  
  if (!store[colName]) {
    store[colName] = {};
  }

  const resolvedData = { ...data };
  Object.keys(resolvedData).forEach(key => {
    if (resolvedData[key]?._mockTimestamp) {
      resolvedData[key] = { seconds: Math.floor(Date.now() / 1000) };
    }
  });

  const newItem = {
    id,
    ...resolvedData,
  };
  
  if (!newItem.createdAt) {
    newItem.createdAt = new Date().toISOString();
  }

  store[colName][id] = newItem;
  saveStore(store);

  return {
    id,
    path: `${colName}/${id}`,
  };
};

export const setDoc = async (docRef: any, data: any, options?: any) => {
  const store = getStore();
  const colName = docRef.collectionName;
  const id = docRef.id;

  if (!store[colName]) {
    store[colName] = {};
  }

  const resolvedData = { ...data };
  Object.keys(resolvedData).forEach(key => {
    if (resolvedData[key]?._mockTimestamp) {
      resolvedData[key] = { seconds: Math.floor(Date.now() / 1000) };
    }
  });

  if (options?.merge && store[colName][id]) {
    store[colName][id] = {
      ...store[colName][id],
      ...resolvedData
    };
  } else {
    store[colName][id] = {
      id,
      ...resolvedData
    };
  }

  saveStore(store);
  return { success: true };
};

export const updateDoc = async (docRef: any, data: any) => {
  const store = getStore();
  const colName = docRef.collectionName;
  const id = docRef.id;

  if (store[colName] && store[colName][id]) {
    const resolvedData = { ...data };
    Object.keys(resolvedData).forEach(key => {
      if (resolvedData[key]?._mockTimestamp) {
        resolvedData[key] = { seconds: Math.floor(Date.now() / 1000) };
      }
    });

    store[colName][id] = {
      ...store[colName][id],
      ...resolvedData
    };
    saveStore(store);
  }
  return { success: true };
};

export const deleteDoc = async (docRef: any) => {
  const store = getStore();
  const colName = docRef.collectionName;
  const id = docRef.id;

  if (store[colName] && store[colName][id]) {
    delete store[colName][id];
    saveStore(store);
  }
  return { success: true };
};

export const serverTimestamp = () => {
  return { _mockTimestamp: true, seconds: Math.floor(Date.now() / 1000) };
};

/* ================== STORAGE ================== */
export const getStorage = (_app?: any) => ({ type: 'storage' });

export const ref = (storage: any, pathName: string) => {
  return { storage, pathName, url: '' };
};

export const uploadBytes = async (storageRef: any, file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      storageRef.url = reader.result as string;
      resolve({ ref: storageRef });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getDownloadURL = async (storageRef: any) => {
  return storageRef.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop';
};
