import { useState } from 'react';
import { BotState, GuildConfig } from '../types';
import { Award, X, Copy, Check, Sparkles, Share2 } from 'lucide-react';

interface RoomCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  guild: GuildConfig;
  botState: BotState;
}

export function RoomCardModal({ isOpen, onClose, guild, botState }: RoomCardModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalGlory = guild.currentGlory + botState.gloryEarned;
  const isUnlocked = totalGlory >= guild.targetGlory;

  const generateReportText = () => {
    return `🔥 FF GLORY NEPAL BOT - GUILD REPORT 🔥\n` +
      `🇳🇵 Guild: ${guild.guildName}\n` +
      `🆔 Guild UID: ${guild.guildId}\n` +
      `⭐ Guild Level: ${guild.guildLevel}\n` +
      `🏆 Glory Total: ${totalGlory}/${guild.targetGlory} pts (${Math.min(100, Math.round((totalGlory / guild.targetGlory) * 100))}%)\n` +
      `⚡ Matches Farmed: ${botState.matchesCompleted}\n` +
      `🎫 Custom Room Card: ${isUnlocked ? '✅ UNLOCKED & READY TO CLAIM' : '⏳ IN PROGRESS'}\n` +
      `🌐 Server Gateway: ${guild.serverRegion.toUpperCase()} (Low Ping)\n` +
      `🚀 Powered by FFGlory Nepal AutoBot`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div id="room-card-modal" className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <h3 className="text-base font-bold text-white">Guild Room Card Milestone</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room Card Visual Presentation */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-700 text-slate-950 shadow-xl border border-yellow-300/40 overflow-hidden">
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-yellow-200 font-bold uppercase">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span>Garena Official Reward</span>
          </div>

          <div className="space-y-2 text-white">
            <div className="text-3xl">🎫</div>
            <div className="text-xl font-black tracking-tight text-white drop-shadow">
              CUSTOM ROOM CARD (YELLOW)
            </div>
            <p className="text-xs text-yellow-100 font-medium leading-relaxed">
              Awarded to all Guild members upon reaching 1,800 Guild Tournament Glory on Friday!
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-yellow-400/30 text-xs text-white">
              <span>Required: <strong>1,800 Glory</strong></span>
              <span>
                Status:{' '}
                {isUnlocked ? (
                  <strong className="text-yellow-300 uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded">
                    UNLOCKED ✅
                  </strong>
                ) : (
                  <strong className="text-black bg-yellow-300/90 px-2 py-0.5 rounded font-mono">
                    {totalGlory}/1800 pts
                  </strong>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Share & Report generator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-orange-400" />
              Guild WhatsApp / Discord Share Text
            </span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto select-all">
            {generateReportText()}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            id="copy-guild-report-btn"
            onClick={handleCopyReport}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Guild Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
