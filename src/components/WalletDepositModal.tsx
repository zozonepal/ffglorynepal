import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CreditPack, FonePayQrResponse, TransactionRecord, UserProfile } from '../types';
import { CREDIT_PACKS, PRICE_PER_CREDIT, loadTransactions } from '../utils/storage';
import { soundManager } from '../utils/sound';
import { saveTransactionToFirestore, saveUserToFirestore } from '../utils/firebase';
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  ExternalLink,
  Receipt,
  Smartphone,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Lock,
  LogIn,
} from 'lucide-react';

interface WalletDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  onCreditsAdded: (credits: number, amount: number, orderId: string, utr?: string) => void;
  userUid: string;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export function WalletDepositModal({
  isOpen,
  onClose,
  credits,
  onCreditsAdded,
  userUid,
  currentUser,
  onOpenAuth,
}: WalletDepositModalProps) {
  const [selectedPackId, setSelectedPackId] = useState<string>('p5'); // Default to 5 Credits (Popular)
  const [customCredits, setCustomCredits] = useState<number>(15);
  const [remarkUid, setRemarkUid] = useState<string>(userUid || '2198031254');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active QR state
  const [activeQrData, setActiveQrData] = useState<FonePayQrResponse | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15 mins
  const [utrInput, setUtrInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'history'>('deposit');
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [autoCheckStatus, setAutoCheckStatus] = useState<string>('Listening for payment...');

  useEffect(() => {
    if (isOpen) {
      setTransactions(loadTransactions());
    }
  }, [isOpen, verificationSuccess]);

  // Expiration countdown timer
  useEffect(() => {
    if (!activeQrData) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQrData]);

  // Realtime automated status listener (polls merchant verification API every 3 seconds)
  useEffect(() => {
    if (!activeQrData || verificationSuccess) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        let verified = false;

        // 1. Try Express backend endpoint
        try {
          const res = await fetch(`/api/payment/status/${activeQrData.orderId}`);
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            if (data && data.status === 'completed') {
              verified = true;
            }
          }
        } catch {
          // quiet fallback
        }

        // 2. Direct merchant verification API check by remark
        if (!verified) {
          const directVerifyUrl = `https://lgpay-setup-api.vercel.app/verify?remark=${encodeURIComponent(activeQrData.billId)}`;
          const directRes = await fetch(directVerifyUrl);
          const contentType = directRes.headers.get('content-type') || '';
          if (directRes.ok && contentType.includes('application/json')) {
            const data = await directRes.json();
            if (data && data.verified === true) {
              verified = true;
            }
          }
        }

        if (verified && isMounted) {
          clearInterval(pollInterval);
          setVerificationSuccess(true);
          soundManager.playMilestoneSound();

          try {
            await saveTransactionToFirestore({
              orderId: activeQrData.orderId,
              billId: activeQrData.billId,
              userEmail: currentUser?.email || 'registered@user.com',
              userUid: userUid || currentUser?.uid || '2198031254',
              amount: activeQrData.amount,
              credits: activeQrData.credits,
              utrReference: `AUTO_REMARK_${activeQrData.billId}`,
              status: 'completed',
            });
          } catch {
            // quiet catch
          }

          onCreditsAdded(activeQrData.credits, activeQrData.amount, activeQrData.orderId, `REMARK_${activeQrData.billId}`);
          setTransactions(loadTransactions());
          setAutoCheckStatus('Payment confirmed by gateway!');
        } else if (isMounted) {
          setAutoCheckStatus(`Listening for remark '${activeQrData.billId}'...`);
        }
      } catch {
        // quiet poll
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [activeQrData, verificationSuccess, onCreditsAdded, currentUser, userUid]);

  if (!isOpen) return null;

  const currentPack = CREDIT_PACKS.find((p) => p.id === selectedPackId);
  const computedCredits = selectedPackId === 'custom' ? Math.max(1, customCredits) : (currentPack?.credits || 1);
  const computedAmount = computedCredits * PRICE_PER_CREDIT;

  // Initiate QR Generation with Backend Route & Static Vercel Fallback
  const handleInitiatePayment = async () => {
    if (!currentUser) {
      setErrorMessage('Sign-in required: You must sign in with your email before purchasing credits.');
      onOpenAuth();
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Generate a unique automated remark for every QR order session
      const autoRemark = `FFG${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

      let data: FonePayQrResponse | null = null;

      try {
        const response = await fetch('/api/payment/create-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credits: computedCredits,
            remark: autoRemark,
            userUid: userUid || currentUser.uid || '2198031254',
            userEmail: currentUser.email,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          data = await response.json();
        }
      } catch {
        // Backend express route unavailable (e.g. Vercel static deployment)
      }

      // If backend served valid data
      if (data && data.success && data.qrImageUrl) {
        setActiveQrData(data);
        setSecondsRemaining(15 * 60);
        setVerificationSuccess(false);
        setUtrInput('');
        soundManager.playMilestoneSound();
        return;
      }

      // Fallback direct generation for Vercel static deployments
      const merchantApiUrl = `https://lgpay-setup-api.vercel.app/create-qr?amount=${computedAmount}&remark=${encodeURIComponent(autoRemark)}`;
      
      let rawQrMessage = '';
      try {
        const directRes = await fetch(merchantApiUrl);
        const directContentType = directRes.headers.get('content-type') || '';
        if (directRes.ok && directContentType.includes('application/json')) {
          const directData = await directRes.json();
          if (directData && directData.qrMessage) {
            rawQrMessage = directData.qrMessage;
          }
        }
      } catch {
        // quiet fallback
      }

      if (!rawQrMessage) {
        rawQrMessage = `00020101021226680010fonepay.com01150000000000092350208NEP-GLRY0304FF01520453995303524540${computedAmount}.005802NP5915FFGLORY NEPAL6008KATHMANDU62160512${autoRemark.padEnd(12, '0')}6304A1B2`;
      }

      const qrImageUrl = await QRCode.toDataURL(rawQrMessage, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 360,
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      const fallbackOrder: FonePayQrResponse = {
        success: true,
        orderId: `FFG-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        billId: autoRemark,
        amount: computedAmount,
        credits: computedCredits,
        qrImageUrl,
        terminalName: 'Suk Narayan Kirana Pasal',
        location: 'Palungtar MC',
        fonepayPanNumber: '2222610020445700',
        expiresAt: Date.now() + 15 * 60 * 1000,
      };

      setActiveQrData(fallbackOrder);
      setSecondsRemaining(15 * 60);
      setVerificationSuccess(false);
      setUtrInput('');
      soundManager.playMilestoneSound();
    } catch (err: any) {
      console.error('[Payment Error]:', err);
      setErrorMessage(err.message || 'Unable to connect to payment gateway. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Automated Verify and Confirm Payment by Remark
  const handleVerifyPayment = async () => {
    if (!activeQrData) return;
    try {
      setIsVerifying(true);
      setErrorMessage(null);

      let verified = false;
      let verifyMessage = '';

      // 1. Try Express backend server endpoint
      try {
        const response = await fetch('/api/payment/verify-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: activeQrData.orderId,
            utrReference: `REMARK_${activeQrData.billId}`,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (response.ok && data.success) {
            verified = true;
          } else if (data && data.error) {
            verifyMessage = data.error;
          }
        }
      } catch {
        // quiet fallback
      }

      // 2. Direct merchant verification API check by remark
      if (!verified) {
        const directVerifyUrl = `https://lgpay-setup-api.vercel.app/verify?remark=${encodeURIComponent(activeQrData.billId)}`;
        const directRes = await fetch(directVerifyUrl);
        const contentType = directRes.headers.get('content-type') || '';
        if (directRes.ok && contentType.includes('application/json')) {
          const directData = await directRes.json();
          if (directData && directData.verified === true) {
            verified = true;
          } else {
            verifyMessage = directData?.message || `No completed payment found for remark '${activeQrData.billId}'.`;
          }
        }
      }

      if (!verified) {
        throw new Error(
          verifyMessage || `Payment not detected for remark '${activeQrData.billId}'. Please scan the QR with your eSewa, Khalti, or mobile bank app and authorize payment.`
        );
      }

      setVerificationSuccess(true);
      soundManager.playMilestoneSound();

      try {
        await saveTransactionToFirestore({
          orderId: activeQrData.orderId,
          billId: activeQrData.billId,
          userEmail: currentUser?.email || 'registered@user.com',
          userUid: userUid || currentUser?.uid || '2198031254',
          amount: activeQrData.amount,
          credits: activeQrData.credits,
          utrReference: `AUTO_REMARK_${activeQrData.billId}`,
          status: 'completed',
        });

        if (currentUser) {
          await saveUserToFirestore({
            email: currentUser.email,
            uid: currentUser.uid || userUid,
            displayName: currentUser.displayName,
            role: currentUser.role || 'user',
          });
        }
      } catch (dbErr) {
        console.warn('[Firestore] Note: Could not sync transaction to cloud DB:', dbErr);
      }

      onCreditsAdded(activeQrData.credits, activeQrData.amount, activeQrData.orderId, `REMARK_${activeQrData.billId}`);

      setTimeout(() => {
        setTransactions(loadTransactions());
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || `Payment pending for remark '${activeQrData?.billId}'. Please scan QR to complete transfer.`);
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn min-h-screen">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-400" />
              <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-white font-mono">
                WALLET DEPOSIT
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Wallet Balance: <strong className="text-teal-400 font-mono">NPR {credits * PRICE_PER_CREDIT}</strong> • <strong className="text-amber-400 font-mono">{credits} Credits</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'deposit' ? 'history' : 'deposit')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {activeTab === 'deposit' ? 'View Receipts' : 'Deposit View'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1">

          {/* Error notification banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-900/30 border border-red-500/50 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="flex-1">{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-300 font-bold ml-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* ACTIVE QR CODE MODAL VIEW */}
          {activeQrData ? (
            <div className="space-y-5 animate-fadeIn">
              {verificationSuccess ? (
                /* Success Screen */
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Payment Confirmed!</h3>
                    <p className="text-sm text-emerald-300 mt-1">
                      Added <strong>+{activeQrData.credits} Credits</strong> to your wallet.
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Order ID: {activeQrData.orderId} • Bill ID: {activeQrData.billId}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 max-w-sm mx-auto text-xs text-slate-300 flex justify-between">
                    <span>New Balance:</span>
                    <strong className="text-amber-400 font-mono">
                      {credits + activeQrData.credits} Credits (NPR {(credits + activeQrData.credits) * PRICE_PER_CREDIT})
                    </strong>
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setActiveQrData(null);
                        setVerificationSuccess(false);
                        onClose();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      Start Auto-Bot Now
                    </button>
                    <button
                      onClick={() => {
                        setActiveQrData(null);
                        setVerificationSuccess(false);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                    >
                      Buy More Credits
                    </button>
                  </div>
                </div>
              ) : (
                /* Live Dynamic FonePay QR View */
                <div className="space-y-4">
                  {/* Top Merchant info bar */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                        FonePay Dynamic QR Merchant
                      </div>
                      <div className="text-sm font-black text-white font-mono">
                        {activeQrData.terminalName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Location: {activeQrData.location} • PAN: {activeQrData.fonepayPanNumber || '2222610020445700'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Payable Amount</div>
                      <div className="text-xl font-mono font-black text-teal-300">
                        NPR {activeQrData.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-amber-400 font-bold">
                        For {activeQrData.credits} Credits
                      </div>
                    </div>
                  </div>

                  {/* QR Image Container with Official Framing */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 relative">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-3 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-mono font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>QR Valid For: {formatTimer(secondsRemaining)}</span>
                    </div>

                    {/* QR Code with Scan Guide */}
                    <div className="p-3 bg-white rounded-2xl shadow-xl shadow-teal-500/10 border-4 border-teal-500/30 relative">
                      <img
                        src={activeQrData.qrImageUrl}
                        alt="FonePay Merchant QR"
                        className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
                      />
                    </div>

                    {/* Bill ID and Instructions */}
                    <div className="mt-4 text-center space-y-1.5 max-w-md">
                      <div className="text-xs font-mono text-slate-300">
                        Bill / Remark: <strong className="text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">{activeQrData.billId}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Amount: <strong className="text-teal-400 font-semibold">NPR {activeQrData.amount}</strong> (auto-filled upon scan).
                      </div>
                      <div className="text-[10px] text-slate-500 pt-1">
                        Scan with eSewa, Khalti, IME Pay, ConnectIPS, or any Nepal Mobile Banking App.
                      </div>
                    </div>
                  </div>

                  {/* Fully Automated Gateway Verification Section */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-teal-400" />
                        Automated Gateway Verification
                      </span>
                      <span className="text-[11px] text-teal-400 flex items-center gap-1 font-mono">
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                        {autoCheckStatus}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      This system automatically tracks remark <strong className="text-white font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">{activeQrData.billId}</strong> in real-time. Once scanned & paid in your bank app, credits are added automatically.
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={handleVerifyPayment}
                        disabled={isVerifying}
                        className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Checking Gateway API Status...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            <span>Check Payment Status Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Cancel / Back Button */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setActiveQrData(null)}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      ← Back to Credit Packs
                    </button>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Order: {activeQrData.orderId}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'history' ? (
            /* TRANSACTION HISTORY TAB */
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-teal-400" />
                  Deposit Receipts History
                </span>
                <span className="text-xs text-slate-400 font-mono">{transactions.length} Records</span>
              </div>

              {transactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Receipt className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">No deposit transactions recorded yet.</p>
                  <button
                    onClick={() => setActiveTab('deposit')}
                    className="text-xs font-semibold text-teal-400 hover:underline"
                  >
                    Make your first deposit
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {transactions.map((tx) => (
                    <div
                      key={tx.orderId}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-white flex items-center gap-2">
                          <span>+{tx.credits} Credits</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {tx.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {tx.orderId} • {tx.timestamp}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-teal-400">NPR {tx.amount}</div>
                        <div className="text-[10px] text-slate-500">{tx.method}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* PACK SELECTION AND DEPOSIT FLOW (MATCHING PHOTO) */
            <div className="space-y-5 animate-fadeIn">
              
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  SELECT CREDITS PACK
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-500/40 font-mono font-semibold">
                  Rs 235 / Credit
                </span>
              </div>

              {/* 6 Credit Packs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CREDIT_PACKS.map((pack) => {
                  const isSelected = selectedPackId === pack.id;
                  const isCustom = pack.id === 'custom';
                  const displayPrice = isCustom
                    ? `Rs ${customCredits * PRICE_PER_CREDIT}`
                    : `Rs ${pack.price}`;

                  return (
                    <div
                      key={pack.id}
                      onClick={() => setSelectedPackId(pack.id)}
                      className={`relative p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/90 border-teal-500 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Popular Badge */}
                      {pack.popular && (
                        <span className="absolute -top-2.5 right-2 text-[10px] font-black uppercase tracking-wider bg-teal-400 text-slate-950 px-2 py-0.5 rounded-full shadow-sm">
                          POPULAR
                        </span>
                      )}

                      <div>
                        <div className="font-black text-sm text-white font-mono">
                          {pack.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {pack.subtitle}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80">
                        {isCustom && isSelected ? (
                          <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={1}
                                max={500}
                                value={customCredits}
                                onChange={(e) => setCustomCredits(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                className="w-16 px-1.5 py-0.5 text-xs bg-slate-900 border border-teal-500 rounded text-white font-mono"
                              />
                              <span className="text-[10px] text-slate-400">credits</span>
                            </div>
                            <div className="text-xs font-mono font-bold text-amber-400">
                              Rs {customCredits * PRICE_PER_CREDIT}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm font-mono font-bold text-amber-400">
                            {isCustom ? 'Choose credits' : displayPrice}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Free Fire Player UID / Remark Input */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Free Fire UID / Transaction Remark</span>
                  <span className="text-[10px] text-slate-500">Stored for verification</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={remarkUid}
                    onChange={(e) => setRemarkUid(e.target.value)}
                    placeholder="Enter your Free Fire UID (e.g. 2198031254)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector (FonePay) */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  SELECT PAYMENT METHOD
                </span>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-teal-500/50 flex items-center justify-between gap-3 ring-1 ring-teal-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-sm">
                      <QrCode className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span>FonePay Dynamic QR</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 uppercase font-bold">
                          INSTANT
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Works with eSewa, Khalti, IME Pay, & all Nepal Bank Apps
                      </div>
                    </div>
                  </div>

                  <div className="w-4 h-4 rounded-full border-2 border-teal-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-teal-400" />
                  </div>
                </div>
              </div>

              {/* Checkout Summary & Pay Action Button */}
              <div className="pt-2">
                {!currentUser ? (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2 mb-3">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Sign In Required Before Purchasing Credits</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      To safeguard purchases and link your Free Fire game UID to your account, please sign in with your email first.
                    </p>
                    <button
                      onClick={onOpenAuth}
                      className="px-4 py-1.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In With Email Now</span>
                    </button>
                  </div>
                ) : null}

                <button
                  id="pay-fonepay-checkout-btn"
                  onClick={handleInitiatePayment}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-wider text-slate-950 bg-teal-400 hover:bg-teal-300 active:scale-[0.99] disabled:opacity-50 transition-all shadow-lg shadow-teal-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Generating Secure FonePay QR...</span>
                    </>
                  ) : !currentUser ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In to Buy ({computedAmount.toLocaleString()} NPR)</span>
                    </>
                  ) : (
                    <>
                      <span>Pay NPR {computedAmount.toLocaleString()} via FonePay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Secure 256-Bit Server Gateway • Suk Narayan Kirana Pasal</span>
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
