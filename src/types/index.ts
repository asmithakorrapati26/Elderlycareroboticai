export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  blood_type: string;
  medical_conditions: string[];
  allergies: string[];
  avatar_url: string | null;
  room_number: string | null;
  device_name: string;
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  scheduled_time: string;
  frequency: string;
  instructions: string | null;
  color: string;
  taken_today: boolean;
  last_taken_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
  is_primary: boolean;
  avatar_color: string;
  created_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  distance_km: number;
  phone: string;
  address: string | null;
  emergency_services: boolean;
  created_at: string;
}

export type AlertType = 'medication_reminder' | 'health_checkin' | 'missed_medication' | 'emergency' | 'system';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'escalated' | 'resolved';

export interface AlertLog {
  id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string | null;
  status: AlertStatus;
  medication_id: string | null;
  contact_id: string | null;
  hospital_id: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface AppSettings {
  id: string;
  reminder_wait_seconds: number;
  checkin_wait_seconds: number;
  escalation_wait_seconds: number;
  voice_enabled: boolean;
  auto_escalate: boolean;
  created_at: string;
  updated_at: string;
}
