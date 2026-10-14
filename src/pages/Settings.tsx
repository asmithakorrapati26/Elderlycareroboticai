import { useState } from 'react';
import { Settings as SettingsIcon, Clock, Volume2, Shield, Save, User, Heart, Droplet } from 'lucide-react';
import { useSettings, usePatientProfile } from '@/hooks/useData';

export function Settings() {
  const { settings, update } = useSettings();
  const { profile, update: updateProfile } = usePatientProfile();
  const [form, setForm] = useState({
    reminder_wait_seconds: settings?.reminder_wait_seconds ?? 30,
    checkin_wait_seconds: settings?.checkin_wait_seconds ?? 20,
    escalation_wait_seconds: settings?.escalation_wait_seconds ?? 30,
    voice_enabled: settings?.voice_enabled ?? true,
    auto_escalate: settings?.auto_escalate ?? true,
  });
  const [profileForm, setProfileForm] = useState({
    name: profile?.name ?? '',
    age: profile?.age ?? 0,
    gender: profile?.gender ?? '',
    blood_type: profile?.blood_type ?? '',
    room_number: profile?.room_number ?? '',
    device_name: profile?.device_name ?? 'CareBot AI-1',
  });
  const [conditionsInput, setConditionsInput] = useState(profile?.medical_conditions?.join(', ') ?? '');
  const [allergiesInput, setAllergiesInput] = useState(profile?.allergies?.join(', ') ?? '');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveSettings = async () => {
    await update(form);
    setSavedMsg('Settings saved');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      name: profileForm.name,
      age: profileForm.age,
      gender: profileForm.gender,
      blood_type: profileForm.blood_type,
      room_number: profileForm.room_number,
      device_name: profileForm.device_name,
      medical_conditions: conditionsInput.split(',').map((s) => s.trim()).filter(Boolean),
      allergies: allergiesInput.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setSavedMsg('Profile saved');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-neutral-50">Settings</h2>
        <p className="text-sm text-neutral-400 mt-1">Configure escalation timing, voice, and patient profile</p>
      </div>

      {/* Escalation timing */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-warning-500/15 text-warning-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-100">Escalation Timing</h3>
            <p className="text-sm text-neutral-500">How long CareBot waits before escalating</p>
          </div>
        </div>

        <div className="space-y-5">
          <SliderSetting
            label="Reminder Wait Time"
            description="How long to wait for patient to take medicine before first check-in"
            value={form.reminder_wait_seconds}
            min={10}
            max={120}
            step={5}
            unit="seconds"
            onChange={(v) => setForm({ ...form, reminder_wait_seconds: v })}
          />
          <SliderSetting
            label="Check-in Wait Time"
            description="How long to wait for patient to respond to 'Are you okay?'"
            value={form.checkin_wait_seconds}
            min={10}
            max={60}
            step={5}
            unit="seconds"
            onChange={(v) => setForm({ ...form, checkin_wait_seconds: v })}
          />
          <SliderSetting
            label="Escalation Wait Time"
            description="How long before contacting emergency contacts after no response"
            value={form.escalation_wait_seconds}
            min={10}
            max={120}
            step={5}
            unit="seconds"
            onChange={(v) => setForm({ ...form, escalation_wait_seconds: v })}
          />
        </div>

        <div className="mt-6 space-y-3">
          <ToggleSetting
            icon={<Volume2 className="w-5 h-5" />}
            label="Voice Prompts"
            description="CareBot speaks reminders aloud to the patient"
            value={form.voice_enabled}
            onChange={(v) => setForm({ ...form, voice_enabled: v })}
          />
          <ToggleSetting
            icon={<Shield className="w-5 h-5" />}
            label="Auto-Escalate"
            description="Automatically escalate to contacts and hospital when no response"
            value={form.auto_escalate}
            onChange={(v) => setForm({ ...form, auto_escalate: v })}
          />
        </div>

        <button
          onClick={handleSaveSettings}
          className="mt-6 w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>

      {/* Patient profile */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-500/15 text-primary-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-100">Patient Profile</h3>
            <p className="text-sm text-neutral-500">Medical information shared with hospitals during emergencies</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name">
              <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-primary-500 transition-colors" />
            </FormField>
            <FormField label="Age">
              <input type="number" min={0} max={150} value={profileForm.age} onChange={(e) => setProfileForm({ ...profileForm, age: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-primary-500 transition-colors" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Gender">
              <select value={profileForm.gender} onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-primary-500 transition-colors">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Not specified</option>
              </select>
            </FormField>
            <FormField label="Blood Type" icon={<Droplet className="w-3.5 h-3.5" />}>
              <select value={profileForm.blood_type} onChange={(e) => setProfileForm({ ...profileForm, blood_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-primary-500 transition-colors">
                <option>Unknown</option>
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option>
                <option>O+</option><option>O-</option>
              </select>
            </FormField>
            <FormField label="Room Number">
              <input type="text" value={profileForm.room_number} onChange={(e) => setProfileForm({ ...profileForm, room_number: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-primary-500 transition-colors" />
            </FormField>
          </div>
          <FormField label="Device Name">
            <input type="text" value={profileForm.device_name} onChange={(e) => setProfileForm({ ...profileForm, device_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-primary-500 transition-colors" />
          </FormField>
          <FormField label="Medical Conditions (comma separated)" icon={<Heart className="w-3.5 h-3.5" />}>
            <input type="text" value={conditionsInput} onChange={(e) => setConditionsInput(e.target.value)} placeholder="Hypertension, Diabetes, ..."
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-primary-500 transition-colors" />
          </FormField>
          <FormField label="Allergies (comma separated)">
            <input type="text" value={allergiesInput} onChange={(e) => setAllergiesInput(e.target.value)} placeholder="Penicillin, ..."
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-primary-500 transition-colors" />
          </FormField>
        </div>

        <button
          onClick={handleSaveProfile}
          className="mt-6 w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Profile
        </button>
      </div>

      {savedMsg && (
        <div className="fixed bottom-6 right-6 px-5 py-3 bg-success-600 text-white rounded-xl shadow-lg animate-slide-up font-medium text-sm">
          {savedMsg}
        </div>
      )}
    </div>
  );
}

function SliderSetting({ label, description, value, min, max, step, unit, onChange }: {
  label: string; description: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="text-sm font-medium text-neutral-200">{label}</label>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
        <span className="text-sm font-mono text-primary-400 font-semibold">{value}s</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-primary-500 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-neutral-600 mt-1">
        <span>{min}s</span>
        <span>{max}s</span>
      </div>
    </div>
  );
}

function ToggleSetting({ icon, label, description, value, onChange }: {
  icon: React.ReactNode; label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-neutral-800/50">
      <div className="w-10 h-10 rounded-xl bg-neutral-700 text-neutral-300 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-200">{label}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-all flex-shrink-0 relative ${value ? 'bg-primary-600' : 'bg-neutral-700'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function FormField({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-neutral-400 mb-1.5 flex items-center gap-1.5">
        {icon}{label}
      </label>
      {children}
    </div>
  );
}
