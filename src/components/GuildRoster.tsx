import { useState, FormEvent } from 'react';
import { GuildMember } from '../types';
import { Users, UserPlus, Shield, Bot, Check, Trash2, Award } from 'lucide-react';

interface GuildRosterProps {
  members: GuildMember[];
  onToggleBotAssignment: (memberId: string) => void;
  onAddMember: (name: string, uid: string, role: 'Leader' | 'Officer' | 'Member') => void;
  onRemoveMember: (memberId: string) => void;
}

export function GuildRoster({
  members,
  onToggleBotAssignment,
  onAddMember,
  onRemoveMember,
}: GuildRosterProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [uid, setUid] = useState('');
  const [role, setRole] = useState<'Leader' | 'Officer' | 'Member'>('Member');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !uid.trim()) return;
    onAddMember(name.trim(), uid.trim(), role);
    setName('');
    setUid('');
    setShowAddForm(false);
  };

  const activeBotMembersCount = members.filter((m) => m.isBotAssigned).length;
  const totalRosterGlory = members.reduce((sum, m) => sum + m.gloryContributed, 0);

  return (
    <div id="guild-roster-container" className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-lg space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-400" />
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Guild Roster &amp; Slots</span>
              <span className="text-[10px] sm:text-xs bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
                {members.length} Members
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400">
              {activeBotMembersCount} accounts assigned to automated bot queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="add-member-toggle-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Player'}</span>
          </button>
        </div>
      </div>

      {/* Add Member Quick Inline Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="text-xs font-bold text-slate-200">Register New Guild Member / Bot Worker</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">IGN / Gamer Tag</label>
              <input
                id="new-member-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 🇳🇵_Gorkha_Sniper"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Free Fire Player UID</label>
              <input
                id="new-member-uid-input"
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="e.g. 2910482910"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Role</label>
              <select
                id="new-member-role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as 'Leader' | 'Officer' | 'Member')}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Member">Member</option>
                <option value="Officer">Officer</option>
                <option value="Leader">Leader</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              id="confirm-add-member-btn"
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-sm"
            >
              Save to Roster
            </button>
          </div>
        </form>
      )}

      {/* Members Grid / List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
        {members.map((member) => (
          <div
            key={member.id}
            id={`member-card-${member.id}`}
            className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
              member.isBotAssigned
                ? 'bg-slate-950/80 border-slate-700/80 shadow-sm'
                : 'bg-slate-950/40 border-slate-800/60 opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white truncate">{member.name}</span>
                  {member.role === 'Leader' && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                      LEADER
                    </span>
                  )}
                  {member.role === 'Officer' && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold shrink-0">
                      OFFICER
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  UID: {member.uid}
                </div>
              </div>

              {/* Bot Queue Assigned Toggle */}
              <button
                id={`toggle-bot-member-${member.id}`}
                onClick={() => onToggleBotAssignment(member.id)}
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  member.isBotAssigned
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={member.isBotAssigned ? 'Bot queue enabled for this UID' : 'Click to enable bot queue'}
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="text-[10px]">{member.isBotAssigned ? 'AUTO' : 'OFF'}</span>
              </button>
            </div>

            {/* Bottom: Glory points contributed */}
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[11px]">
              <div className="flex items-center gap-1 text-slate-400">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Contributed:</span>
                <span className="font-mono font-bold text-amber-300">+{member.gloryContributed} pts</span>
              </div>

              {members.length > 1 && (
                <button
                  id={`remove-member-btn-${member.id}`}
                  onClick={() => onRemoveMember(member.id)}
                  className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors"
                  title="Remove from roster"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>Roster Glory Sum: <strong className="text-amber-400 font-mono">+{totalRosterGlory} pts</strong></span>
        <span>Every Friday: Max 80-100 glory cap per member per match pulse</span>
      </div>
    </div>
  );
}
