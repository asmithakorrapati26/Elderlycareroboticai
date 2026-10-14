import { useState } from 'react';
import { Hospital as HospitalIcon, Plus, Phone, MapPin, Trash2, X, Ambulance, Navigation } from 'lucide-react';
import { useHospitals } from '@/hooks/useData';

export function Hospitals() {
  const { hospitals, loading, create, remove } = useHospitals();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    distance_km: 0,
    phone: '',
    address: '',
    emergency_services: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create({
      name: formData.name,
      distance_km: parseFloat(String(formData.distance_km)) || 0,
      phone: formData.phone,
      address: formData.address || null,
      emergency_services: formData.emergency_services,
    });
    setFormData({ name: '', distance_km: 0, phone: '', address: '', emergency_services: true });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-50">Nearby Hospitals</h2>
          <p className="text-sm text-neutral-400 mt-1">{hospitals.length} facilities • Sorted by distance</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Hospital
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-error-950/30 border border-error-900/40">
        <Ambulance className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-error-200/80">
          In a critical emergency — when the patient doesn't respond to reminders and check-ins, or reports they need help — CareBot alerts the nearest hospital with emergency services.
        </p>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-50">Add Hospital</h3>
              <button onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-1.5 block">Hospital Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. St. Mary Medical Center" required
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-primary-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-neutral-400 mb-1.5 block">Distance (km)</label>
                  <input type="number" step="0.1" min={0} value={formData.distance_km} onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) || 0 })} required
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-1.5 block">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="e.g. +1 555-9111" required
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-primary-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1.5 block">Address (optional)</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="e.g. 123 Health Ave"
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-primary-500 transition-colors" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.emergency_services} onChange={(e) => setFormData({ ...formData, emergency_services: e.target.checked })}
                  className="w-5 h-5 rounded accent-primary-500" />
                <span className="text-sm text-neutral-300">Has emergency services (preferred for escalation)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-xl transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-all">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hospital list */}
      {loading ? (
        <div className="text-center py-12 text-neutral-500">Loading hospitals...</div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 rounded-2xl border border-neutral-800">
          <HospitalIcon className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-400">No hospitals added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hospitals.map((hosp, idx) => (
            <div key={hosp.id} className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 hover:border-neutral-700 transition-all group">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  hosp.emergency_services ? 'bg-error-500/20 text-error-400' : 'bg-neutral-700 text-neutral-300'
                }`}>
                  <HospitalIcon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-neutral-100">{hosp.name}</h3>
                    {hosp.emergency_services && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-error-500/15 text-xs text-error-400 font-medium">
                        <Ambulance className="w-3 h-3" /> Emergency
                      </span>
                    )}
                    {idx === 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-500/15 text-xs text-secondary-400 font-medium">
                        <Navigation className="w-3 h-3" /> Nearest
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-sm text-neutral-400">{hosp.distance_km} km away</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-sm text-neutral-300 font-mono">{hosp.phone}</span>
                    </div>
                  </div>
                  {hosp.address && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                      <span className="text-sm text-neutral-500">{hosp.address}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => remove(hosp.id)} className="p-2 text-neutral-500 hover:text-error-400 hover:bg-neutral-800 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
