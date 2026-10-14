import { useState } from 'react';
import { Phone, Plus, Star, Trash2, X, User, Heart, Shield } from 'lucide-react';
import { useEmergencyContacts } from '@/hooks/useData';
import type { EmergencyContact } from '@/types';

const AVATAR_COLORS = [
  { name: 'teal', class: 'bg-secondary-500' },
  { name: 'blue', class: 'bg-primary-500' },
  { name: 'pink', class: 'bg-error-400' },
  { name: 'orange', class: 'bg-accent-500' },
  { name: 'green', class: 'bg-success-500' },
];

export function Contacts() {
  const { contacts, loading, create, update, remove } = useEmergencyContacts();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    priority: 1,
    is_primary: false,
    avatar_color: 'teal',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await update(editing.id, formData);
    } else {
      await create(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', relationship: '', phone: '', priority: contacts.length + 1, is_primary: false, avatar_color: 'teal' });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (contact: EmergencyContact) => {
    setEditing(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      priority: contact.priority,
      is_primary: contact.is_primary,
      avatar_color: contact.avatar_color,
    });
    setShowForm(true);
  };

  const sorted = [...contacts].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-50">Emergency Contacts</h2>
          <p className="text-sm text-neutral-400 mt-1">{contacts.length} contacts • Notified automatically during escalation</p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormData({ name: '', relationship: '', phone: '', priority: contacts.length + 1, is_primary: false, avatar_color: 'teal' }); setShowForm(true); }}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary-950/30 border border-secondary-900/40">
        <Shield className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-secondary-200/80">
          When the patient doesn't respond to medication reminders or reports they're not okay, CareBot automatically contacts these people in priority order, then alerts the nearest hospital.
        </p>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in" onClick={resetForm}>
          <div className="w-full max-w-md bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-50">{editing ? 'Edit Contact' : 'Add Emergency Contact'}</h3>
              <button onClick={resetForm} className="text-neutral-500 hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-1.5 block">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. David Anderson" required
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-primary-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-neutral-400 mb-1.5 block">Relationship</label>
                  <input type="text" value={formData.relationship} onChange={(e) => setFormData({ ...formData, relationship: e.target.value })} placeholder="e.g. Son" required
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-1.5 block">Priority</label>
                  <input type="number" min={1} max={10} value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })} required
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1.5 block">Phone Number</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="e.g. +1 555-0101" required
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-primary-500 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1.5 block">Avatar Color</label>
                <div className="flex gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button key={c.name} type="button" onClick={() => setFormData({ ...formData, avatar_color: c.name })}
                      className={`w-10 h-10 rounded-full ${c.class} transition-all ${formData.avatar_color === c.name ? 'ring-2 ring-offset-2 ring-offset-neutral-900 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`} />
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.is_primary} onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary-500" />
                <span className="text-sm text-neutral-300">Primary contact (contacted first during escalation)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-all">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact list */}
      {loading ? (
        <div className="text-center py-12 text-neutral-500">Loading contacts...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 rounded-2xl border border-neutral-800">
          <Phone className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-400">No emergency contacts yet</p>
          <p className="text-sm text-neutral-600 mt-1">Add contacts so CareBot can reach out during emergencies</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map((contact) => {
            const colorCfg = AVATAR_COLORS.find((c) => c.name === contact.avatar_color) ?? AVATAR_COLORS[0];
            return (
              <div key={contact.id} className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 hover:border-neutral-700 transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${colorCfg.class} flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg`}>
                    {contact.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-neutral-100 truncate">{contact.name}</h3>
                      {contact.is_primary && (
                        <span className="flex items-center gap-1 text-xs text-secondary-400 font-medium">
                          <Star className="w-3 h-3 fill-secondary-400" /> Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-400">{contact.relationship}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-sm text-neutral-300 font-mono">{contact.phone}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(contact)} className="p-1.5 text-neutral-500 hover:text-primary-400 hover:bg-neutral-800 rounded-lg transition-all">
                      <User className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(contact.id)} className="p-1.5 text-neutral-500 hover:text-error-400 hover:bg-neutral-800 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="px-2 py-1 rounded-md bg-neutral-800 text-xs text-neutral-400">
                    Priority #{contact.priority}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-secondary-400">
                    <Heart className="w-3 h-3" /> Auto-notified on alert
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
