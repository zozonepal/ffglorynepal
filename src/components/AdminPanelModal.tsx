import { useState, useEffect, FormEvent } from 'react';
import { UserProfile, AdminTransactionRecord } from '../types';
import { fetchTransactionsFromFirestore, fetchUsersFromFirestore } from '../utils/firebase';
import {
  ShieldAlert,
  Lock,
  Mail,
  Key,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Receipt,
  RefreshCw,
  LogOut,
  X,
  AlertTriangle,
  ArrowUpRight,
  Database,
  Check,
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAdminLoginSuccess?: (user: UserProfile) => void;
}

export function AdminPanelModal({
  isOpen,
  onClose,
  currentUser,
  onAdminLoginSuccess,
}: AdminPanelModalProps) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Admin overview data
  const [transactions, setTransactions] = useState<AdminTransactionRecord[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'users'>('transactions');
  const [dataSource, setDataSource] = useState<'Firestore DB' | 'Server Live'>('Firestore DB');

  // Check if current logged in user is already the admin
  useEffect(() => {
    if (currentUser && currentUser.email === 'deepsonpokhrel12@gmail.com') {
      setIsAdminAuthenticated(true);
    }
  }, [currentUser]);

  // Load admin data
  const loadAdminData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch from Firestore (durable database storage)
      const firestoreTxs = await fetchTransactionsFromFirestore();
      const firestoreUsers = await fetchUsersFromFirestore();

      if (firestoreTxs.length > 0 || firestoreUsers.length > 0) {
        setTransactions(firestoreTxs as AdminTransactionRecord[]);
        setUsersList(firestoreUsers);
        setDataSource('Firestore DB');
      } else {
        // Fallback: fetch from server overview route
        const res = await fetch('/api/admin/overview', {
          headers: {
            'x-admin-email': 'deepsonpokhrel12@gmail.com',
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setTransactions(data.transactions || []);
            setUsersList(data.users || []);
            setDataSource('Server Live');
          }
        }
      }
    } catch (err: any) {
      console.error('[Admin Panel] Failed to load data:', err);
      setErrorMessage('Could not refresh records from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdminAuthenticated) {
      loadAdminData();
    }
  }, [isOpen, isAdminAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const cleanEmail = emailInput.trim().toLowerCase();
      let data: any = null;

      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: passwordInput,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        }
      } catch {
        // Backend API not reachable (e.g. static Vercel host)
      }

      if (data && data.success && data.user) {
        setIsAdminAuthenticated(true);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess(data.user);
        }
        loadAdminData();
        return;
      }

      if (data && !data.success && data.error) {
        throw new Error(data.error);
      }

      // Fallback local check for Vercel static deployments
      if (cleanEmail === 'deepsonpokhrel12@gmail.com' && passwordInput === 'deepsonhero2121') {
        const adminUser: UserProfile = {
          email: 'deepsonpokhrel12@gmail.com',
          uid: '9988776655',
          displayName: 'Admin Deepson',
          signedInAt: Date.now(),
          role: 'admin',
          isVerified: true,
        };
        setIsAdminAuthenticated(true);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess(adminUser);
        }
        loadAdminData();
        return;
      }

      throw new Error('Invalid admin credentials. Please enter the correct email and password.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Access denied. Incorrect email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutAdmin = () => {
    setIsAdminAuthenticated(false);
    setEmailInput('');
    setPasswordInput('');
  };

  const completedTransactions = transactions.filter((t) => t.status === 'completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalCreditsDistributed = completedTransactions.reduce((sum, t) => sum + (t.credits || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn min-h-screen">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-base font-black tracking-wide text-white uppercase font-mono truncate">
                  CLAN ADMIN PANEL
                </h2>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold uppercase shrink-0 hidden xs:inline-block">
                  RESTRICTED
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[150px] xs:max-w-[220px] sm:max-w-none">
                Authorized: <strong className="text-slate-200">deepsonpokhrel12@gmail.com</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdminAuthenticated && (
              <button
                onClick={handleSignOutAdmin}
                className="px-2 py-1 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 flex items-center gap-1 transition-colors"
                title="Log out of admin session"
              >
                <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
                <span className="hidden sm:inline">Exit Admin</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {!isAdminAuthenticated ? (
            /* ADMIN LOGIN FORM */
            <div className="max-w-md mx-auto py-8 space-y-6 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Admin Authentication</h3>
                <p className="text-xs text-slate-400">
                  Enter master administrator email & password to access user transactions & database audit logs.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-900/30 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="deepsonpokhrel12@gmail.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Admin Master Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying Credentials...' : 'Unlock Admin Panel'}</span>
                </button>
              </form>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Authorized Admin:</span>
                <code className="text-orange-400 font-mono">deepsonpokhrel12@gmail.com</code>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED ADMIN DASHBOARD */
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              
              {/* Stat Cards - 2x2 Grid on Mobile, 4-Cols on Desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Revenue</div>
                  <div className="text-base sm:text-2xl font-black font-mono text-teal-300 mt-0.5 sm:mt-1">
                    NPR {totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-teal-500 font-semibold mt-0.5">Verified FonePay</div>
                </div>

                <div className="p-2.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Confirmed Orders</div>
                  <div className="text-base sm:text-2xl font-black font-mono text-white mt-0.5 sm:mt-1">
                    {completedTransactions.length}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Total: {transactions.length}</div>
                </div>

                <div className="p-2.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Credits Issued</div>
                  <div className="text-base sm:text-2xl font-black font-mono text-amber-400 mt-0.5 sm:mt-1">
                    {totalCreditsDistributed}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-amber-500 font-semibold mt-0.5">Bot credit count</div>
                </div>

                <div className="p-2.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Registered Users</div>
                  <div className="text-base sm:text-2xl font-black font-mono text-purple-400 mt-0.5 sm:mt-1">
                    {usersList.length}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-purple-400 font-semibold mt-0.5">Firebase stored</div>
                </div>
              </div>

              {/* Navigation Tabs and Refresh Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className={`px-2.5 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      activeTab === 'transactions'
                        ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Transactions ({transactions.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-2.5 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      activeTab === 'users'
                        ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Users ({usersList.length})</span>
                  </button>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className="text-[10px] sm:text-[11px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-semibold">
                    <Database className="w-3 h-3" />
                    <span>{dataSource}</span>
                  </span>
                  <button
                    onClick={loadAdminData}
                    disabled={isLoading}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Reload from Firestore"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* TAB 1: TRANSACTIONS TABLE & MOBILE CARDS */}
              {activeTab === 'transactions' && (
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <Receipt className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-xs">No confirmed user transactions yet.</p>
                      <p className="text-[11px] text-slate-600">
                        When users click &quot;Confirm & Add Credits&quot; in the wallet, their order and receipt data will populate here.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Card List (Visible on < sm screens) */}
                      <div className="space-y-2 sm:hidden">
                        {transactions.map((tx) => (
                          <div key={tx.orderId} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                              <div className="font-mono text-xs font-bold text-white">
                                {tx.orderId}
                                <span className="block text-[9px] text-slate-500 font-normal">Bill: {tx.billId}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                tx.status === 'completed'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {tx.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 block uppercase">User Email</span>
                                <span className="text-slate-200 font-medium truncate block">{tx.userEmail || 'Guest'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block uppercase">Free Fire UID</span>
                                <span className="font-mono text-orange-400 font-bold block">{tx.userUid || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                              <div>
                                <span className="text-teal-400 font-mono font-bold">NPR {tx.amount}</span>
                                <span className="text-amber-400 font-mono font-bold ml-2">+{tx.credits} C</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {tx.utrReference || 'LIVE_API'}
                              </div>
                            </div>

                            <div className="text-[9px] text-slate-500 font-mono text-right pt-0.5">
                              {new Date(tx.verifiedAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View (Visible on >= sm screens) */}
                      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                            <tr>
                              <th className="py-3 px-4">Order ID & Bill</th>
                              <th className="py-3 px-4">User Email</th>
                              <th className="py-3 px-4">Free Fire UID</th>
                              <th className="py-3 px-4">Amount</th>
                              <th className="py-3 px-4">Credits</th>
                              <th className="py-3 px-4">UTR / Ref #</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80">
                            {transactions.map((tx) => (
                              <tr key={tx.orderId} className="hover:bg-slate-800/40 transition-colors">
                                <td className="py-3 px-4 font-mono font-semibold text-white">
                                  <div>{tx.orderId}</div>
                                  <div className="text-[10px] text-slate-500">Bill: {tx.billId}</div>
                                </td>
                                <td className="py-3 px-4 text-slate-300">
                                  <div className="font-semibold">{tx.userEmail || 'Guest'}</div>
                                </td>
                                <td className="py-3 px-4 font-mono text-orange-400">
                                  {tx.userUid || 'N/A'}
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-teal-400">
                                  NPR {tx.amount}
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-amber-400">
                                  +{tx.credits} C
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                                  {tx.utrReference || 'LIVE_API'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    tx.status === 'completed'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                                  {new Date(tx.verifiedAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 2: REGISTERED USERS */}
              {activeTab === 'users' && (
                <div className="space-y-3">
                  {usersList.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <Users className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-xs">No registered users in database.</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile User Card List (< sm screens) */}
                      <div className="space-y-2 sm:hidden">
                        {usersList.map((u, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-white">{u.displayName || 'Unnamed'}</span>
                                {u.email === 'deepsonpokhrel12@gmail.com' && (
                                  <span className="text-[8px] px-1 py-0.2 bg-orange-500/20 text-orange-400 rounded border border-orange-500/30 font-bold">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {u.role || 'user'}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">Email:</span>
                                <span className="text-slate-200 font-mono text-[11px] truncate max-w-[200px]">{u.email}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">Game UID:</span>
                                <span className="font-mono font-bold text-orange-400 text-[11px]">{u.uid}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px]">
                              <span className="text-emerald-400 flex items-center gap-0.5 font-semibold">
                                <Check className="w-3 h-3" /> Verified Account
                              </span>
                              <span className="text-slate-500">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View (>= sm screens) */}
                      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                            <tr>
                              <th className="py-3 px-4">Nickname</th>
                              <th className="py-3 px-4">Email</th>
                              <th className="py-3 px-4">Game UID</th>
                              <th className="py-3 px-4">Role</th>
                              <th className="py-3 px-4">Verification</th>
                              <th className="py-3 px-4">Created / Signed In</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80">
                            {usersList.map((u, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                                <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                                  <span>{u.displayName || 'Unnamed'}</span>
                                  {u.email === 'deepsonpokhrel12@gmail.com' && (
                                    <span className="text-[9px] px-1.5 py-0.2 bg-orange-500/20 text-orange-400 rounded border border-orange-500/30">
                                      ADMIN
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-slate-300 font-mono">
                                  {u.email}
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-orange-400">
                                  {u.uid}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    u.role === 'admin'
                                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}>
                                    {u.role || 'user'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                                    <Check className="w-3.5 h-3.5" /> Verified
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-400 text-[11px]">
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Session'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
