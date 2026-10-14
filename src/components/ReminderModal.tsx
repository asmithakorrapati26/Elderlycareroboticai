import { useState, useEffect } from 'react';
import { Pill, Clock, X, CheckCircle, AlertTriangle, Phone, Hospital, Heart } from 'lucide-react';
import { RobotAvatar } from './RobotAvatar';
import type { Medication, EmergencyContact, Hospital as HospitalType, AppSettings } from '@/types';
import { formatTime } from '@/lib/utils';

export type EscalationStage = 'reminder' | 'waiting_response' | 'checkin' | 'checkin_waiting' | 'escalating' | 'emergency_escalation' | 'resolved' | 'dismissed';

interface ReminderModalProps {
  medication: Medication;
  contacts: EmergencyContact[];
  hospitals: HospitalType[];
  settings: AppSettings | null;
  onClose: () => void;
  onTaken: () => void;
  onLogAlert: (alert: {
    alert_type: string;
    severity: string;
    title: string;
    description?: string | null;
    status?: string;
    medication_id?: string | null;
    contact_id?: string | null;
    hospital_id?: string | null;
  }) => Promise<unknown>;
  onMarkTaken: () => Promise<unknown>;
}

export function ReminderModal({
  medication,
  contacts,
  hospitals,
  settings,
  onClose,
  onTaken,
  onLogAlert,
  onMarkTaken,
}: ReminderModalProps) {
  const [stage, setStage] = useState<EscalationStage>('reminder');
  const [countdown, setCountdown] = useState(settings?.reminder_wait_seconds ?? 30);
  const [escalatedContacts, setEscalatedContacts] = useState<string[]>([]);
  const [escalatedHospitals, setEscalatedHospitals] = useState<string[]>([]);

  const reminderWait = settings?.reminder_wait_seconds ?? 30;
  const checkinWait = settings?.checkin_wait_seconds ?? 20;
  const escalationWait = settings?.escalation_wait_seconds ?? 30;

  // Countdown for reminder stage
  useEffect(() => {
    if (stage === 'reminder' || stage === 'waiting_response' || stage === 'checkin_waiting') {
      if (countdown <= 0) {
        if (stage === 'reminder') {
          setStage('waiting_response');
          setCountdown(reminderWait);
        } else if (stage === 'waiting_response') {
          setStage('checkin');
        } else if (stage === 'checkin_waiting') {
          setStage('escalating');
          setCountdown(escalationWait);
        }
        return;
      }
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, stage, reminderWait, checkinWait, escalationWait]);

  // Escalation stage - auto-escalate
  useEffect(() => {
    if (stage === 'escalating') {
      // Start escalating to contacts
      const primaryContact = contacts.find((c) => c.is_primary) ?? contacts[0];
      if (primaryContact && !escalatedContacts.includes(primaryContact.id)) {
        setEscalatedContacts([primaryContact.id]);
        onLogAlert({
          alert_type: 'emergency',
          severity: 'high',
          title: `Emergency Contact Notified: ${primaryContact.name}`,
          description: `CareBot contacted ${primaryContact.name} (${primaryContact.relationship}) at ${primaryContact.phone} regarding missed medication: ${medication.name}`,
          status: 'active',
          medication_id: medication.id,
          contact_id: primaryContact.id,
        });
      }
      // After some time, escalate to hospital
      const hospitalTimer = setTimeout(() => {
        const nearestHospital = hospitals.find((h) => h.emergency_services) ?? hospitals[0];
        if (nearestHospital && !escalatedHospitals.includes(nearestHospital.id)) {
          setEscalatedHospitals([nearestHospital.id]);
          onLogAlert({
            alert_type: 'emergency',
            severity: 'critical',
            title: `Hospital Alerted: ${nearestHospital.name}`,
            description: `CareBot alerted ${nearestHospital.name} (${nearestHospital.phone}) for emergency response. Patient may have missed ${medication.name} (${medication.dosage}).`,
            status: 'active',
            medication_id: medication.id,
            hospital_id: nearestHospital.id,
          });
          setStage('emergency_escalation');
        }
      }, 8000);
      return () => clearTimeout(hospitalTimer);
    }
  }, [stage, contacts, hospitals, medication, onLogAlert, escalatedContacts, escalatedHospitals]);

  // Auto-progress from checkin
  useEffect(() => {
    if (stage === 'checkin') {
      const timer = setTimeout(() => {
        setStage('checkin_waiting');
        setCountdown(checkinWait);
        onLogAlert({
          alert_type: 'health_checkin',
          severity: 'medium',
          title: `Health Check-in Initiated`,
          description: `CareBot asked patient if they are feeling okay after missing ${medication.name}. Waiting for response...`,
          status: 'active',
          medication_id: medication.id,
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage, medication, checkinWait, onLogAlert]);

  const handleTaken = async () => {
    await onMarkTaken();
    await onLogAlert({
      alert_type: 'medication_reminder',
      severity: 'low',
      title: `Medication Taken: ${medication.name}`,
      description: `Patient confirmed taking ${medication.name} (${medication.dosage}) at ${formatTime(new Date().toTimeString().slice(0, 5))}`,
      status: 'resolved',
      medication_id: medication.id,
    });
    onTaken();
  };

  const handleImFine = async () => {
    await onLogAlert({
      alert_type: 'health_checkin',
      severity: 'low',
      title: `Patient Responded: I'm Fine`,
      description: `Patient confirmed they are okay. ${medication.name} was acknowledged but not yet taken.`,
      status: 'acknowledged',
      medication_id: medication.id,
    });
    setStage('reminder');
    setCountdown(reminderWait);
  };

  const handleImNotOkay = async () => {
    const primaryContact = contacts.find((c) => c.is_primary) ?? contacts[0];
    if (primaryContact) {
      setEscalatedContacts([primaryContact.id]);
      await onLogAlert({
        alert_type: 'emergency',
        severity: 'critical',
        title: `PATIENT NOT OKAY - Emergency Alert`,
        description: `Patient indicated they are NOT okay. ${primaryContact.name} (${primaryContact.relationship}) has been contacted immediately. Medication: ${medication.name}.`,
        status: 'active',
        medication_id: medication.id,
        contact_id: primaryContact.id,
      });
    }
    const nearestHospital = hospitals.find((h) => h.emergency_services) ?? hospitals[0];
    if (nearestHospital) {
      setEscalatedHospitals([nearestHospital.id]);
      await onLogAlert({
        alert_type: 'emergency',
        severity: 'critical',
        title: `Emergency Hospital Dispatch: ${nearestHospital.name}`,
        description: `Patient reported distress. ${nearestHospital.name} has been alerted for emergency dispatch.`,
        status: 'active',
        hospital_id: nearestHospital.id,
      });
    }
    setStage('emergency_escalation');
  };

  const handleDismiss = () => {
    onLogAlert({
      alert_type: 'medication_reminder',
      severity: 'low',
      title: `Reminder Dismissed: ${medication.name}`,
      description: `Caregiver dismissed the medication reminder for ${medication.name}.`,
      status: 'resolved',
      medication_id: medication.id,
    });
    onClose();
  };

  const robotState =
    stage === 'emergency_escalation' || stage === 'escalating' ? 'emergency' :
    stage === 'checkin' || stage === 'checkin_waiting' ? 'alert' :
    stage === 'resolved' ? 'happy' : 'speaking';

  const showCountdown = stage === 'reminder' || stage === 'waiting_response' || stage === 'checkin_waiting' || stage === 'escalating';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg bg-neutral-900 rounded-3xl border-2 ${
        stage === 'emergency_escalation' ? 'border-error-500/50' :
        stage === 'escalating' || stage === 'checkin_waiting' ? 'border-warning-500/40' :
        'border-primary-500/30'
      } shadow-2xl animate-scale-in overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${
          stage === 'emergency_escalation' ? 'bg-error-950/50' :
          stage === 'escalating' || stage === 'checkin_waiting' ? 'bg-warning-950/40' :
          'bg-primary-950/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              stage === 'emergency_escalation' ? 'bg-error-500/20' :
              stage === 'escalating' || stage === 'checkin_waiting' ? 'bg-warning-500/20' :
              'bg-primary-500/20'
            }`}>
              <Pill className={`w-5 h-5 ${
                stage === 'emergency_escalation' ? 'text-error-400' :
                stage === 'escalating' || stage === 'checkin_waiting' ? 'text-warning-400' :
                'text-primary-400'
              }`} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-50">{medication.name}</h3>
              <p className="text-xs text-neutral-400">{medication.dosage} • Scheduled {formatTime(medication.scheduled_time)}</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-neutral-500 hover:text-neutral-200 transition-colors p-1 rounded-lg hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Robot */}
          <div className="flex flex-col items-center gap-3">
            <div className={stage === 'escalating' || stage === 'emergency_escalation' ? 'animate-shake' : ''}>
              <RobotAvatar state={robotState} size="xl" />
            </div>
            <p className="text-center text-sm text-neutral-300 max-w-sm leading-relaxed min-h-[2.5rem]">
              {stage === 'reminder' && `It's time to take your ${medication.name}. Please take ${medication.dosage} now.`}
              {stage === 'waiting_response' && `I'm waiting for you to take your medication. Please confirm once you've taken it.`}
              {stage === 'checkin' && `I noticed you haven't taken your ${medication.name} yet. Are you feeling okay?`}
              {stage === 'checkin_waiting' && `Please let me know if you're alright. I'm waiting for your response...`}
              {stage === 'escalating' && `No response received. I'm contacting your emergency contacts now. Please respond if you can hear me.`}
              {stage === 'emergency_escalation' && `Emergency alert sent! Your contacts and nearest hospital have been notified. Help is on the way.`}
              {stage === 'resolved' && `Medication confirmed. Everything is on track. Stay healthy!`}
            </p>
          </div>

          {/* Countdown */}
          {showCountdown && (
            <div className="flex items-center justify-center gap-2">
              <Clock className={`w-4 h-4 ${
                stage === 'escalating' ? 'text-error-400' :
                stage === 'checkin_waiting' ? 'text-warning-400' :
                'text-primary-400'
              }`} />
              <span className={`text-sm font-mono font-semibold ${
                stage === 'escalating' ? 'text-error-400' :
                stage === 'checkin_waiting' ? 'text-warning-400' :
                'text-primary-400'
              }`}>
                {countdown}s remaining
              </span>
              <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    stage === 'escalating' ? 'bg-error-500' :
                    stage === 'checkin_waiting' ? 'bg-warning-500' :
                    'bg-primary-500'
                  }`}
                  style={{ width: `${(countdown / (stage === 'escalating' ? escalationWait : stage === 'checkin_waiting' ? checkinWait : reminderWait)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(stage === 'reminder' || stage === 'waiting_response') && (
            <div className="space-y-3">
              <button
                onClick={handleTaken}
                className="w-full py-3.5 bg-success-600 hover:bg-success-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-success-600/20"
              >
                <CheckCircle className="w-5 h-5" />
                I've Taken My Medicine
              </button>
              <p className="text-center text-xs text-neutral-500">
                {medication.instructions && `Instructions: ${medication.instructions}`}
              </p>
            </div>
          )}

          {stage === 'checkin' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleImFine}
                className="py-3.5 bg-success-600 hover:bg-success-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Heart className="w-5 h-5" />
                I'm Fine
              </button>
              <button
                onClick={handleImNotOkay}
                className="py-3.5 bg-error-600 hover:bg-error-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] animate-pulse"
              >
                <AlertTriangle className="w-5 h-5" />
                I Need Help
              </button>
            </div>
          )}

          {stage === 'checkin_waiting' && (
            <div className="flex flex-col items-center gap-2 py-2">
              <p className="text-sm text-warning-400 font-medium">Waiting for response...</p>
              <div className="flex gap-3">
                <button
                  onClick={handleImFine}
                  className="px-5 py-2.5 bg-success-600/80 hover:bg-success-600 text-white text-sm font-medium rounded-lg transition-all"
                >
                  I'm Fine
                </button>
                <button
                  onClick={handleImNotOkay}
                  className="px-5 py-2.5 bg-error-600/80 hover:bg-error-600 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Need Help
                </button>
              </div>
            </div>
          )}

          {stage === 'escalating' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-error-400 font-medium animate-blink">
                <AlertTriangle className="w-4 h-4" />
                Escalating to emergency contacts...
              </div>
              {contacts.slice(0, 2).map((contact) => (
                <div key={contact.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  escalatedContacts.includes(contact.id) ? 'bg-error-950/40 border border-error-800' : 'bg-neutral-800/50'
                }`}>
                  <Phone className={`w-4 h-4 ${escalatedContacts.includes(contact.id) ? 'text-error-400' : 'text-neutral-500'}`} />
                  <span className="text-sm text-neutral-200">{contact.name}</span>
                  <span className="text-xs text-neutral-500 ml-auto">{contact.relationship}</span>
                  {escalatedContacts.includes(contact.id) && (
                    <span className="text-xs text-error-400 font-medium animate-fade-in">Contacted</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {stage === 'emergency_escalation' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error-950/40 border border-error-800">
                <AlertTriangle className="w-4 h-4 text-error-400 animate-pulse" />
                <span className="text-sm text-error-300 font-medium">Emergency Alert Active</span>
              </div>
              {contacts.filter((c) => escalatedContacts.includes(c.id)).map((contact) => (
                <div key={contact.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error-950/30 border border-error-900">
                  <Phone className="w-4 h-4 text-error-400" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-neutral-200">{contact.name}</span>
                    <span className="text-xs text-neutral-500 ml-2">{contact.phone}</span>
                  </div>
                  <span className="text-xs text-success-400 font-medium">Notified</span>
                </div>
              ))}
              {hospitals.filter((h) => escalatedHospitals.includes(h.id)).map((hospital) => (
                <div key={hospital.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error-950/30 border border-error-900">
                  <Hospital className="w-4 h-4 text-error-400" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-neutral-200">{hospital.name}</span>
                    <span className="text-xs text-neutral-500 ml-2">{hospital.phone}</span>
                  </div>
                  <span className="text-xs text-success-400 font-medium">Alerted</span>
                </div>
              ))}
              <button
                onClick={() => { handleTaken(); onClose(); }}
                className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 text-neutral-100 font-medium rounded-xl transition-all"
              >
                Acknowledge & Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
