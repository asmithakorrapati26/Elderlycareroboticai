import { useState } from 'react';
import { Pill, Plus, Clock, CheckCircle, AlertTriangle, Trash2, X, Edit2 } from 'lucide-react';
import { useMedications } from '@/hooks/useData';
import { formatTime, isMedicationOverdue } from '@/lib/utils';
import type { Medication } from '@/types';

const MED_COLORS = [
  { name: 'blue', class: 'bg-primary-500/20 text-primary-400', dot: 'bg-primary-500' },
  { name: 'green', class: 'bg-success-500/20 text-success-400', dot: 'bg-success-500' },
  { name: 'orange', class: 'bg-accent-500/20 text-accent-400', dot: 'bg-accent-500' },
  { name: 'purple', class: 'bg-neutral-600/40 text-neutral-300', dot: 'bg-neutral-400' },
  { name: 'teal', class: 'bg-secondary-500/20 text-secondary-400', dot: 'bg-secondary-500' },
];

export function Medications() {
  const { medications, loading, create, update, remove } = useMedications();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    scheduled_time: '08:00',
    instructions: '',
    color: 'blue',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await update(editing.id, {
        name: formData.name,
        dosage: formData.dosage,
        scheduled_time: formData.scheduled_time,
        instructions: formData.instructions || null,
        color: formData.color,
      });
    } else {
      await create({
        name: formData.name,
        dosage: formData.dosage,
        scheduled_time: formData.scheduled_time,
        frequency: 'daily',
        instructions: formData.instructions || null,
        color: formData.color,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', dosage: '', scheduled_time: '08:00', instructions: '', color: 'blue' });
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (med: Medication) => {
    setEditing(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      scheduled_time: med.scheduled_time,
      instructions: med.instructions ?? '',
      color: med.color,
    });
    setShowForm(true);
  };

  const markTaken = async (med: Medication) => {
    await update(med.id, { taken_today: true, last_taken_at: new Date().toISOString() });
  };

  const resetDay = async () => {
    for (const med of medications) {
      if (med.taken_today) {
        await update(med.id, { taken_today: false, last_taken_at: null });
      }
    }
  };

  const sorted = [...medications].sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
  const takenCount = medications.filter((m) => m.taken_today).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-50">Medications</h2>
          <p className="text-sm text-neutral-400 mt-1">{medications.length} medications • {takenCount} taken today</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetDay}
            className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium rounded-xl transition-all flex items-center gap-2"
          >
            <Clock className="w-4 h-4" /> Reset Day
          </button>
          <button
            onClick={() => { setEditing(null); setFormData({ name: '', dosage: '', scheduled_time: '08:00', instructions: '', color: 'blue' }); setShowForm(true); }}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Medication
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in" onClick={resetForm}>
          <div className="w-full max-w-md bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-50">{editing ? 'Edit Medication' : 'Add Medication'}</h3>
              <button onClick={resetForm} className="text-neutral-500 hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-1.5 block">Medicine Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lisinopril"
                  required
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-neutral-400 mb-1.5 block">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 10 mg"
                    required
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-1.5 block">Time</label>
                  <input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1.5 block">Instructions (optional)</label>
                <input
                  type="text"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g. Take with food"
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1.5 block">Color Label</label>
                <div className="flex gap-2">
                  {MED_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.name })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${c.class} ${
                        formData.color === c.name ? 'ring-2 ring-offset-2 ring-offset-neutral-900 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${c.dot}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-all">
                  {editing ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medication list */}
      {loading ? (
        <div className="text-center py-12 text-neutral-500">Loading medications...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 rounded-2xl border border-neutral-800">
          <Pill className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-400">No medications added yet</p>
          <p className="text-sm text-neutral-600 mt-1">Click "Add Medication" to create the first one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((med) => {
            const colorCfg = MED_COLORS.find((c) => c.name === med.color) ?? MED_COLORS[0];
            const overdue = isMedicationOverdue(med);
            return (
              <div
                key={med.id}
                className={`bg-neutral-900 rounded-2xl p-5 border transition-all ${
                  med.taken_today ? 'border-success-900/30' : overdue ? 'border-warning-800/40' : 'border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Time */}
                  <div className="flex flex-col items-center justify-center w-20 flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorCfg.class}`}>
                      <Pill className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono text-neutral-400 mt-2">{formatTime(med.scheduled_time)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-neutral-100">{med.name}</h3>
                      <span className="text-sm text-neutral-500">{med.dosage}</span>
                    </div>
                    {med.instructions && (
                      <p className="text-sm text-neutral-400 mt-1">{med.instructions}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {med.taken_today ? (
                        <span className="flex items-center gap-1 text-xs text-success-400 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Taken today
                        </span>
                      ) : overdue ? (
                        <span className="flex items-center gap-1 text-xs text-warning-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500">Scheduled • {med.frequency}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!med.taken_today && (
                      <button
                        onClick={() => markTaken(med)}
                        className="px-3 py-2 bg-success-600/80 hover:bg-success-600 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Taken
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(med)}
                      className="p-2 text-neutral-500 hover:text-primary-400 hover:bg-neutral-800 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(med.id)}
                      className="p-2 text-neutral-500 hover:text-error-400 hover:bg-neutral-800 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
