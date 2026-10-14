import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  PatientProfile,
  Medication,
  EmergencyContact,
  Hospital,
  AlertLog,
  AppSettings,
} from '@/types';

export function usePatientProfile() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('patient_profile')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setProfile(data as PatientProfile | null);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (updates: Partial<PatientProfile>) => {
    if (!profile) return;
    const { data } = await supabase
      .from('patient_profile')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', profile.id)
      .select()
      .maybeSingle();
    if (data) setProfile(data as PatientProfile);
  }, [profile]);

  return { profile, loading, update, refetch: fetch };
}

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('medications')
      .select('*')
      .order('scheduled_time', { ascending: true });
    setMedications((data as Medication[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (med: Omit<Medication, 'id' | 'created_at' | 'updated_at' | 'taken_today' | 'last_taken_at' | 'is_active'>) => {
    const { data } = await supabase
      .from('medications')
      .insert({ ...med, is_active: true, taken_today: false })
      .select()
      .maybeSingle();
    if (data) setMedications((prev) => [...prev, data as Medication].sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time)));
    return data;
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Medication>) => {
    const { data } = await supabase
      .from('medications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (data) {
      setMedications((prev) => prev.map((m) => (m.id === id ? (data as Medication) : m)).sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time)));
    }
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.from('medications').delete().eq('id', id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { medications, loading, create, update, remove, refetch: fetch };
}

export function useEmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('emergency_contacts')
      .select('*')
      .order('priority', { ascending: true });
    setContacts((data as EmergencyContact[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (contact: Omit<EmergencyContact, 'id' | 'created_at'>) => {
    const { data } = await supabase
      .from('emergency_contacts')
      .insert(contact)
      .select()
      .maybeSingle();
    if (data) setContacts((prev) => [...prev, data as EmergencyContact].sort((a, b) => a.priority - b.priority));
    return data;
  }, []);

  const update = useCallback(async (id: string, updates: Partial<EmergencyContact>) => {
    const { data } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (data) {
      setContacts((prev) => prev.map((c) => (c.id === id ? (data as EmergencyContact) : c)).sort((a, b) => a.priority - b.priority));
    }
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.from('emergency_contacts').delete().eq('id', id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { contacts, loading, create, update, remove, refetch: fetch };
}

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hospitals')
      .select('*')
      .order('distance_km', { ascending: true });
    setHospitals((data as Hospital[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (hosp: Omit<Hospital, 'id' | 'created_at'>) => {
    const { data } = await supabase
      .from('hospitals')
      .insert(hosp)
      .select()
      .maybeSingle();
    if (data) setHospitals((prev) => [...prev, data as Hospital].sort((a, b) => a.distance_km - b.distance_km));
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.from('hospitals').delete().eq('id', id);
    setHospitals((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return { hospitals, loading, create, remove, refetch: fetch };
}

export function useAlertLog() {
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('alert_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setAlerts((data as AlertLog[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (alert: {
    alert_type: string;
    severity: string;
    title: string;
    description?: string | null;
    status?: string;
    medication_id?: string | null;
    contact_id?: string | null;
    hospital_id?: string | null;
  }) => {
    const { data } = await supabase
      .from('alert_log')
      .insert({
        ...alert,
        status: alert.status ?? 'active',
      })
      .select()
      .maybeSingle();
    if (data) setAlerts((prev) => [data as AlertLog, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: string, updates: Partial<AlertLog>) => {
    const { data } = await supabase
      .from('alert_log')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (data) setAlerts((prev) => prev.map((a) => (a.id === id ? (data as AlertLog) : a)));
    return data;
  }, []);

  return { alerts, loading, create, update, refetch: fetch };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('app_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setSettings(data as AppSettings | null);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const update = useCallback(async (updates: Partial<AppSettings>) => {
    if (!settings) return;
    const { data } = await supabase
      .from('app_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .maybeSingle();
    if (data) setSettings(data as AppSettings);
  }, [settings]);

  return { settings, loading, update, refetch: fetch };
}
