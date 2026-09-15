import { GuildConfig, BotConfig, GuildMember, Milestone, TransactionRecord, CreditPack, UserProfile } from '../types';

export const PRICE_PER_CREDIT = 235;

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'p1', credits: 1, title: '1 Credit', subtitle: '1 Bot Squad (8-Hour Shift)', price: 235, popular: false },
  { id: 'p3', credits: 3, title: '3 Credits', subtitle: '3 Bot Squads (8-Hour Shift)', price: 705, popular: false },
  { id: 'p5', credits: 5, title: '5 Credits', subtitle: '5 Bot Squads (8-Hour Shift)', price: 1175, popular: true },
  { id: 'p10', credits: 10, title: '10 Credits', subtitle: '10 Bot Squads (8-Hour Shift)', price: 2350, popular: false },
  { id: 'p20', credits: 20, title: '20 Credits', subtitle: '20 Bot Squads (8-Hour Shift)', price: 4700, popular: false },
  { id: 'custom', credits: 0, title: 'Custom Pack', subtitle: 'Any quantity of credits', price: 0, popular: false },
];

export const DEFAULT_GUILD: GuildConfig = {
  guildId: '3019842109',
  guildName: 'NEPAL ELITE eSPORTS',
  leaderUid: '2198031254',
  serverRegion: 'nepal-ktm',
  guildLevel: 4,
  currentGlory: 0,
  targetGlory: 1800,
  membersCount: 35,
};

export const DEFAULT_BOT_CONFIG: BotConfig = {
  mode: 'room_card_rush',
  autoLaunchFriday: true,
  autoStopOnTarget: true,
  safeIntervalSec: 4,
  proxyNode: 'Kathmandu Fiber Direct (18ms)',
  batchWorkers: 4,
  autoReconnect: true,
  stealthAntiBan: true,
  soundAlerts: true,
  autoPushNotify: true,
};

export const DEFAULT_MEMBERS: GuildMember[] = [
  { id: '1', name: '🇳🇵_Gorkhali_Leader', uid: '2198031254', role: 'Leader', gloryContributed: 240, isBotAssigned: true },
  { id: '2', name: 'NP_Aayush_OP', uid: '1849204812', role: 'Officer', gloryContributed: 190, isBotAssigned: true },
  { id: '3', name: 'Bir_Gorkha_99', uid: '2049102941', role: 'Officer', gloryContributed: 160, isBotAssigned: true },
  { id: '4', name: 'Ktm_Sniper_7', uid: '3948201948', role: 'Member', gloryContributed: 130, isBotAssigned: true },
  { id: '5', name: 'Pokhara_Ninja', uid: '1749203912', role: 'Member', gloryContributed: 110, isBotAssigned: false },
  { id: '6', name: 'FF_Nepal_BotWorker#1', uid: '5928104921', role: 'Member', gloryContributed: 90, isBotAssigned: true },
];

export const GLORY_MILESTONES: Milestone[] = [
  { points: 400, title: 'Tier 1 Box', reward: 'Gold Royale Voucher x3', icon: '🎁' },
  { points: 800, title: 'Tier 2 Box', reward: 'Universal Fragments x1000', icon: '📦' },
  { points: 1200, title: 'Tier 3 Box', reward: 'Diamond Royale Voucher x2', icon: '💎' },
  { points: 1800, title: 'Guild Champion', reward: 'CUSTOM ROOM CARD (Yellow)', icon: '🎫' },
];

const STORAGE_KEY_GUILD = 'ffglory_nepal_guild';
const STORAGE_KEY_BOT = 'ffglory_nepal_bot_cfg';
const STORAGE_KEY_MEMBERS = 'ffglory_nepal_members';
const STORAGE_KEY_CREDITS = 'ffglory_nepal_credits';
const STORAGE_KEY_TRANSACTIONS = 'ffglory_nepal_transactions';

export function loadCredits(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CREDITS);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch {
    // fallback
  }
  return 0; // Starts at 0 credits as shown in user screenshot
}

export function saveCredits(credits: number) {
  try {
    localStorage.setItem(STORAGE_KEY_CREDITS, Math.max(0, credits).toString());
  } catch {
    // ignore
  }
}

export function loadTransactions(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveTransactions(txs: TransactionRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(txs));
  } catch {
    // ignore
  }
}

export function addTransaction(tx: TransactionRecord) {
  const current = loadTransactions();
  const updated = [tx, ...current].slice(0, 50); // Keep latest 50
  saveTransactions(updated);
  return updated;
}


export function loadGuildConfig(): GuildConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUILD);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.currentGlory === 920) {
        parsed.currentGlory = 0; // Clear legacy hardcoded 920 fake glory
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_GUILD;
}

export function saveGuildConfig(config: GuildConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_GUILD, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function loadBotConfig(): BotConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOT);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_BOT_CONFIG;
}

export function saveBotConfig(config: BotConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_BOT, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function loadMembers(): GuildMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_MEMBERS;
}

export function saveMembers(members: GuildMember[]) {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  } catch {
    // ignore
  }
}

const STORAGE_KEY_USER = 'ffglory_nepal_current_user';

export function loadCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
}

export function saveCurrentUser(user: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch {
    // ignore
  }
}
