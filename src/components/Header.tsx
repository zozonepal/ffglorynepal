import { useState, useEffect } from 'react';
import { BotState, GuildConfig, UserProfile } from '../types';
import { formatNepalTime } from '../utils/nepalTime';
import { PRICE_PER_CREDIT } from '../utils/storage';
import { Flame, ShieldCheck, CreditCard, PlusCircle, User, LogIn, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  guild: GuildConfig;
  botState: BotState;
  soundEnabled: boolean;
  credits: number;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onToggleSound: () => void;
  onOpenGuildConfig: () => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onOpenWalletDeposit: () => void;
}

export function Header({
  guild,
  botState,
  soundEnabled,
  credits,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
  onToggleSound,
  onOpenGuildConfig,
  onOpenSettings,
  onOpenShare,
  onOpenWalletDeposit,
}: HeaderProps) {
  const [nepalTimeStr, setNepalTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      setNepalTimeStr(formatNepalTime());
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header id="app-header" className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 shadow-md backdrop-blur-md overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-3 w-full">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          
          {/* Brand Logo & Guild Badge */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-md shadow-orange-500/20 text-white font-black text-xs sm:text-lg border border-amber-400/30 shrink-0">
              <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-200 animate-pulse" />
              <span className="absolute -top-1 -right-1 text-[8px] sm:text-xs px-0.5 rounded bg-red-600 text-white font-bold">
                🇳🇵
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h1 className="text-xs sm:text-lg font-black tracking-tight text-white flex items-center gap-0.5 font-mono truncate">
                  <span>FFGLORY</span>
                  <span className="text-orange-500">NEPAL</span>
                </h1>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1 py-0.2 rounded-full hidden sm:inline-block shrink-0">
                  v4.2 AutoBot
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] sm:text-xs text-slate-400">
                <button
                  id="header-guild-name-btn"
                  onClick={onOpenGuildConfig}
                  className="hover:text-amber-400 transition-colors flex items-center gap-0.5 font-medium underline-offset-2 hover:underline truncate max-w-[75px] xs:max-w-[100px] sm:max-w-none"
                  title="Click to edit guild configuration"
                >
                  <span className="text-slate-200 font-semibold truncate">{guild.guildName}</span>
                </button>
                <span className="text-slate-600 hidden xs:inline">•</span>
                <span className="text-emerald-400 hidden xs:flex items-center gap-0.5 shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5" /> Anti-Ban
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Wallet & User Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Live Wallet Balance */}
            <div
              id="header-wallet-pill"
              className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg bg-slate-950 border border-teal-500/50 shadow-sm shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <div className="text-xs font-mono font-black text-amber-300 whitespace-nowrap">
                {credits} C
              </div>

              <button
                id="header-deposit-btn"
                onClick={onOpenWalletDeposit}
                className="ml-0.5 px-1.5 py-0.5 rounded bg-teal-400 hover:bg-teal-300 active:bg-teal-200 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-0.5 transition-all shadow cursor-pointer active:scale-95 shrink-0"
                title="Deposit Credits via FonePay"
              >
                <PlusCircle className="w-3 h-3 text-slate-950 shrink-0" />
                <span className="hidden sm:inline">Deposit</span>
              </button>
            </div>

            {/* Admin Panel Button */}
            <button
              id="header-admin-btn"
              onClick={onOpenAdmin}
              className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border text-[10px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 ${
                currentUser?.role === 'admin' || currentUser?.email === 'deepsonpokhrel12@gmail.com'
                  ? 'bg-orange-500 text-slate-950 border-orange-400 font-black'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-500/40'
              }`}
              title="Open Admin Panel"
            >
              <ShieldAlert className="w-3 h-3 text-orange-400 shrink-0" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            {/* Email Sign In / User Profile Button */}
            <button
              id="header-auth-btn"
              onClick={onOpenAuth}
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg border text-[10px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 ${
                currentUser
                  ? 'bg-teal-950/60 border-teal-500/50 text-teal-300 hover:bg-teal-900/60'
                  : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
              title={currentUser ? `Signed in as ${currentUser.email}` : 'Sign in with your email'}
            >
              <User className="w-3 h-3 text-teal-400 shrink-0" />
              <span className="truncate max-w-[55px] xs:max-w-[80px] sm:max-w-none">
                {currentUser ? currentUser.displayName.split(' ')[0] : 'Sign In'}
              </span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
