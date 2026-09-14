import { BotConfig, BotState, GuildConfig } from '../types';
import { Play, Pause, Square, Zap, Flame, Cpu, CheckCircle2, CreditCard, AlertTriangle, PlusCircle } from 'lucide-react';
import { PRICE_PER_CREDIT } from '../utils/storage';

interface AutoLauncherBarProps {
  botState: BotState;
  botConfig: BotConfig;
  guild: GuildConfig;
  credits: number;
  onStartBot: () => void;
  onPauseBot: () => void;
  onStopBot: () => void;
  onUpdateBotConfig: (updates: Partial<BotConfig>) => void;
  onOpenDeposit: () => void;
}

export function AutoLauncherBar({
  botState,
  botConfig,
  guild,
  credits,
  onStartBot,
  onPauseBot,
  onStopBot,
  onUpdateBotConfig,
  onOpenDeposit,
}: AutoLauncherBarProps) {
  const isRunning = botState.status === 'running';
  const isPaused = botState.status === 'paused';
  const isTargetReached = (guild.currentGlory + botState.gloryEarned) >= guild.targetGlory;

  const handleLaunchClick = () => {
    if (credits <= 0) {
      onOpenDeposit();
      return;
    }
    onStartBot();
  };

  return (
    <div id="auto-launcher-bar" className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Background Glory Ambient Glow */}
      <div
        className={`absolute -right-24 -top-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isRunning
            ? 'bg-orange-500/20 animate-pulse'
            : isPaused
            ? 'bg-amber-500/10'
            : 'bg-slate-700/10'
        }`}
      />

      <div className="relative z-10 space-y-3.5 sm:space-y-4">
        {/* Top bar: Bot Status Pill & Credit Notice */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning
                  ? 'bg-emerald-400 animate-ping'
                  : isPaused
                  ? 'bg-amber-400'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bot Engine Status:
            </span>
            <span
              id="bot-status-text"
              className={`text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                isRunning
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isPaused
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {botState.status === 'running'
                ? 'ONLINE & AUTO-FARMING'
                : botState.status === 'paused'
                ? 'PAUSED (STANDBY)'
                : 'IDLE (READY TO LAUNCH)'}
            </span>

            {/* Credit Status Badge */}
            <div
              onClick={onOpenDeposit}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer border transition-all ${
                credits > 0
                  ? 'bg-teal-950/60 border-teal-500/40 text-teal-300 hover:border-teal-400'
                  : 'bg-red-950/40 border-red-500/40 text-red-300 hover:border-red-400'
              }`}
              title="Click to buy credits via FonePay"
            >
              <CreditCard className="w-3 h-3 text-teal-400" />
              <span>{credits} Credits Available</span>
            </div>

            {isTargetReached && (
              <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Target Met!
              </span>
            )}
          </div>
        </div>

        {/* Insufficient credits warning banner if credits === 0 */}
        {credits === 0 && !isRunning && (
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Credit System Active:</strong> 1 Credit (Rs {PRICE_PER_CREDIT}) per match. Wallet empty.
              </span>
            </div>
            <button
              onClick={onOpenDeposit}
              className="px-2.5 py-1 rounded bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold uppercase tracking-wide text-[10px] transition-colors shrink-0 cursor-pointer flex items-center gap-1"
            >
              <CreditCard className="w-3 h-3" />
              <span>Deposit via FonePay</span>
            </button>
          </div>
        )}

        {/* Center: Main Primary Launch & Control Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
          
          {/* Main Action Buttons (Left 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {!isRunning ? (
              <button
                id="launch-glory-bot-btn"
                onClick={handleLaunchClick}
                className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white active:scale-[0.98] shadow border flex items-center justify-center gap-2.5 transition-all cursor-pointer group ${
                  credits > 0
                    ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-500 hover:via-amber-500 hover:to-red-500 border-orange-400/40 shadow-orange-600/20'
                    : 'bg-gradient-to-r from-teal-700 via-slate-700 to-slate-800 hover:from-teal-600 hover:to-slate-700 border-teal-500/30'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <div className="text-left leading-tight">
                  <div className="font-mono tracking-tight">{isPaused ? 'RESUME GLORY BOT' : 'LAUNCH GLORY BOT'}</div>
                  <div className="text-[10px] font-normal text-slate-300">
                    {credits > 0 ? (
                      <span>1 credit/match ({credits} left)</span>
                    ) : (
                      <span className="text-teal-300">Deposit Credits (Rs {PRICE_PER_CREDIT}/credit)</span>
                    )}
                  </div>
                </div>
                <Flame className="w-4 h-4 text-yellow-300 animate-pulse ml-auto" />
              </button>
            ) : (
              <>
                <button
                  id="pause-bot-btn"
                  onClick={onPauseBot}
                  className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-amber-600 hover:bg-amber-500 active:scale-[0.98] border border-amber-400/30 flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>PAUSE BOT</span>
                </button>

                <button
                  id="stop-bot-btn"
                  onClick={onStopBot}
                  className="py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600/90 hover:bg-red-500 active:scale-[0.98] border border-red-500/40 flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>STOP</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Workers & Route Multiplier (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                Bot Worker Concurrency:
              </span>
              <span className="font-mono font-bold text-amber-400">
                {botConfig.batchWorkers} Bots ({botConfig.batchWorkers * 4} Virtual Slots)
              </span>
            </div>

            {/* Slider or Button Group */}
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 4, 8].map((count) => (
                <button
                  key={count}
                  id={`worker-count-btn-${count}`}
                  onClick={() => onUpdateBotConfig({ batchWorkers: count })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all ${
                    botConfig.batchWorkers === count
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {count}x Bot
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Node: <strong className="text-slate-200">{botConfig.proxyNode.split('(')[0]}</strong></span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Auto-Reconnect ON
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
