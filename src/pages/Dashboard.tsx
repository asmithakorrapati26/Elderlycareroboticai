import { useState, useEffect } from 'react';
import { Clock, Pill, Heart, Activity, Calendar, CheckCircle, AlertTriangle, Phone } from 'lucide-react';
import { RobotCompanion } from '@/components/RobotCompanion';
import { usePatientProfile, useMedications, useAlertLog } from '@/hooks/useData';
import { formatClock, formatDate, formatTime, getNextMedication, getMinutesUntil, isMedicationOverdue } from '@/lib/utils';

interface DashboardProps {
  onTriggerReminder: (medicationId: string) => void;
}

export function Dashboard({ onTriggerReminder }: DashboardProps) {
  const { profile } = usePatientProfile();
  const { medications } = useMedications();
  const { alerts } = useAlertLog();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextMed = getNextMedication(medications);
  const minutesUntil = nextMed ? getMinutesUntil(nextMed.scheduled_time) : null;
  const overdueMeds = medications.filter(isMedicationOverdue);
  const takenCount = medications.filter((m) => m.taken_today).length;
  const activeCount = medications.filter((m) => m.is_active).length;
  const recentAlerts = alerts.slice(0, 4);

  const robotState = overdueMeds.length > 0 ? 'alert' : 'idle';
  const robotMessage = overdueMeds.length > 0
    ? `I've detected ${overdueMeds.length} overdue medication${overdueMeds.length > 1 ? 's' : ''}. I will remind the patient and check in if needed.`
    : nextMed && minutesUntil !== null && minutesUntil <= 15
    ? `Next medication ${nextMed.name} (${nextMed.dosage}) is due in ${minutesUntil} minutes. I'm monitoring closely.`
    : `All systems normal. I'm monitoring ${profile?.name ?? 'the patient'} and tracking ${activeCount} medications. Next reminder at ${nextMed ? formatTime(nextMed.scheduled_time) : 'N/A'}.`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero status banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Clock & Date */}
        <div className="lg:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-6 border border-neutral-800">
          <div className="flex items-center gap-2 text-secondary-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{formatDate(currentTime)}</span>
          </div>
          <div className="text-4xl sm:text-5xl font-bold text-neutral-50 font-mono tracking-tight">
            {formatClock(currentTime)}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-950/40 border border-success-800/50">
              <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
              <span className="text-xs font-medium text-success-300">System Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-950/40 border border-primary-800/50">
              <Activity className="w-3 h-3 text-primary-400" />
              <span className="text-xs font-medium text-primary-300">Monitoring</span>
            </div>
          </div>
        </div>

        {/* Patient card */}
        <div className="bg-gradient-to-br from-primary-950/40 to-neutral-900 rounded-2xl p-6 border border-primary-900/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {profile?.name?.charAt(0) ?? 'P'}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-neutral-50 truncate">{profile?.name ?? 'Loading...'}</h3>
              <p className="text-sm text-neutral-400">{profile?.age} yrs • {profile?.gender}</p>
              <p className="text-xs text-neutral-500">{profile?.room_number} • {profile?.device_name}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile?.medical_conditions?.slice(0, 3).map((cond) => (
              <span key={cond} className="px-2 py-1 rounded-md bg-neutral-800 text-xs text-neutral-300">{cond}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Robot Companion */}
      <RobotCompanion state={robotState} message={robotMessage} name={profile?.device_name} />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Pill className="w-5 h-5" />}
          label="Medications Today"
          value={`${takenCount}/${activeCount}`}
          color="primary"
          subtitle={`${activeCount - takenCount} remaining`}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Next Reminder"
          value={nextMed ? formatTime(nextMed.scheduled_time) : 'None'}
          color="secondary"
          subtitle={nextMed ? `${nextMed.name}` : 'All taken'}
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Overdue"
          value={overdueMeds.length.toString()}
          color={overdueMeds.length > 0 ? 'warning' : 'success'}
          subtitle={overdueMeds.length > 0 ? 'Needs attention' : 'On track'}
        />
        <StatCard
          icon={<Heart className="w-5 h-5" />}
          label="Health Status"
          value="Stable"
          color="success"
          subtitle="No alerts active"
        />
      </div>

      {/* Next medication highlight & recent alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Next medication detail */}
        {nextMed && (
          <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-400 mb-4 uppercase tracking-wide">Next Medication</h3>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                nextMed.color === 'blue' ? 'bg-primary-500/20' :
                nextMed.color === 'green' ? 'bg-success-500/20' :
                nextMed.color === 'purple' ? 'bg-neutral-700' :
                nextMed.color === 'orange' ? 'bg-accent-500/20' : 'bg-neutral-700'
              }`}>
                <Pill className={`w-6 h-6 ${
                  nextMed.color === 'blue' ? 'text-primary-400' :
                  nextMed.color === 'green' ? 'text-success-400' :
                  nextMed.color === 'orange' ? 'text-accent-400' : 'text-neutral-300'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-neutral-50">{nextMed.name}</h4>
                <p className="text-sm text-neutral-400">{nextMed.dosage} • {formatTime(nextMed.scheduled_time)}</p>
                {nextMed.instructions && <p className="text-xs text-neutral-500 mt-1">{nextMed.instructions}</p>}
              </div>
              {minutesUntil !== null && minutesUntil <= 15 && (
                <button
                  onClick={() => onTriggerReminder(nextMed.id)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  Remind Now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Recent alerts */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-400 mb-4 uppercase tracking-wide">Recent Activity</h3>
          <div className="space-y-3">
            {recentAlerts.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-4">No recent activity</p>
            )}
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.severity === 'critical' ? 'bg-error-500' :
                  alert.severity === 'high' ? 'bg-error-400' :
                  alert.severity === 'medium' ? 'bg-warning-400' :
                  alert.severity === 'low' ? 'bg-success-400' : 'bg-neutral-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-200 truncate">{alert.title}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's medication schedule */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-400 mb-4 uppercase tracking-wide">Today's Schedule</h3>
        <div className="space-y-2">
          {medications.filter((m) => m.is_active).map((med) => {
            const overdue = isMedicationOverdue(med);
            return (
              <div key={med.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                med.taken_today ? 'bg-success-950/20 border border-success-900/30' :
                overdue ? 'bg-warning-950/20 border border-warning-900/30' :
                'bg-neutral-800/50 border border-neutral-800'
              }`}>
                <div className="flex items-center gap-2 w-24">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm font-mono text-neutral-300">{formatTime(med.scheduled_time)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-neutral-100">{med.name}</span>
                  <span className="text-xs text-neutral-500 ml-2">{med.dosage}</span>
                </div>
                {med.taken_today ? (
                  <span className="flex items-center gap-1 text-xs text-success-400 font-medium">
                    <CheckCircle className="w-4 h-4" /> Taken
                  </span>
                ) : overdue ? (
                  <button
                    onClick={() => onTriggerReminder(med.id)}
                    className="flex items-center gap-1 text-xs text-warning-400 font-medium hover:text-warning-300 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" /> Remind Now
                  </button>
                ) : (
                  <span className="text-xs text-neutral-500">Pending</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, subtitle }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  subtitle: string;
}) {
  const colors = {
    primary: 'text-primary-400 bg-primary-500/10',
    secondary: 'text-secondary-400 bg-secondary-500/10',
    success: 'text-success-400 bg-success-500/10',
    warning: 'text-warning-400 bg-warning-500/10',
    error: 'text-error-400 bg-error-500/10',
  };

  return (
    <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-neutral-50">{value}</p>
      <p className="text-sm text-neutral-400 mt-0.5">{label}</p>
      <p className="text-xs text-neutral-600 mt-1">{subtitle}</p>
    </div>
  );
}
