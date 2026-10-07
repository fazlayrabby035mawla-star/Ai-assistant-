import React, { useState } from 'react';
import { Phone, PhoneMissed, PhoneIncoming, PhoneOutgoing, MessageSquare, Plus, Clock, Search } from 'lucide-react';
import type { CallRecord } from '../types';

interface CallHistoryProps {
  calls: CallRecord[];
  onCallNumber: (number: string, name?: string) => void;
  onAddCall: (record: CallRecord) => void;
}

export const CallHistory: React.FC<CallHistoryProps> = ({ calls, onCallNumber, onAddCall }) => {
  const [filter, setFilter] = useState<'all' | 'missed' | 'today'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newType, setNewType] = useState<'missed' | 'incoming' | 'outgoing'>('missed');

  const filteredCalls = calls.filter((c) => {
    if (filter === 'missed' && c.type !== 'missed') return false;
    if (filter === 'today' && !c.isMissedToday && !c.timestamp.includes('Today')) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phoneNumber.includes(q);
    }
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim()) return;

    const newRecord: CallRecord = {
      id: `custom-call-${Date.now()}`,
      name: newName.trim() || 'Unknown Caller',
      phoneNumber: newNumber.trim(),
      type: newType,
      timestamp: 'Today, Just now',
      timeAgo: 'Just now',
      isMissedToday: newType === 'missed',
      notes: 'Logged manually',
    };

    onAddCall(newRecord);
    setNewName('');
    setNewNumber('');
    setShowAddModal(false);
  };

  const missedTodayCount = calls.filter((c) => c.isMissedToday).length;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full px-4 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            Call Logs & History
            {missedTodayCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                {missedTodayCount} Missed Today
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">Track and return phone calls</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Call
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-3 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
            filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({calls.length})
        </button>
        <button
          onClick={() => setFilter('today')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
            filter === 'today' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setFilter('missed')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
            filter === 'missed' ? 'bg-red-950/80 text-red-300 border border-red-700/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Missed ({calls.filter((c) => c.type === 'missed').length})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or number..."
          className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredCalls.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No calls found matching your filter.
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div
              key={call.id}
              className={`p-3 rounded-2xl border transition ${
                call.isMissedToday
                  ? 'bg-red-950/20 border-red-900/40 hover:bg-red-950/30'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      call.type === 'missed'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : call.type === 'incoming'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {call.type === 'missed' && <PhoneMissed className="w-4 h-4" />}
                    {call.type === 'incoming' && <PhoneIncoming className="w-4 h-4" />}
                    {call.type === 'outgoing' && <PhoneOutgoing className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-100 truncate">
                        {call.name}
                      </span>
                      {call.isMissedToday && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-500/30 text-red-300">
                          Missed
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {call.phoneNumber}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{call.timestamp}</span>
                      {call.duration && <span>• {call.duration}</span>}
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <button
                    onClick={() => onCallNumber(call.phoneNumber, call.name)}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm active:scale-95"
                    title="Call Back via Android Dialer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`https://wa.me/${call.phoneNumber.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800/40 transition active:scale-95"
                    title="Message on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {call.notes && (
                <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 italic">
                  Note: {call.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Manual Add Call Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white mb-3">Log a Call Record</h3>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Call Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['missed', 'incoming', 'outgoing'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setNewType(t)}
                      className={`py-1.5 text-xs font-medium capitalize rounded-lg border transition ${
                        newType === t
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500"
              >
                Save Call
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
