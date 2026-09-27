import React, { useState } from 'react';
import {
  Bot,
  CheckCircle,
  Key,
  Lock,
  LogIn,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDemoLogin: (operatorInfo: UserProfile) => void;
  onGoogleLogin: () => void;
  signingIn?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onDemoLogin,
  onGoogleLogin,
  signingIn = false,
}) => {
  const [operatorId, setOperatorId] = useState<string>('OP-402');
  const [password, setPassword] = useState<string>('••••••••');
  const [role, setRole] = useState<'Field Supervisor' | 'Limnology Specialist' | 'Autonomous Ops Lead'>('Field Supervisor');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const demoUser: UserProfile = {
      uid: `operator-${operatorId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      email: `${operatorId.toLowerCase().replace(/[^a-z0-9]/g, '')}@trashtrekker.eco`,
      displayName: `Operator #${operatorId.replace(/[^0-9]/g, '') || '402'} (${role})`,
      photoURL: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`,
      role: 'admin',
    };
    onDemoLogin(demoUser);
    onClose();
  };

  const handleQuickSupervisorLogin = () => {
    const demoUser: UserProfile = {
      uid: 'operator-402',
      email: 'pedomatrix@gmail.com',
      displayName: 'Operator #402',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: 'admin',
    };
    onDemoLogin(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-7 shadow-2xl shadow-cyan-950/40 text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block">
              TrashTrekker Security Portal
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Operator Authentication
            </h2>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">
              Operator ID / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                placeholder="e.g. OP-402 or supervisor@trashtrekker.eco"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">
              Access Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono">
              Operational Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="Field Supervisor">Field Supervisor (Full Swarm Tele-Op)</option>
              <option value="Limnology Specialist">Limnology Specialist (Water Quality & WQMS)</option>
              <option value="Autonomous Ops Lead">Autonomous Ops Lead (Mission Planning)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Authenticate Operator Session</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono">
            <span className="bg-slate-950 px-2 text-slate-400">Quick Access</span>
          </div>
        </div>

        {/* Demo Login Button */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleQuickSupervisorLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Demo Login as Field Supervisor (Operator #402)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onGoogleLogin();
              onClose();
            }}
            disabled={signingIn}
            className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-medium transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google Sign-In</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center font-mono mt-4">
          Autonomous Eco-Swarm Telemetry Relay • WBPCB Node #WB-772
        </p>
      </div>
    </div>
  );
};
