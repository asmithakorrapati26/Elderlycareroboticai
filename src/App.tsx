import { useState, useEffect, useCallback } from 'react';
import { Home, Pill, Phone, Hospital, Bell, Settings as SettingsIcon, Bot, Menu, X } from 'lucide-react';
import { Dashboard } from '@/pages/Dashboard';
import { Medications } from '@/pages/Medications';
import { Contacts } from '@/pages/Contacts';
import { Hospitals } from '@/pages/Hospitals';
import { AlertHistory } from '@/pages/AlertHistory';
import { Settings } from '@/pages/Settings';
import { ReminderModal } from '@/components/ReminderModal';
import { RobotAvatar } from '@/components/RobotAvatar';
import { useMedications, useEmergencyContacts, useHospitals, useSettings, useAlertLog } from '@/hooks/useData';
import { isMedicationDue } from '@/lib/utils';
import type { Medication } from '@/types';

type Page = 'dashboard' | 'medications' | 'contacts' | 'hospitals' | 'alerts' | 'settings';

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { id: 'medications', label: 'Medications', icon: <Pill className="w-5 h-5" /> },
  { id: 'contacts', label: 'Contacts', icon: <Phone className="w-5 h-5" /> },
  { id: 'hospitals', label: 'Hospitals', icon: <Hospital className="w-5 h-5" /> },
  { id: 'alerts', label: 'Alert History', icon: <Bell className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
];

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeReminder, setActiveReminder] = useState<Medication | null>(null);
  const [autoTriggered, setAutoTriggered] = useState<Set<string>>(new Set());

  const { medications, update: updateMed } = useMedications();
  const { contacts } = useEmergencyContacts();
  const { hospitals } = useHospitals();
  const { settings } = useSettings();
  const { create: createAlert } = useAlertLog();

  // Auto-trigger reminders for due medications
  useEffect(() => {
    const dueMeds = medications.filter((m) => isMedicationDue(m) && !autoTriggered.has(m.id));
    if (dueMeds.length > 0 && !activeReminder) {
      const next = dueMeds[0];
      setAutoTriggered((prev) => new Set(prev).add(next.id));
      setActiveReminder(next);
      createAlert({
        alert_type: 'medication_reminder',
        severity: 'medium',
        title: `Reminder Triggered: ${next.name}`,
        description: `CareBot initiated a medication reminder for ${next.name} (${next.dosage}).`,
        status: 'active',
        medication_id: next.id,
      });
    }
  }, [medications, activeReminder, autoTriggered, createAlert]);

  // Reset auto-triggered set at midnight
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const timeToMidnight = midnight.getTime() - now.getTime();
    const timer = setTimeout(() => {
      setAutoTriggered(new Set());
    }, timeToMidnight);
    return () => clearTimeout(timer);
  }, []);

  // Check every 30 seconds for due medications
  useEffect(() => {
    const interval = setInterval(() => {
      const dueMeds = medications.filter((m) => isMedicationDue(m) && !autoTriggered.has(m.id));
      if (dueMeds.length > 0 && !activeReminder) {
        const next = dueMeds[0];
        setAutoTriggered((prev) => new Set(prev).add(next.id));
        setActiveReminder(next);
        createAlert({
          alert_type: 'medication_reminder',
          severity: 'medium',
          title: `Reminder Triggered: ${next.name}`,
          description: `CareBot initiated a medication reminder for ${next.name} (${next.dosage}).`,
          status: 'active',
          medication_id: next.id,
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [medications, activeReminder, autoTriggered, createAlert]);

  const triggerReminder = useCallback((medId: string) => {
    const med = medications.find((m) => m.id === medId);
    if (med) {
      setAutoTriggered((prev) => new Set(prev).add(med.id));
      setActiveReminder(med);
    }
  }, [medications]);

  const handleMarkTaken = useCallback(async () => {
    if (activeReminder) {
      await updateMed(activeReminder.id, { taken_today: true, last_taken_at: new Date().toISOString() });
    }
  }, [activeReminder, updateMed]);

  const closeReminder = useCallback(() => {
    setActiveReminder(null);
  }, []);

  const activeAlertsCount = useAlertLog().alerts.filter((a) => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-40 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RobotAvatar state="idle" size="sm" />
            <div>
              <h1 className="text-base font-bold text-neutral-50">CareBot</h1>
              <p className="text-xs text-secondary-400">AI Health Companion</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-neutral-500 hover:text-neutral-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                page === item.id
                  ? 'bg-primary-600/15 text-primary-400 border border-primary-800/40'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 border border-transparent'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === 'alerts' && activeAlertsCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-md bg-error-500 text-white text-xs font-semibold">
                  {activeAlertsCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Status footer */}
        <div className="px-4 py-4 border-t border-neutral-800">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success-950/30 border border-success-900/30">
            <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
            <span className="text-xs text-success-300 font-medium">System Online</span>
          </div>
          <p className="text-xs text-neutral-600 mt-2 text-center">Prototype v1.0</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-neutral-950/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RobotAvatar state="idle" size="sm" />
            <span className="font-bold text-neutral-50">CareBot</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="text-neutral-400 hover:text-neutral-100 p-2 rounded-lg hover:bg-neutral-800">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          {page === 'dashboard' && <Dashboard onTriggerReminder={triggerReminder} />}
          {page === 'medications' && <Medications />}
          {page === 'contacts' && <Contacts />}
          {page === 'hospitals' && <Hospitals />}
          {page === 'alerts' && <AlertHistory />}
          {page === 'settings' && <Settings />}
        </main>
      </div>

      {/* Reminder Modal */}
      {activeReminder && settings && (
        <ReminderModal
          medication={activeReminder}
          contacts={contacts}
          hospitals={hospitals}
          settings={settings}
          onClose={closeReminder}
          onTaken={closeReminder}
          onLogAlert={createAlert}
          onMarkTaken={handleMarkTaken}
        />
      )}
    </div>
  );
}

export default App;
