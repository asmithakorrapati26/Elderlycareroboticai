import type { Medication } from '@/types';

export function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

export function formatClock(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelative(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(isoDate).toLocaleDateString();
}

export function getNextMedication(medications: Medication[]): Medication | null {
  const active = medications.filter((m) => m.is_active && !m.taken_today);
  if (active.length === 0) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find next medication after current time
  const upcoming = active
    .map((m) => {
      const [h, min] = m.scheduled_time.split(':').map(Number);
      return { med: m, minutes: h * 60 + min };
    })
    .sort((a, b) => a.minutes - b.minutes);

  const next = upcoming.find((u) => u.minutes >= currentMinutes);
  return next ? next.med : upcoming[0].med;
}

export function getMinutesUntil(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() < now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return Math.round((target.getTime() - now.getTime()) / 60000);
}

export function isMedicationDue(med: Medication): boolean {
  if (med.taken_today || !med.is_active) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [h, m] = med.scheduled_time.split(':').map(Number);
  const medMinutes = h * 60 + m;
  return currentMinutes >= medMinutes && currentMinutes <= medMinutes + 60;
}

export function isMedicationOverdue(med: Medication): boolean {
  if (med.taken_today || !med.is_active) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [h, m] = med.scheduled_time.split(':').map(Number);
  const medMinutes = h * 60 + m;
  return currentMinutes > medMinutes + 5;
}
