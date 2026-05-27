import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  plan: 'free' | 'pro';
  planExpiresAt?: string;
  dailyLimit: number;
  currentDayUsage: number;
  totalUsage?: number;
  lastResetDate: string;
  isAdmin?: boolean;
  isBanned?: boolean;
}

export interface GlobalSettings {
  pricing: {
    monthly: number;
    yearly: number;
  };
  payment: {
    upiId: string;
    qrCodeImage?: string;
    instructions: string;
  };
  features: {
    compressPdf: 'free' | 'pro';
    compressImage: 'free' | 'pro';
    splitPdf: 'free' | 'pro';
    mergePdf: 'free' | 'pro';
    imageToPdf: 'free' | 'pro';
    rename: 'free' | 'pro';
    validateSignature: 'free' | 'pro';
    pdfToWord: 'free' | 'pro';
    unlockPdf: 'free' | 'pro';
    protectPdf: 'free' | 'pro';
    watermarkPdf: 'free' | 'pro';
  };
  freeDailyLimit: number;
  unregisteredDailyLimit?: number;
  aiProvider?: 'gemini' | 'groq' | 'openrouter';
  aiApiKey?: string;
  aiModel?: string;
  supportEmail?: string;
}

const defaultSettings: GlobalSettings = {
  pricing: { monthly: 149, yearly: 999 },
  payment: {
    upiId: '',
    instructions: 'Scan the QR code or use the UPI ID to make a payment. Provide your Transaction ID after taking a screenshot.',
  },
  features: {
    compressPdf: 'free',
    compressImage: 'free',
    splitPdf: 'free',
    mergePdf: 'free',
    imageToPdf: 'free',
    rename: 'free',
    validateSignature: 'free',
    pdfToWord: 'free',
    unlockPdf: 'free',
    protectPdf: 'free',
    watermarkPdf: 'free'
  },
  freeDailyLimit: 5,
  unregisteredDailyLimit: 2,
  aiProvider: 'gemini',
  aiApiKey: '',
  aiModel: 'gemini-2.5-flash',
  supportEmail: 'support@pdftoolbox.bd'
};

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  settings: GlobalSettings;
  loading: boolean;
  unregisteredUsage: number;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  incrementUsage: (action?: string, fileName?: string) => Promise<boolean>; // Returns true if usage allowed, false if limit reached
  updateProfileName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [unregisteredUsage, setUnregisteredUsage] = useState(0);

  useEffect(() => {
    // Load unregistered usage from localStorage on mount and check reset
    const today = new Date().toISOString().split('T')[0];
    const guestData = localStorage.getItem('guestUsage');
    if (guestData) {
      try {
        const parsed = JSON.parse(guestData);
        if (parsed.date !== today) {
          setUnregisteredUsage(0);
          localStorage.setItem('guestUsage', JSON.stringify({ date: today, usage: 0 }));
        } else {
          setUnregisteredUsage(parsed.usage || 0);
        }
      } catch (e) {
        setUnregisteredUsage(0);
      }
    } else {
      localStorage.setItem('guestUsage', JSON.stringify({ date: today, usage: 0 }));
    }
  }, []);

  useEffect(() => {
    // Listen to global settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSn) => {
      if (docSn.exists()) {
        const data = docSn.data();
        setSettings({ 
          ...defaultSettings, 
          ...data,
          features: {
            ...defaultSettings.features,
            ...(data.features || {})
          },
          payment: {
            ...defaultSettings.payment,
            ...(data.payment || {})
          },
          pricing: {
            ...defaultSettings.pricing,
            ...(data.pricing || {})
          }
        } as GlobalSettings);
      } else {
        // If it doesn't exist, try to initialize it (fails if not admin, but that's fine, we fallback to default)
        setDoc(doc(db, 'settings', 'global'), defaultSettings).catch(() => {});
      }
    });

    // Safety timeout to prevent infinite loading if Firebase hangs
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await fetchOrCreateProfile(user);
          setUser(user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Error fetching user profile during auth state change:", err);
        setUser(null);
        setProfile(null);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
      unsubSettings();
    };
  }, []);

  const fetchOrCreateProfile = async (user: FirebaseUser) => {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    const isAdmin = user.email === 'arnabsingharoy4@gmail.com';

    if (docSnap.exists()) {
      let data = docSnap.data() as UserProfile;
      if (isAdmin && !data.isAdmin) {
        data.isAdmin = true;
        await setDoc(docRef, { isAdmin: true }, { merge: true });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const lastResetStr = data.lastResetDate ? data.lastResetDate.split('T')[0] : '';
      
      let needsUpdate = false;
      let updates: any = {};

      if (lastResetStr !== today) {
        data.currentDayUsage = 0;
        data.lastResetDate = new Date().toISOString();
        updates.currentDayUsage = 0;
        updates.lastResetDate = data.lastResetDate;
        needsUpdate = true;
      }

      if (data.plan === 'pro' && data.planExpiresAt) {
        if (new Date(data.planExpiresAt) < new Date()) {
          data.plan = 'free';
          updates.plan = 'free';
          needsUpdate = true;
          // You might want to trigger a toast here, but we can do that in the component
        }
      }

      if (needsUpdate) {
        await setDoc(docRef, updates, { merge: true });
      }
      setProfile(data);
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        plan: 'free',
        dailyLimit: 5,
        currentDayUsage: 0,
        totalUsage: 0,
        lastResetDate: new Date().toISOString(),
        isAdmin: isAdmin,
        isBanned: false
      };
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const updateProfileName = async (name: string) => {
    if (!user || !profile) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { displayName: name }, { merge: true });
      
      const { updateProfile: updateFirebaseAuthProfile } = await import('firebase/auth');
      await updateFirebaseAuthProfile(user, { displayName: name });
      
      setProfile(prev => prev ? { ...prev, displayName: name } : null);
    } catch (error) {
      console.error('Error updating name:', error);
      throw error;
    }
  };

  const incrementUsage = async (action?: string, fileName?: string): Promise<boolean> => {
    if (!user) {
      // Unregistered user logic
      const limit = settings?.unregisteredDailyLimit ?? 2;
      if (unregisteredUsage >= limit) {
        return false;
      }
      const newUsage = unregisteredUsage + 1;
      setUnregisteredUsage(newUsage);
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('guestUsage', JSON.stringify({ date: today, usage: newUsage }));
      return true;
    }

    if (!profile) return false;
    
    let newCurrentDayUsage = profile.currentDayUsage;
    if (profile.plan !== 'pro') {
      if (profile.currentDayUsage >= (settings?.freeDailyLimit || profile.dailyLimit || 5)) return false;
      newCurrentDayUsage = profile.currentDayUsage + 1;
    }

    const docRef = doc(db, 'users', user.uid);
    const newTotalUsage = (profile.totalUsage || 0) + 1;
    
    try {
      await setDoc(docRef, { 
        currentDayUsage: newCurrentDayUsage,
        totalUsage: newTotalUsage
      }, { merge: true });
      
      setProfile(prev => prev ? { 
        ...prev, 
        currentDayUsage: newCurrentDayUsage,
        totalUsage: newTotalUsage
      } : null);

      if (action && fileName) {
        await addDoc(collection(db, 'history'), {
          userId: user.uid,
          action,
          fileName,
          timestamp: new Date().toISOString()
        });
      }

      return true;
    } catch (e) {
      console.error('Failed to increment usage:', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, settings, loading, unregisteredUsage, signInWithGoogle, logout, incrementUsage, updateProfileName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

