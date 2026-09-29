import React, { useState } from 'react';
import { NotificationItem } from '../types';
import { X, MessageSquare, Phone, Bell, CheckCircle2, ArrowRight } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectTab: (tabId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectTab,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'whatsapp' | 'sms' | 'app'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.channel === activeFilter;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div className="bg-[#12151b] border border-neutral-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 id="notif-modal-title" className="text-base font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Real-Time Redistribution Dispatch Center</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live multi-channel delivery alerts dispatched via SMS, WhatsApp, and App push.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications dialog"
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between py-3 border-b border-neutral-800/80 text-xs">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'sms', label: 'SMS' },
              { id: 'app', label: 'In-App Push' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeFilter === tab.id
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={onMarkAllAsRead}
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Mark all read
          </button>
        </div>

        {/* Notifications Stream */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No notifications matching this channel filter.
            </div>
          ) : (
            filtered.map((item) => {
              const getChannelBadge = () => {
                if (item.channel === 'whatsapp') {
                  return (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                      <MessageSquare className="w-3 h-3" />
                      WhatsApp
                    </span>
                  );
                }
                if (item.channel === 'sms') {
                  return (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-sky-400 bg-sky-950/40 border border-sky-900/50 px-2 py-0.5 rounded">
                      <Phone className="w-3 h-3" />
                      SMS
                    </span>
                  );
                }
                return (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-purple-400 bg-purple-950/40 border border-purple-900/50 px-2 py-0.5 rounded">
                    <Bell className="w-3 h-3" />
                    App Push
                  </span>
                );
              };

              return (
                <div
                  key={item.id}
                  className="bg-neutral-900/70 border border-neutral-800 rounded-lg p-3.5 space-y-2 text-xs hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getChannelBadge()}
                      <span className="text-white font-semibold">{item.title}</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono">{item.timestamp}</span>
                  </div>

                  <p className="text-neutral-300 leading-relaxed font-sans">{item.message}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-[11px] text-neutral-400">
                    <span>
                      Target: <strong className="text-neutral-200">{item.recipientName}</strong> ({item.phoneOrTarget})
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectTab('buyers');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                    >
                      <span>View in Buyer Portal</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
          >
            Close Dispatch Center
          </button>
        </div>
      </div>
    </div>
  );
};
