import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Key, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface/30 border border-white/10 p-8 rounded-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 border border-accent/20">
            <Lock className="text-accent" size={32} />
          </div>
          <span className="font-tech text-[10px] tracking-[0.4em] text-accent uppercase mb-2 block">SECURE_ACCESS_REQUIRED</span>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">MANIFESTOR_LOGIN</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-tech uppercase p-4 mb-6 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="font-tech text-[10px] tracking-widest text-white/30 uppercase flex items-center gap-2">
              <Mail size={12} /> Email
            </label>
            <input 
              required
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black border border-white/10 p-4 font-black uppercase text-accent outline-none focus:border-accent transition-colors"
              placeholder="ADMIN@THEEUNITE.COM"
            />
          </div>

          <div className="space-y-2">
            <label className="font-tech text-[10px] tracking-widest text-white/30 uppercase flex items-center gap-2">
              <Key size={12} /> Password
            </label>
            <input 
              required
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black border border-white/10 p-4 font-black uppercase text-accent outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-accent text-black py-4 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
            INITIALIZE_SESSION
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
          <p className="text-center font-tech text-[8px] text-white/20 uppercase tracking-[0.3em]">Alternate Entry</p>
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 text-white py-4 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white/10 transition-colors disabled:opacity-50 text-[10px]"
          >
            GOOGLE_AUTH_PROTOCOL
          </button>
        </div>
      </motion.div>
      
      <p className="mt-8 font-tech text-[8px] text-white/20 uppercase tracking-[0.5em]">SYSTEM_VERSION_2.1 // AUTHORIZED_PERSONNEL_ONLY</p>
    </div>
  );
}
