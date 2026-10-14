import { Bell, AlertTriangle, Phone, Hospital, CheckCircle, Heart, Clock, Activity, X } from 'lucide-react';
import { useAlertLog } from '@/hooks/useData';
import { formatRelative } from '@/lib/utils';
import type { AlertLog as AlertLogType } from '@/types';

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  low: { color: 'text-success-400', bg: 'bg-success-950/30', border: 'border-success-900/40', icon: <CheckCircle className="w-4 h-4" /> },
  medium: { color: 'text-warning-400', bg: 'bg-warning-950/30', border: 'border-warning-900/40', icon: <Bell className="w-4 h-4" /> },
  high: { color: 'text-error-400', bg: 'bg-error-950/30', border: 'border-error-900/40', icon: <AlertTriangle className="w-4 h-4" /> },
  critical: { color: 'text-error-400', bg: 'bg-error-950/50', border: 'border-error-800', icon: <AlertTriangle className="w-4 h-4" /> },
  info: { color: 'text-primary-400', bg: 'bg-primary-950/30', border: 'border-primary-900/40', icon: <Activity className="w-4 h-4" /> },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  active: { color: 'text-error-400 bg-error-500/15', label: 'Active' },
  acknowledged: { color: 'text-warning-400 bg-warning-500/15', label: 'Acknowledged' },
  escalated: { color: 'text-error-400 bg-error-500/20', label: 'Escalated' },
  resolved: { color: 'text-success-400 bg-success-500/15', label: 'Resolved' },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  medication_reminder: <Bell className="w-5 h-5" />,
  health_checkin: <Heart className="w-5 h-5" />,
  missed_medication: <AlertTriangle className="w-5 h-5" />,
  emergency: <Phone className="w-5 h-5" />,
  system: <Activity className="w-5 h-5" />,
};

export function AlertHistory() {
  const { alerts, loading, update } = useAlertLog();

  const resolveAlert = async (alert: AlertLogType) => {
    await update(alert.id, { status: 'resolved', resolved_at: new Date().toISOString() });
  };

  // Group alerts by date
  const grouped: Record<string, AlertLogType[]> = {};
  for (const alert of alerts) {
    const date = new Date(alert.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(alert);
  }

  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-neutral-50">Alert History</h2>
        <p className="text-sm text-neutral-400 mt-1">
          {alerts.length} total alerts • {activeCount} active • {criticalCount} high/critical
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total" value={alerts.length} icon={<Bell className="w-4 h-4" />} color="text-primary-400 bg-primary-500/10" />
        <SummaryCard label="Active" value={activeCount} icon={<AlertTriangle className="w-4 h-4" />} color="text-error-400 bg-error-500/10" />
        <SummaryCard label="Resolved" value={alerts.filter((a) => a.status === 'resolved').length} icon={<CheckCircle className="w-4 h-4" />} color="text-success-400 bg-success-500/10" />
        <SummaryCard label="Critical" value={criticalCount} icon={<Hospital className="w-4 h-4" />} color="text-warning-400 bg-warning-500/10" />
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="text-center py-12 text-neutral-500">Loading alert history...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 rounded-2xl border border-neutral-800">
          <Bell className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-400">No alerts recorded yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateAlerts]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-neutral-500 mb-3 uppercase tracking-wide">{date}</h3>
              <div className="space-y-3">
                {dateAlerts.map((alert) => {
                  const sev = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;
                  const status = STATUS_CONFIG[alert.status] ?? STATUS_CONFIG_CONFIG_FALLBACK;
                  return (
                    <div key={alert.id} className={`rounded-2xl p-5 border ${sev.bg} ${sev.border} transition-all hover:border-neutral-700`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sev.color} bg-neutral-900/50`}>
                          {TYPE_ICONS[alert.alert_type] ?? <Bell className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-neutral-100">{alert.title}</h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${status.color}`}>{status.label}</span>
                              <span className={`text-xs font-medium ${sev.color} capitalize`}>{alert.severity}</span>
                            </div>
                          </div>
                          {alert.description && (
                            <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{alert.description}</p>
                          )}
                          <div className="flex items-center gap-1.5 mt-2">
                            <Clock className="w-3 h-3 text-neutral-600" />
                            <span className="text-xs text-neutral-500">{formatRelative(alert.created_at)}</span>
                            {alert.resolved_at && (
                              <span className="text-xs text-success-500 ml-2">Resolved {formatRelative(alert.resolved_at)}</span>
                            )}
                          </div>
                        </div>
                        {alert.status === 'active' && (
                          <button
                            onClick={() => resolveAlert(alert)}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-all flex items-center gap-1 flex-shrink-0"
                          >
                            <X className="w-3 h-3" /> Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_CONFIG_CONFIG_FALLBACK = { color: 'text-neutral-400 bg-neutral-700', label: 'Unknown' };

function SummaryCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>{icon}</div>
      <p className="text-xl font-bold text-neutral-50">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
