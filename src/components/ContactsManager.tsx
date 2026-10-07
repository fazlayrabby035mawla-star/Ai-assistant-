import React, { useState } from 'react';
import { User, Phone, MessageSquare, Plus, Search, Star, ExternalLink } from 'lucide-react';

export interface ContactItem {
  id: string;
  name: string;
  phoneNumber: string;
  role?: string;
  starred?: boolean;
}

interface ContactsManagerProps {
  onCallContact: (number: string, name?: string) => void;
  onOpenWhatsApp: (number: string) => void;
}

export const ContactsManager: React.FC<ContactsManagerProps> = ({
  onCallContact,
  onOpenWhatsApp,
}) => {
  const [contacts, setContacts] = useState<ContactItem[]>([
    { id: 'c1', name: 'Marcus Vance', phoneNumber: '+15552348901', role: 'Tech Lead / Work', starred: true },
    { id: 'c2', name: 'Mom', phoneNumber: '+15558901234', role: 'Family', starred: true },
    { id: 'c3', name: 'City Health Clinic', phoneNumber: '+15557823490', role: 'Appointments', starred: false },
    { id: 'c4', name: 'Apex Cloud Support', phoneNumber: '+18004129988', role: 'Cloud Billing Desk', starred: false },
    { id: 'c5', name: 'David (Mobile Dev)', phoneNumber: '+15556718822', role: 'Colleague', starred: false },
    { id: 'c6', name: 'Alex Rivera', phoneNumber: '+15554321100', role: 'Friend', starred: false },
  ]);

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newRole, setNewRole] = useState('');

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phoneNumber.includes(search)
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newNumber.trim()) return;

    setContacts([
      {
        id: `contact-${Date.now()}`,
        name: newName.trim(),
        phoneNumber: newNumber.trim(),
        role: newRole.trim() || 'Contact',
        starred: false,
      },
      ...contacts,
    ]);

    setNewName('');
    setNewNumber('');
    setNewRole('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full px-4 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            Phone Contacts
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              {contacts.length}
            </span>
          </h2>
          <p className="text-xs text-slate-400">Select any contact to initiate a call</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onCallContact(contact.phoneNumber, contact.name)}
            className="p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold flex items-center justify-center text-sm flex-shrink-0">
                {contact.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {contact.name}
                  </span>
                  {contact.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  {contact.phoneNumber}
                </div>
                {contact.role && (
                  <div className="text-[10px] text-slate-500 truncate">{contact.role}</div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCallContact(contact.phoneNumber, contact.name);
                }}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95"
                title="Initiate Phone Call"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenWhatsApp(contact.phoneNumber);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800/40 transition active:scale-95"
                title="Open WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white mb-3">Add New Contact</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Role / Tag</label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Work, Friend, Family"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
