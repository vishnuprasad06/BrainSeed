import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Globe, Mail, Lock, Sprout } from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkUserProfileAndNavigate = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        navigate('/');
      } else {
        navigate('/setup');
      }
    } catch (err) {
      console.error("Error checking profile:", err);
      navigate('/setup'); // Fallback to setup if check fails
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await checkUserProfileAndNavigate(result.user.uid);
    } catch (error: any) {
      console.error("Popup Error:", error.code, error.message);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else if (error.code === 'auth/cancelled-inferior-auth-operation') {
        // Ignore, another login is starting
      } else {
        setError(error.message || 'Could not sign in with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signInAnonymously(auth);
      await checkUserProfileAndNavigate(result.user.uid);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      if (isForgotPassword) {
        // Handle password reset
        const { sendPasswordResetEmail } = await import('firebase/auth');
        await sendPasswordResetEmail(auth, email);
        setError('success:Password reset email sent! Check your inbox.');
        setIsForgotPassword(false);
      } else if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await checkUserProfileAndNavigate(result.user.uid);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await checkUserProfileAndNavigate(result.user.uid);
      }
    } catch (error: any) {
      console.error("Auth Error:", error.code, error.message);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setError('Invalid email or password. Please check your credentials or sign up if you are new.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in the Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try signing in instead!');
        setIsSignUp(false); // Nudge to sign in
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-natural-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full natural-card-heavy p-8 text-center space-y-8"
      >
        <div className="space-y-4">
          <div className="w-20 h-20 bg-natural-primary rounded-2xl mx-auto flex items-center justify-center shadow-lg transform -rotate-3 text-white">
            <Sprout size={48} />
          </div>
          <h1 className="text-4xl text-natural-primary tracking-tighter">BrainSeed</h1>
          <p className="text-natural-text/70 font-medium">Helping little minds grow!</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`${error.startsWith('success:') ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'} border-2 p-3 rounded-xl text-xs font-bold`}
            >
              {error.replace('success:', '')}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-text/30" />
            <input 
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-natural-bg border-2 border-natural-border p-3 pl-10 rounded-xl font-bold text-natural-text focus:outline-none focus:border-natural-primary"
            />
          </div>
          {!isForgotPassword && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-text/30" />
              <input 
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-natural-bg border-2 border-natural-border p-3 pl-10 rounded-xl font-bold text-natural-text focus:outline-none focus:border-natural-primary"
              />
            </div>
          )}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-natural-primary text-white p-3 rounded-xl font-black shadow-md hover:bg-natural-primary-dark transition-all disabled:opacity-50"
          >
            {loading ? 'Wait...' : (isForgotPassword ? 'Reset Password' : (isSignUp ? 'Sign Up' : 'Sign In'))}
          </button>
        </form>

        <div className="flex flex-col gap-2">
          {!isForgotPassword && !isSignUp && (
            <button 
              onClick={() => setIsForgotPassword(true)}
              className="text-[10px] font-bold text-natural-text/40 hover:text-natural-primary transition-colors"
            >
              Forgot your password?
            </button>
          )}
          {isForgotPassword && (
            <button 
              onClick={() => setIsForgotPassword(false)}
              className="text-[10px] font-bold text-natural-primary hover:underline"
            >
              Back to Login
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-natural-border" />
          <span className="text-[10px] font-black text-natural-text/30 uppercase tracking-widest">Or</span>
          <div className="h-px flex-1 bg-natural-border" />
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-natural-border p-4 rounded-2xl hover:bg-natural-muted transition-all font-bold text-natural-text"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <button 
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center gap-3 bg-natural-accent text-white p-4 rounded-2xl hover:bg-natural-accent-dark transition-all shadow-md font-bold"
          >
            <LogIn className="w-5 h-5" />
            Guest Login
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {!isForgotPassword && (
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-black text-natural-primary hover:underline uppercase tracking-wide"
            >
              {isSignUp ? 'Already have a seed? Sign In' : 'New adventurer? Create account'}
            </button>
          )}

          <div className="flex items-center justify-center gap-2 text-natural-text/50 text-sm font-bold uppercase tracking-widest">
            <Globe className="w-4 h-4" />
            <span>Kannada & English</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
