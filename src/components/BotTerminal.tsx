import { useState, useRef, useEffect } from 'react';
import { BotLog, BotState } from '../types';
import { Terminal, Download, Trash2, Copy, Check, ArrowDownCircle } from 'lucide-react';

interface BotTerminalProps {
  logs: BotLog[];
  botState: BotState;
  onClearLogs: () => void;
}

export function BotTerminal({ logs, botState, onClearLogs }: BotTerminalProps) {
  const [filter, setFilter] = useState<'all' | 'glory' | 'network' | 'system'>('all');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'glory') return log.type === 'glory';
    if (filter === 'network') return log.type === 'network';
    if (filter === 'system') return log.type === 'info' || log.type === 'warning' || log.type === 'success';
    return true;
  });

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ffglory_nepal_bot_${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="bot-terminal-container" className="bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg flex flex-col h-[360px] sm:h-[420px]">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 px-3 py-2 sm:px-4 sm:py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500/80" />
            <span className="w-2 h-2 rounded-full bg-amber-500/80" />
            <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            <Terminal className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-200 truncate max-w-[140px] sm:max-w-none">
              nepal-bot:~/daemon
            </span>
          </div>
        </div>

        {/* Filters & Terminal Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-md border border-slate-800 text-[10px]">
            {(['all', 'glory', 'network', 'system'] as const).map((tab) => (
              <button
                key={tab}
                id={`terminal-filter-${tab}`}
                onClick={() => setFilter(tab)}
                className={`px-1.5 py-0.5 rounded font-medium capitalize transition-colors ${
                  filter === tab
                    ? 'bg-orange-500 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Auto scroll toggle */}
          <button
            id="terminal-autoscroll-btn"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded border transition-colors ${
              autoScroll
                ? 'bg-slate-800 text-emerald-400 border-slate-700'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title={autoScroll ? 'Auto-scroll is ON' : 'Auto-scroll is OFF'}
          >
            <ArrowDownCircle className="w-3 h-3" />
          </button>

          {/* Copy Logs */}
          <button
            id="terminal-copy-btn"
            onClick={handleCopyLogs}
            className="p-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
            title="Copy Logs to Clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>

          {/* Download Logs */}
          <button
            id="terminal-download-btn"
            onClick={handleDownloadLogs}
            className="p-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
            title="Download Log File"
          >
            <Download className="w-3 h-3" />
          </button>

          {/* Clear Logs */}
          <button
            id="terminal-clear-btn"
            onClick={onClearLogs}
            className="p-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors"
            title="Clear Terminal Logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Log Output Stream Box */}
      <div
        ref={scrollRef}
        id="terminal-log-output"
        className="flex-1 p-3 overflow-y-auto font-mono text-[11px] sm:text-xs space-y-1 scrollbar-thin scrollbar-thumb-slate-800 select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-12">
            No logs available for filter: <span className="text-slate-400 font-bold">{filter}</span>.
            {botState.status !== 'running' && ' Launch the Glory Bot to initiate packet streaming.'}
          </div>
        ) : (
          filteredLogs.map((log) => {
            let badgeBg = 'bg-slate-800 text-slate-400 border-slate-700';
            if (log.type === 'glory') badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
            if (log.type === 'success') badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
            if (log.type === 'network') badgeBg = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
            if (log.type === 'warning') badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

            return (
              <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/50 px-1 py-0.5 rounded transition-colors">
                <span className="text-slate-600 select-none shrink-0 font-mono text-[11px] pt-0.5">
                  [{log.timestamp}]
                </span>

                <span className={`text-[10px] uppercase px-1.5 py-0.2 rounded border select-none shrink-0 ${badgeBg}`}>
                  {log.type}
                </span>

                {log.workerId !== undefined && (
                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-900 text-blue-400 border border-slate-800 shrink-0">
                    W#{log.workerId}
                  </span>
                )}

                <span className={`flex-1 break-all leading-relaxed ${
                  log.type === 'glory'
                    ? 'text-yellow-200 font-medium'
                    : log.type === 'success'
                    ? 'text-emerald-300'
                    : log.type === 'warning'
                    ? 'text-rose-300'
                    : 'text-slate-300'
                }`}>
                  {log.message}
                </span>

                {log.pointsAdded && (
                  <span className="shrink-0 text-xs font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                    +{log.pointsAdded} GLORY
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="bg-slate-900 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${botState.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <span>Packet Stream: {botState.status === 'running' ? 'ACTIVE (TLS 1.3 / Garena Protocol v3)' : 'STANDBY'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Logs: <strong className="text-slate-200">{filteredLogs.length}</strong></span>
          <span>Buffer: <strong className="text-slate-200">{logs.length}/500</strong></span>
        </div>
      </div>
    </div>
  );
}
