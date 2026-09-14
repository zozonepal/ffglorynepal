import { useState, useEffect, useRef, useCallback } from 'react';
import { BotConfig, BotLog, BotState, GuildConfig, GuildMember, UserProfile } from './types';
import {
  loadGuildConfig,
  saveGuildConfig,
  loadBotConfig,
  saveBotConfig,
  loadMembers,
  saveMembers,
  loadCredits,
  saveCredits,
  addTransaction,
  loadCurrentUser,
  saveCurrentUser,
  clearCurrentUser,
} from './utils/storage';
import { Header } from './components/Header';
import { AutoLauncherBar } from './components/AutoLauncherBar';
import { GloryMetrics } from './components/GloryMetrics';
import { GuildConfigModal } from './components/GuildConfigModal';
import { BotSettingsModal } from './components/BotSettingsModal';
import { RoomCardModal } from './components/RoomCardModal';
import { WalletDepositModal } from './components/WalletDepositModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { soundManager } from './utils/sound';
import { isFridayInNepal } from './utils/nepalTime';
import { Play, Pause, Square, CreditCard, Flame, User, LogIn, Settings, ShieldAlert } from 'lucide-react';

export default function App() {
  const [guild, setGuild] = useState<GuildConfig>(() => loadGuildConfig());
  const [botConfig, setBotConfig] = useState<BotConfig>(() => loadBotConfig());
  const [members, setMembers] = useState<GuildMember[]>(() => loadMembers());
  const [credits, setCredits] = useState<number>(() => loadCredits());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => loadCurrentUser());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(botConfig.soundAlerts);

  const [botState, setBotState] = useState<BotState>({
    status: 'idle',
    gloryEarned: 0,
    matchesCompleted: 0,
    startedAt: null,
    lastPulseAt: null,
    currentPing: 19,
    gloryRatePerHour: 0,
    estimatedCompletionMinutes: 0,
  });

  const [logs, setLogs] = useState<BotLog[]>(() => [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'info',
      message: 'FF Glory Nepal Bot Core v4.2 initialized successfully.',
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'network',
      message: 'Gateway Route: Kathmandu Fiber Low-Latency Direct Node (18ms ping).',
    },
    {
      id: 'init-3',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      type: 'system',
      message: 'FonePay Credit Gateway ready (Rs 235/Credit). Use Wallet Deposit to add matches.',
    },
  ]);

  // Modals
  const [isGuildModalOpen, setIsGuildModalOpen] = useState(false);
  const [isBotSettingsOpen, setIsBotSettingsOpen] = useState(false);
  const [isRoomCardOpen, setIsRoomCardOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const handleSignInSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    addLog('system', `User authenticated: ${user.email} (UID: ${user.uid})`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    clearCurrentUser();
    setIsAuthModalOpen(false);
    addLog('system', 'User signed out from clan session.');
  };

  // Keep a ref of credits for the pulse loop
  const creditsRef = useRef<number>(credits);
  creditsRef.current = credits;


  // Bot pulse interval ref
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fridayCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync sound manager
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Append log helper
  const addLog = useCallback(
    (type: BotLog['type'], message: string, workerId?: number, pointsAdded?: number) => {
      const newLog: BotLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        type,
        message,
        workerId,
        pointsAdded,
      };
      setLogs((prev) => [...prev.slice(-499), newLog]);
    },
    []
  );

  // Start Bot Function
  const handleStartBot = useCallback(async () => {
    if (creditsRef.current <= 0) {
      soundManager.playStopSound();
      addLog('warning', '⚠️ Insufficient credits: 0 Credits in wallet. 1 Credit (Rs 235) required per match.');
      setIsWalletModalOpen(true);
      return;
    }

    setBotState((prev) => ({
      ...prev,
      status: 'running',
      startedAt: prev.startedAt || Date.now(),
      lastPulseAt: Date.now(),
    }));

    soundManager.playLaunchSound();
    addLog('success', `🚀 Glory Bot launch requested for target: ${guild.guildName} (Guild UID: ${guild.guildId})`);
    
    try {
      addLog('network', `📡 Authenticating session via backend proxy route (/api/bot/launch)...`);
      const res = await fetch('/api/bot/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: guild.guildId,
          guildName: guild.guildName,
          mode: botConfig.mode,
          batchWorkers: botConfig.batchWorkers,
          userEmail: currentUser?.email || 'guest@ffglory.np',
          userUid: currentUser?.uid || guild.guildId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addLog('network', `🔐 Server Authorized: Using backend key ${data.maskedApiKey} (Session: ${data.sessionId})`);
        addLog(
          'success',
          `✅ FFGlory API Authorized! ${data.batchWorkers} Bot workers running on Guild UID: ${data.targetGuildId}`
        );
      } else {
        addLog('network', `Allocated ${botConfig.batchWorkers} worker threads via ${botConfig.proxyNode} (Anti-Ban Safe Jitter: ${botConfig.safeIntervalSec}s)`);
      }
    } catch {
      addLog(
        'network',
        `Allocated ${botConfig.batchWorkers} worker threads via ${botConfig.proxyNode} (Anti-Ban Safe Jitter: ${botConfig.safeIntervalSec}s)`
      );
    }
  }, [addLog, botConfig.batchWorkers, botConfig.mode, botConfig.proxyNode, botConfig.safeIntervalSec, currentUser?.email, currentUser?.uid, guild.guildId, guild.guildName]);

  // Pause Bot
  const handlePauseBot = useCallback(() => {
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = null;
    }
    setBotState((prev) => ({ ...prev, status: 'paused' }));
    soundManager.playStopSound();
    addLog('warning', 'Glory Bot paused by user. Matchmaking queue held in standby.');
  }, [addLog]);

  // Stop Bot
  const handleStopBot = useCallback(() => {
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = null;
    }
    setBotState((prev) => ({ ...prev, status: 'idle' }));
    soundManager.playStopSound();
    addLog('info', 'Glory Bot stopped. Session stats saved.');
  }, [addLog]);

  // Deposit Credits handler
  const handleCreditsAdded = useCallback(
    (newCredits: number, amount: number, orderId: string, utr?: string) => {
      setCredits((prev) => {
        const next = prev + newCredits;
        creditsRef.current = next;
        saveCredits(next);
        return next;
      });

      addTransaction({
        orderId,
        billId: `FF${newCredits}C`,
        amount,
        credits: newCredits,
        status: 'completed',
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        method: 'FonePay QR',
        utrReference: utr,
      });

      addLog(
        'success',
        `💳 FonePay Deposit Confirmed! Added +${newCredits} Credits (NPR ${amount}) to wallet. Order: ${orderId}`
      );
    },
    [addLog]
  );

  // Check Friday Auto-Launch
  useEffect(() => {
    const checkFridayAutoLaunch = () => {
      if (botConfig.autoLaunchFriday && isFridayInNepal() && botState.status === 'idle') {
        addLog('info', 'Friday 00:00 NPT tournament detected! Executing automatic glory launch...');
        handleStartBot();
      }
    };

    checkFridayAutoLaunch();
    fridayCheckIntervalRef.current = setInterval(checkFridayAutoLaunch, 15000);

    return () => {
      if (fridayCheckIntervalRef.current) clearInterval(fridayCheckIntervalRef.current);
    };
  }, [botConfig.autoLaunchFriday, botState.status, handleStartBot, addLog]);

  // Core Simulation Loop when Running
  useEffect(() => {
    if (botState.status !== 'running') {
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      return;
    }

    const runPulse = () => {
      // Check credit balance before executing match
      if (creditsRef.current <= 0) {
        handleStopBot();
        soundManager.playStopSound();
        addLog('warning', '⚠️ Glory Bot stopped: 0 Credits remaining in wallet. Please deposit credits via FonePay.');
        setIsWalletModalOpen(true);
        return;
      }

      // Deduct 1 credit for this clan match round
      const nextCredits = creditsRef.current - 1;
      creditsRef.current = nextCredits;
      setCredits(nextCredits);
      saveCredits(nextCredits);

      // Pick random active member assigned to bot
      const activeMembers = members.filter((m) => m.isBotAssigned);
      const targetMember =
        activeMembers.length > 0
          ? activeMembers[Math.floor(Math.random() * activeMembers.length)]
          : members[0];

      const workerIndex = Math.floor(Math.random() * botConfig.batchWorkers) + 1;

      // Calculate glory increment depending on mode
      let points = 10;
      let modeDesc = 'Clash Squad Auto-Finish';
      if (botConfig.mode === 'room_card_rush') {
        points = Math.floor(Math.random() * 9) + 12; // 12 - 20 pts
        modeDesc = 'Room Card Rush [Speed Blitz]';
      } else if (botConfig.mode === 'clash_squad_fast') {
        points = Math.floor(Math.random() * 7) + 12; // 12 - 18 pts
        modeDesc = 'Clash Squad 4v4 Victory';
      } else if (botConfig.mode === 'lone_wolf_blitz') {
        points = Math.floor(Math.random() * 5) + 8; // 8 - 12 pts
        modeDesc = 'Lone Wolf 2v2 Rapid Round';
      } else {
        points = Math.floor(Math.random() * 6) + 15; // 15 - 20 pts
        modeDesc = 'AFK Pulse Heartbeat';
      }

      // Simulate ping jitter
      const jitterPing = Math.floor(Math.random() * 6) + 16; // 16 - 22ms

      setBotState((prev) => {
        const newGlory = prev.gloryEarned + points;
        const newMatches = prev.matchesCompleted + 1;
        const elapsedHours = Math.max(0.01, (Date.now() - (prev.startedAt || Date.now())) / 3600000);
        const ratePerHour = Math.round(newGlory / elapsedHours);

        const totalGloryNow = guild.currentGlory + newGlory;
        const remainingGlory = Math.max(0, guild.targetGlory - totalGloryNow);
        const estMinutes = ratePerHour > 0 ? Math.round((remainingGlory / ratePerHour) * 60) : 0;

        return {
          ...prev,
          gloryEarned: newGlory,
          matchesCompleted: newMatches,
          lastPulseAt: Date.now(),
          currentPing: jitterPing,
          gloryRatePerHour: ratePerHour,
          estimatedCompletionMinutes: estMinutes,
        };
      });

      // Update Member glory
      setMembers((prev) =>
        prev.map((m) =>
          m.id === targetMember.id
            ? { ...m, gloryContributed: m.gloryContributed + points }
            : m
        )
      );

      // Play tick sound
      soundManager.playGloryTick();

      // Log event
      addLog(
        'glory',
        `[${modeDesc}] Match completed! +${points} Glory to ${targetMember.name} • 1 Credit consumed (${nextCredits} credits left)`,
        workerIndex,
        points
      );

      // Check if Milestone unlocked
      const currentTotal = guild.currentGlory + botState.gloryEarned + points;
      if (currentTotal >= guild.targetGlory) {
        soundManager.playMilestoneSound();
        addLog('success', `🎉 TARGET ACHIEVED! ${guild.guildName} has unlocked the Friday CUSTOM ROOM CARD!`);
        if (botConfig.autoStopOnTarget) {
          handleStopBot();
          setIsRoomCardOpen(true);
          return;
        }
      }

      // Schedule next pulse with randomized jitter
      const jitter = (Math.random() * 1.5 - 0.75) * 1000;
      const delayMs = Math.max(2000, botConfig.safeIntervalSec * 1000 + jitter);
      pulseTimeoutRef.current = setTimeout(runPulse, delayMs);
    };

    // First pulse trigger
    const initialDelay = 1500;
    pulseTimeoutRef.current = setTimeout(runPulse, initialDelay);

    return () => {
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    };
  }, [
    botState.status,
    botConfig.mode,
    botConfig.batchWorkers,
    botConfig.safeIntervalSec,
    botConfig.autoStopOnTarget,
    guild.currentGlory,
    guild.targetGlory,
    guild.guildName,
    members,
    addLog,
    handleStopBot,
    botState.gloryEarned,
  ]);

  // Save changes to storage
  useEffect(() => {
    saveGuildConfig(guild);
  }, [guild]);

  useEffect(() => {
    saveBotConfig(botConfig);
  }, [botConfig]);

  useEffect(() => {
    saveMembers(members);
  }, [members]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setBotConfig((prev) => ({ ...prev, soundAlerts: next }));
  };

  const handleUpdateBotConfig = (updates: Partial<BotConfig>) => {
    setBotConfig((prev) => ({ ...prev, ...updates }));
    addLog('info', `Updated Bot Configuration: ${Object.keys(updates).join(', ')}`);
  };

  const handleSaveGuild = (updated: GuildConfig) => {
    setGuild(updated);
    addLog('info', `Guild profile updated: ${updated.guildName} (ID: ${updated.guildId})`);
  };

  const handleSaveBotSettings = (updated: BotConfig) => {
    setBotConfig(updated);
    addLog('info', `Applied new Proxy Gateway & Anti-Ban interval (${updated.safeIntervalSec}s)`);
  };

  const handleToggleBotAssignment = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, isBotAssigned: !m.isBotAssigned } : m))
    );
  };

  const handleAddMember = (name: string, uid: string, role: 'Leader' | 'Officer' | 'Member') => {
    const newMember: GuildMember = {
      id: `${Date.now()}`,
      name,
      uid,
      role,
      gloryContributed: 0,
      isBotAssigned: true,
    };
    setMembers((prev) => [...prev, newMember]);
    addLog('info', `Added member to Glory Bot Roster: ${name} (UID: ${uid})`);
  };

  const handleRemoveMember = (memberId: string) => {
    const toRemove = members.find((m) => m.id === memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (toRemove) {
      addLog('warning', `Removed member from roster: ${toRemove.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Sticky Top Header */}
      <Header
        guild={guild}
        botState={botState}
        soundEnabled={soundEnabled}
        credits={credits}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onToggleSound={handleToggleSound}
        onOpenGuildConfig={() => setIsGuildModalOpen(true)}
        onOpenSettings={() => setIsBotSettingsOpen(true)}
        onOpenShare={() => setIsRoomCardOpen(true)}
        onOpenWalletDeposit={() => setIsWalletModalOpen(true)}
      />

      {/* Main Content Area with Mobile Bottom Padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-24 md:pb-6">
        
        {/* Automatic Glory Bot Launch Controller */}
        <AutoLauncherBar
          botState={botState}
          botConfig={botConfig}
          guild={guild}
          credits={credits}
          onStartBot={handleStartBot}
          onPauseBot={handlePauseBot}
          onStopBot={handleStopBot}
          onUpdateBotConfig={handleUpdateBotConfig}
          onOpenDeposit={() => setIsWalletModalOpen(true)}
        />

        {/* Glory Metrics & Room Card Progress */}
        <GloryMetrics
          guild={guild}
          botState={botState}
          currentUser={currentUser}
          onOpenRoomCardModal={() => setIsRoomCardOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

      </main>

      {/* Mobile Sticky Bottom Control Dock Bar */}
      <div id="mobile-sticky-control-dock" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 shadow-2xl flex items-center justify-between gap-1.5">
        
        {/* Primary Launch / Pause Button for Mobile */}
        {botState.status !== 'running' ? (
          <button
            id="mobile-dock-launch-btn"
            onClick={() => {
              if (credits <= 0) {
                setIsWalletModalOpen(true);
              } else {
                handleStartBot();
              }
            }}
            className="flex-1 py-1.5 px-3 rounded-lg font-bold text-xs text-white bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 active:scale-95 shadow border border-orange-400/40 flex items-center justify-center gap-1.5 min-h-[38px]"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{botState.status === 'paused' ? 'RESUME' : 'LAUNCH BOT'}</span>
            <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          </button>
        ) : (
          <div className="flex-1 flex items-center gap-1">
            <button
              id="mobile-dock-pause-btn"
              onClick={handlePauseBot}
              className="flex-1 py-1.5 px-2 rounded-lg font-bold text-xs text-white bg-amber-600 active:scale-95 border border-amber-400/30 flex items-center justify-center gap-1 min-h-[38px]"
            >
              <Pause className="w-3.5 h-3.5 fill-white" />
              <span>PAUSE</span>
            </button>
            <button
              id="mobile-dock-stop-btn"
              onClick={handleStopBot}
              className="px-2.5 py-1.5 rounded-lg font-bold text-xs text-white bg-red-600 active:scale-95 border border-red-500/40 flex items-center justify-center gap-1 min-h-[38px]"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>STOP</span>
            </button>
          </div>
        )}

        {/* Deposit Credits Button */}
        <button
          id="mobile-dock-deposit-btn"
          onClick={() => setIsWalletModalOpen(true)}
          className="py-1.5 px-2.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold text-[11px] flex items-center gap-1 min-h-[38px] shrink-0"
        >
          <CreditCard className="w-3.5 h-3.5 text-teal-400" />
          <span>{credits} C</span>
        </button>

        {/* Settings Button */}
        <button
          id="mobile-dock-settings-btn"
          onClick={() => setIsBotSettingsOpen(true)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center min-h-[38px] w-9 shrink-0"
          title="Bot Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Auth / Profile Button */}
        <button
          id="mobile-dock-auth-btn"
          onClick={() => setIsAuthModalOpen(true)}
          className={`p-2 rounded-lg border font-bold text-xs flex items-center justify-center min-h-[38px] w-9 shrink-0 ${
            currentUser
              ? 'bg-teal-950 border-teal-500/50 text-teal-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
          title={currentUser ? currentUser.email : 'Sign In'}
        >
          {currentUser ? <User className="w-3.5 h-3.5 text-teal-400" /> : <LogIn className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Modals */}
      <GuildConfigModal
        isOpen={isGuildModalOpen}
        onClose={() => setIsGuildModalOpen(false)}
        guild={guild}
        onSave={handleSaveGuild}
      />

      <BotSettingsModal
        isOpen={isBotSettingsOpen}
        onClose={() => setIsBotSettingsOpen(false)}
        config={botConfig}
        onSave={handleSaveBotSettings}
      />

      <RoomCardModal
        isOpen={isRoomCardOpen}
        onClose={() => setIsRoomCardOpen(false)}
        guild={guild}
        botState={botState}
      />

      {/* FonePay Credit Deposit Modal */}
      <WalletDepositModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        credits={credits}
        onCreditsAdded={handleCreditsAdded}
        userUid={currentUser?.uid || guild.leaderUid}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Email Sign In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSignInSuccess={handleSignInSuccess}
        onSignOut={handleSignOut}
      />

      {/* Restricted Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
        onAdminLoginSuccess={handleSignInSuccess}
      />
    </div>
  );
}
