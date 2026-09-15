export type ServerRegion = 'nepal-ktm' | 'nepal-pkr' | 'nepal-brt' | 'south-asia';

export type BotMode = 'room_card_rush' | 'clash_squad_fast' | 'lone_wolf_blitz' | 'afk_glory_pulse';

export type BotStatus = 'idle' | 'running' | 'paused' | 'scheduled' | 'completed';

export interface GuildConfig {
  guildId: string;
  guildName: string;
  leaderUid: string;
  serverRegion: ServerRegion;
  guildLevel: number;
  currentGlory: number;
  targetGlory: number;
  membersCount: number;
}

export interface BotConfig {
  mode: BotMode;
  autoLaunchFriday: boolean;
  autoStopOnTarget: boolean;
  safeIntervalSec: number;
  proxyNode: string;
  batchWorkers: number;
  autoReconnect: boolean;
  stealthAntiBan: boolean;
  soundAlerts: boolean;
  autoPushNotify: boolean;
  shiftDurationHours?: number; // 8 Hours shift per bot launch
}

export interface BotState {
  status: BotStatus;
  gloryEarned: number;
  matchesCompleted: number;
  startedAt: number | null;
  lastPulseAt: number | null;
  currentPing: number;
  gloryRatePerHour: number;
  estimatedCompletionMinutes: number;
  shiftDurationHours?: number;
  shiftTimeRemainingSec?: number;
  apiKeyMasked?: string;
}

export interface BotLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'glory' | 'warning' | 'network';
  message: string;
  workerId?: number;
  pointsAdded?: number;
}

export interface GuildMember {
  id: string;
  name: string;
  uid: string;
  role: 'Leader' | 'Officer' | 'Member';
  gloryContributed: number;
  isBotAssigned: boolean;
}

export interface Milestone {
  points: number;
  title: string;
  reward: string;
  icon: string;
}

export interface CreditPack {
  id: string;
  credits: number;
  title: string;
  subtitle: string;
  price: number;
  popular?: boolean;
}

export interface TransactionRecord {
  orderId: string;
  billId: string;
  amount: number;
  credits: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  method: 'FonePay QR';
  utrReference?: string;
}

export interface FonePayQrResponse {
  success: boolean;
  orderId: string;
  amount: number;
  credits: number;
  qrImageUrl: string;
  billId: string;
  terminalName: string;
  location: string;
  fonepayPanNumber: string;
  expiresAt: number;
  error?: string;
}

export interface UserProfile {
  email: string;
  uid: string;
  displayName: string;
  signedInAt: number;
  role?: 'admin' | 'user';
  isVerified?: boolean;
}

export interface AdminTransactionRecord {
  orderId: string;
  billId: string;
  userEmail: string;
  userUid: string;
  amount: number;
  credits: number;
  utrReference?: string;
  status: 'completed' | 'pending' | 'rejected';
  verifiedAt: string;
}

