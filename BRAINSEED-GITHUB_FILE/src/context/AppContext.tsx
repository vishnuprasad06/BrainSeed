import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  isLoggedIn: boolean;
  logout: () => void;
  loading: boolean;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  useEffect(() => {
    // Try to load cached user from localStorage for instant boot
    const cachedUser = localStorage.getItem('brainseed_cached_user');
    if (cachedUser) {
      try {
        setUserState(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem('brainseed_cached_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            let profile = userSnap.data() as UserProfile;
            
            // Streak logic
            const todayVal = new Date();
            const today = todayVal.toISOString().split('T')[0];
            const yesterdayVal = new Date(todayVal);
            yesterdayVal.setDate(yesterdayVal.getDate() - 1);
            const yesterday = yesterdayVal.toISOString().split('T')[0];

            let updated = false;

            if (profile.lastLoginDate !== today) {
              if (profile.lastLoginDate === yesterday) {
                profile.currentStreak = (profile.currentStreak || 0) + 1;
              } else {
                profile.currentStreak = 1;
              }
              profile.lastLoginDate = today;
              updated = true;
            }

            if (updated) {
               await setDoc(userRef, profile, { merge: true });
            }

            setUserState(profile);
            localStorage.setItem('brainseed_cached_user', JSON.stringify(profile));
          } else {
            // No profile yet
            setUserState(null);
            localStorage.removeItem('brainseed_cached_user');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserState(null);
        localStorage.removeItem('brainseed_cached_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setUser = async (profile: UserProfile) => {
    setUserState(profile);
    localStorage.setItem('brainseed_cached_user', JSON.stringify(profile));
    if (firebaseUser) {
      await setDoc(doc(db, 'users', firebaseUser.uid), profile, { merge: true });
    }
  };

  const logout = async () => {
    setUserState(null);
    localStorage.removeItem('brainseed_cached_user');
    await auth.signOut();
  };

  return (
    <AppContext.Provider value={{ user, setUser, isLoggedIn: !!firebaseUser, logout, loading, isVoiceEnabled, setIsVoiceEnabled }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
