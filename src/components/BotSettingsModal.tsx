import { useState, FormEvent } from 'react';
import { BotConfig } from '../types';
import { Settings, X, Shield, Cpu, Wifi, Radio, Bell } from 'lucide-react';

interface BotSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BotConfig;
  onSave: (updated: BotConfig) => void;
}

export function BotSettingsModal({ isOpen, onClose, config, onSave }: BotSettingsModalProps) {
  const [formData, setFormData] = useState<BotConfig>({ ...config });

  if (!isOpen) return null;

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const proxyOptions = [
    'Kathmandu Fiber Direct (18ms)',
    'Pokhara FastNode Route (23ms)',
    'Biratnagar East Hub (26ms)',
    'WorldLink Gaming Priority (19ms)',
    'Subisu Dedicated Peer (21ms)',
    'South Asia Direct Edge (32ms)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div id="bot-settings-modal" className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">Bot Engine & Proxy Settings</h3>
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
          {/* Proxy Node selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              Nepal Gaming Gateway / Proxy Node
            </label>
            <select
              id="proxy-node-select"
              value={formData.proxyNode}
              onChange={(e) => setFormData({ ...formData, proxyNode: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {proxyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Safe Anti-Ban Jitter Interval */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-orange-400" />
                Anti-Ban Pulse Interval (Humanized Jitter)
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {formData.safeIntervalSec}s ({formData.safeIntervalSec - 1}s - {formData.safeIntervalSec + 2}s randomized)
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={8}
              step={1}
              value={formData.safeIntervalSec}
              onChange={(e) => setFormData({ ...formData, safeIntervalSec: Number(e.target.value) })}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Randomizes delay between match simulations to match genuine mobile Free Fire client handshakes.
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Auto-Reconnect on Timeout</div>
                  <div className="text-[10px] text-slate-400">Restarts matchmaking queue automatically if Nepal ISP lags</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoReconnect}
                onChange={(e) => setFormData({ ...formData, autoReconnect: e.target.checked })}
                className="w-4 h-4 text-orange-500 rounded bg-slate-900 border-slate-700 accent-orange-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Audio Synthesizer Alerts</div>
                  <div className="text-[10px] text-slate-400">Chime on Glory milestones & 1800 Room Card completion</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.soundAlerts}
                onChange={(e) => setFormData({ ...formData, soundAlerts: e.target.checked })}
                className="w-4 h-4 text-orange-500 rounded bg-slate-900 border-slate-700 accent-orange-500 cursor-pointer"
              />
            </label>
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
              id="save-bot-settings-btn"
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors shadow-md"
            >
              Apply Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
