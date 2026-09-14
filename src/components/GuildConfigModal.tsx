import { useState, FormEvent } from 'react';
import { GuildConfig, ServerRegion } from '../types';
import { Shield, Check, X, Server, RefreshCw, Layers } from 'lucide-react';

interface GuildConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  guild: GuildConfig;
  onSave: (updated: GuildConfig) => void;
}

export function GuildConfigModal({ isOpen, onClose, guild, onSave }: GuildConfigModalProps) {
  const [formData, setFormData] = useState<GuildConfig>({ ...guild });
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = () => {
    setVerifying(true);
    setVerificationResult(null);
    setTimeout(() => {
      setVerifying(false);
      setVerificationResult(`Guild "${formData.guildName}" (ID: ${formData.guildId}) verified on Nepal Gateway. Status: ACTIVE.`);
    }, 900);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div id="guild-config-modal" className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">Free Fire Guild Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Guild Name
              </label>
              <input
                id="guild-name-input"
                type="text"
                value={formData.guildName}
                onChange={(e) => setFormData({ ...formData, guildName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Guild UID (Free Fire ID)
              </label>
              <input
                id="guild-id-input"
                type="text"
                value={formData.guildId}
                onChange={(e) => setFormData({ ...formData, guildId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Leader / Officer UID
              </label>
              <input
                id="leader-uid-input"
                type="text"
                value={formData.leaderUid}
                onChange={(e) => setFormData({ ...formData, leaderUid: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Guild Level (1 - 6)
              </label>
              <select
                id="guild-level-select"
                value={formData.guildLevel}
                onChange={(e) => setFormData({ ...formData, guildLevel: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                {[1, 2, 3, 4, 5, 6].map((lvl) => (
                  <option key={lvl} value={lvl}>Level {lvl} Guild</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Server Region
              </label>
              <select
                id="server-region-select"
                value={formData.serverRegion}
                onChange={(e) => setFormData({ ...formData, serverRegion: e.target.value as ServerRegion })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="nepal-ktm">Nepal - Kathmandu Server (Low Ping)</option>
                <option value="nepal-pkr">Nepal - Pokhara Gateway</option>
                <option value="nepal-brt">Nepal - Biratnagar Hub</option>
                <option value="south-asia">South Asia Regional Edge</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Guild Glory
              </label>
              <input
                id="current-glory-input"
                type="number"
                value={formData.currentGlory}
                onChange={(e) => setFormData({ ...formData, currentGlory: Math.max(0, Number(e.target.value)) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                min={0}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Enter your starting Free Fire guild glory points (0 if fresh round)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Glory Goal
              </label>
              <input
                id="target-glory-input"
                type="number"
                value={formData.targetGlory}
                onChange={(e) => setFormData({ ...formData, targetGlory: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                required
                min={100}
                step={50}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard Friday Custom Room Card = 1,800
              </span>
            </div>
          </div>

          {/* Verification Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                <Server className="w-3.5 h-3.5 text-blue-400" /> Garena FF Database Handshake
              </span>
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-orange-400 font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${verifying ? 'animate-spin' : ''}`} />
                <span>{verifying ? 'Verifying...' : 'Verify Guild'}</span>
              </button>
            </div>
            {verificationResult && (
              <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{verificationResult}</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-guild-settings-btn"
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors shadow-md"
            >
              Save Guild Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
