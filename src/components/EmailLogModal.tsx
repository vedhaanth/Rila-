import React from 'react';
import { useApp } from '../context/AppContext';
import { Mail, X, CheckCircle, Clock, Send } from 'lucide-react';

export const EmailLogModal: React.FC = () => {
  const { isEmailLogModalOpen, setIsEmailLogModalOpen, emailLogs, fetchEmailLogs } = useApp();

  if (!isEmailLogModalOpen) return null;

  return (
    <div id="email-log-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-amber-200 animate-slide-left">
        <div className="p-5 border-b border-amber-500/30 flex items-center justify-between bg-slate-950 text-amber-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <Mail className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-serif-display font-extrabold text-white text-lg">Nodemailer Dispatch Simulator</h3>
              <p className="text-xs text-amber-200/80">Automated transaction & GST receipt logs</p>
            </div>
          </div>
          <button
            onClick={() => setIsEmailLogModalOpen(false)}
            className="p-2 text-amber-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <Send className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Nodemailer service logs when sweet & mithai orders are placed or tax invoices are generated.</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {emailLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Mail className="w-12 h-12 mx-auto mb-3 text-amber-300" />
              <p>No email notifications sent yet.</p>
            </div>
          ) : (
            emailLogs.map((log) => (
              <div
                key={log.log_id}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 hover:border-amber-400 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950">
                    {log.type}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {new Date(log.sent_at).toLocaleString()}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 mb-1 font-serif-display">{log.subject}</h4>
                <div className="text-xs text-amber-900 font-mono mb-2">To: {log.recipient}</div>
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-800 leading-relaxed font-medium">
                  {log.body}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-[11px] text-slate-400">{log.log_id}</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Delivered via RILA SMTP
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-amber-200 bg-amber-50/50 flex justify-between items-center text-xs">
          <span className="text-slate-600 font-bold">Total Sent: {emailLogs.length} messages</span>
          <button
            onClick={() => fetchEmailLogs()}
            className="px-4 py-2 bg-slate-950 text-amber-300 hover:bg-slate-900 rounded-xl font-bold transition shadow"
          >
            Refresh Logs
          </button>
        </div>
      </div>
    </div>
  );
};
