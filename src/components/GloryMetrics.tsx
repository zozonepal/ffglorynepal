import { BotState, GuildConfig, UserProfile } from '../types';
import { GLORY_MILESTONES } from '../utils/storage';
import { Award, Flame, CheckCircle, TrendingUp, Gamepad2, Hourglass, Sparkles, User, Mail, Hash, Shield, LogIn } from 'lucide-react';

interface GloryMetricsProps {
  guild: GuildConfig;
  botState: BotState;
  currentUser?: UserProfile | null;
  onOpenRoomCardModal: () => void;
  onOpenAuth?: () => void;
}

export function GloryMetrics({
  guild,
  botState,
  currentUser,
  onOpenRoomCardModal,
  onOpenAuth,
}: GloryMetricsProps) {
  const totalGlory = guild.currentGlory + botState.gloryEarned;
  const target = guild.targetGlory || 1800;
  const percentage = Math.min(100, Math.round((totalGlory / target) * 100));
  const remaining = Math.max(0, target - totalGlory);
  const isTargetAchieved = totalGlory >= target;

  return (
    <div id="glory-metrics-panel" className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-lg space-y-4 sm:space-y-5">
      
      {/* Real Active User Identity & Account Details Card */}
      <div id="user-glory-identity-card" className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {currentUser ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-sm shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-white truncate">{currentUser.displayName}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                  currentUser.role === 'admin'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {currentUser.role === 'admin' ? 'Admin' : 'Verified'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400 mt-0.5 font-mono min-w-0">
                <span className="truncate max-w-[180px] xs:max-w-[220px] sm:max-w-none">{currentUser.email}</span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="shrink-0">UID: <strong className="text-orange-400">{currentUser.uid}</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-300">Exact User Unlinked</div>
              <p className="text-[10px] text-slate-400">
                Sign in to link Free Fire game UID &amp; track glory yield.
              </p>
            </div>
          </div>
        )}

        {/* User Glory Points Contribution */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          <div className="text-left sm:text-right">
            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              Exact User Yield
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-amber-400">
              +{botState.gloryEarned} Points
            </div>
          </div>

          {!currentUser && onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 sm:py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-[10px] sm:text-xs transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Banner: Big Glory Counter & Room Card Celebration */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Guild Glory Progress
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
              Lvl {guild.guildLevel}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span id="total-glory-number" className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white flex items-center gap-1.5">
              <span>{totalGlory.toLocaleString()}</span>
              <span className="text-slate-500 text-base font-normal">/ {target.toLocaleString()}</span>
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              {percentage}%
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-0.5">
            {isTargetAchieved ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Target reached! Room Card sent to mail.
              </span>
            ) : (
              <span>
                Need <strong className="text-orange-400 font-mono">{remaining} Glory</strong> more for custom room card.
              </span>
            )}
          </p>
        </div>

        {/* Claim Room Card / Share Button */}
        <div className="flex items-center gap-2">
          <button
            id="room-card-milestone-btn"
            onClick={onOpenRoomCardModal}
            className={`px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isTargetAchieved
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 hover:brightness-110 animate-bounce'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-yellow-300" />
            <span>{isTargetAchieved ? 'CLAIM ROOM CARD 🏷️' : 'MILESTONES'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Progress Bar with Milestones */}
      <div className="space-y-1.5">
        <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            id="glory-progress-bar"
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-500 shadow-sm shadow-orange-500/50"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Milestone Steps Bar */}
        <div className="grid grid-cols-4 gap-1 pt-0.5">
          {GLORY_MILESTONES.map((m) => {
            const reached = totalGlory >= m.points;
            return (
              <div
                key={m.points}
                id={`milestone-step-${m.points}`}
                className={`p-1.5 sm:p-2 rounded-lg border text-center transition-all ${
                  reached
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-0.5 mb-0.5">
                  <span className="text-[10px]">{m.icon}</span>
                  <span className="font-mono font-bold text-[11px] text-white">{m.points}</span>
                </div>
                <div className="text-[9px] truncate font-medium text-slate-400">{m.reward}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Session Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* Session Glory */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
            <span>Session Glory</span>
            <Flame className="w-3 h-3 text-orange-400" />
          </div>
          <div id="session-glory-value" className="text-base sm:text-lg font-mono font-bold text-amber-400">
            +{botState.gloryEarned}
          </div>
          <div className="text-[9px] text-slate-400">Bot yield</div>
        </div>

        {/* Glory Velocity */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
            <span>Velocity</span>
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          </div>
          <div id="glory-rate-value" className="text-base sm:text-lg font-mono font-bold text-emerald-400">
            {botState.status === 'running' ? `~${botState.gloryRatePerHour}/hr` : '0/hr'}
          </div>
          <div className="text-[9px] text-slate-400">Glory rate</div>
        </div>

        {/* Matches Completed */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
            <span>Matches</span>
            <Gamepad2 className="w-3 h-3 text-blue-400" />
          </div>
          <div id="matches-completed-value" className="text-base sm:text-lg font-mono font-bold text-blue-400">
            {botState.matchesCompleted}
          </div>
          <div className="text-[9px] text-slate-400">Rounds done</div>
        </div>

        {/* Estimated Completion Time */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
            <span>ETA Target</span>
            <Hourglass className="w-3 h-3 text-purple-400" />
          </div>
          <div id="eta-completion-value" className="text-base sm:text-lg font-mono font-bold text-purple-400">
            {isTargetAchieved
              ? 'DONE'
              : botState.status === 'running'
              ? `${botState.estimatedCompletionMinutes}m`
              : '--'}
          </div>
          <div className="text-[9px] text-slate-400">Remaining time</div>
        </div>
      </div>
    </div>
  );
}
