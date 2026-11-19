'use client';

import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Users,
  AlertCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';

export default function ClinicAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Booking Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('doc_01');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-20');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      loadSlots(selectedDoctorId, selectedDate);
    }
  }, [selectedDoctorId, selectedDate]);

  async function loadDoctors() {
    try {
      const res = await fetch('/api/clinic/doctors?workspaceId=ws_clinic_01');
      if (res.ok) {
        const d = await res.json();
        setDoctors(d.doctors || []);
        if (d.doctors && d.doctors.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(d.doctors[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load doctors', e);
    }
  }

  async function loadSlots(docId: string, date: string) {
    try {
      const res = await fetch(`/api/clinic/slots?workspaceId=ws_clinic_01&doctorId=${docId}&date=${date}`);
      if (res.ok) {
        const d = await res.json();
        setSlots(d.slots || []);
        const firstAvail = (d.slots || []).find((s: any) => s.is_booked === 0);
        if (firstAvail) setSelectedSlotId(firstAvail.id);
      }
    } catch (e) {
      console.error('Failed to load slots', e);
    }
  }

  async function loadAppointments() {
    setLoading(true);
    try {
      const res = await fetch('/api/clinic/appointments?workspaceId=ws_clinic_01');
      if (res.ok) {
        const d = await res.json();
        setAppointments(d.appointments || []);
      }
    } catch (e) {
      console.error('Failed to load appointments', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleBookAppointment() {
    setErrorMessage(null);

    // Client-side privacy guard test
    const lowerNotes = patientNotes.toLowerCase();
    if (
      lowerNotes.includes('fever') ||
      lowerNotes.includes('symptom') ||
      lowerNotes.includes('cough') ||
      lowerNotes.includes('pain') ||
      lowerNotes.includes('prescription')
    ) {
      setErrorMessage(
        'Privacy violation: ZYVO handles non-diagnostic appointment scheduling only. Medical symptoms or clinical data must not be entered.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/clinic/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BOOK_APPOINTMENT',
          workspaceId: 'ws_clinic_01',
          patientId: 'user_customer_01',
          doctorId: selectedDoctorId,
          slotId: selectedSlotId || undefined,
          appointmentDate: selectedDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.result?.summary || 'Appointment confirmed successfully!');
        setPatientNotes('');
        await loadSlots(selectedDoctorId, selectedDate);
        await loadAppointments();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to book appointment');
      }
    } catch (e: any) {
      setErrorMessage('Network error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelAppointment(appointmentId: string) {
    if (!confirm('Are you sure you want to cancel this appointment? The reserved slot will be freed immediately.')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/clinic/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CANCEL_APPOINTMENT',
          workspaceId: 'ws_clinic_01',
          appointmentId,
        }),
      });

      if (res.ok) {
        setActionSuccess(`Appointment ${appointmentId} cancelled and slot released`);
        await loadSlots(selectedDoctorId, selectedDate);
        await loadAppointments();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        const d = await res.json();
        alert('Error: ' + d.error);
      }
    } catch (e: any) {
      alert('Network error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#F1EADE]">Clinic Outpatient Scheduling</h1>
              <ModuleStatusBadge status="active" />
            </div>
            <p className="text-xs text-[#8B9CB5] mt-1">
              Arogya Community Health Clinic · Outpatient slots, doctor schedules, and non-diagnostic privacy boundaries
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#151415] p-1 rounded-xl border border-[#2A2C30]">
          <button
            onClick={() => setActiveTab('patient')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
              activeTab === 'patient'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Patient Slot Booking
          </button>
          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] ${
              activeTab === 'doctor'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[#8B9CB5] hover:text-[#F1EADE]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Doctor Daily Manifest
          </button>
        </div>
      </div>

      {/* Non-Diagnostic Privacy Banner */}
      <div className="p-4 bg-blue-950/20 border border-blue-800/40 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-semibold text-blue-200">
            Strict Non-Diagnostic Operational Boundary
          </div>
          <p className="text-xs text-[#8B9CB5] leading-relaxed">
            ZYVO operates strictly as an administrative scheduling engine. Voice submissions and forms are processed only for outpatient doctor slot availability, booking, rescheduling, and cancellation. Clinical symptoms, medical notes, diagnostics, and prescriptions are strictly ignored and never persisted.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Voice Action Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#F1EADE] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Natural Speech Clinic Scheduling (Hinglish/Hindi/English)
          </h2>
          <span className="text-[10px] text-[#8B9CB5] font-mono">Deterministic Intent Router Ready</span>
        </div>
        <VoiceActionCard
          verticalType="clinic"
          workspaceId="ws_clinic_01"
          samples={[
            {
              language: 'Hinglish',
              text: 'Dr. Ramesh Rao ke saath kal subah 10 baje ka appointment book kar do',
              intent: 'BOOK_APPOINTMENT',
            },
            {
              language: 'Hindi',
              text: 'डॉ. रमेश राव के साथ कल का अपॉइंटमेंट बुक कर दीजिए',
              intent: 'BOOK_APPOINTMENT',
            },
            {
              language: 'English',
              text: 'Cancel my appointment with Dr. Ramesh Rao',
              intent: 'CANCEL_APPOINTMENT',
            },
          ]}
          onTransactionApplied={loadAppointments}
        />
      </div>

      {/* PATIENT TAB */}
      {activeTab === 'patient' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctor Directory */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#F1EADE]">Available Attending Physicians</h3>
                <p className="text-xs text-[#8B9CB5]">Select a physician to view outpatient slots and schedule a consultation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {doctors.map((doc) => {
                  const isSelected = doc.id === selectedDoctorId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-950/20 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                          : 'bg-[#151415] border-[#2A2C30] hover:border-blue-500/40'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-[#8B9CB5] uppercase">{doc.department}</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            ₹{(doc.consultation_fee_paise / 100).toFixed(0)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#F1EADE]">{doc.name}</h4>
                        <p className="text-[11px] text-[#8B9CB5] font-mono">
                          Schedule: {doc.available_days}
                        </p>
                        <p className="text-[11px] text-[#8B9CB5] font-mono">
                          Hours: {doc.start_time.slice(0, 5)} - {doc.end_time.slice(0, 5)}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#2A2C30] flex items-center justify-between text-xs">
                        <span className={isSelected ? 'text-blue-400 font-semibold' : 'text-[#8B9CB5]'}>
                          {isSelected ? 'Selected Physician' : 'Click to select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doctor Slots Grid */}
            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#F1EADE]">
                    Outpatient Slots for {selectedDoctor?.name || 'Doctor'}
                  </h3>
                  <p className="text-xs text-[#8B9CB5]">Choose an available time slot</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8B9CB5]">Date:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-[#151415] border border-[#2A2C30] rounded-lg px-2.5 py-1.5 text-xs text-[#F1EADE] font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {slots.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
                  No predefined slots found for this date. Booking will automatically allocate the next available outpatient slot.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {slots.map((s) => {
                    const isSelected = s.id === selectedSlotId;
                    const isBooked = s.is_booked === 1;

                    return (
                      <button
                        key={s.id}
                        disabled={isBooked}
                        onClick={() => setSelectedSlotId(s.id)}
                        className={`p-3 rounded-xl border text-left transition-all min-h-[44px] ${
                          isBooked
                            ? 'bg-[#151415]/50 border-rose-950/40 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-950/30 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                            : 'bg-[#151415] border-[#2A2C30] text-[#F1EADE] hover:border-blue-500/40'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold">
                          {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                        </div>
                        <div className="text-[10px] mt-1">
                          {isBooked ? (
                            <span className="text-rose-400 font-medium">Booked</span>
                          ) : (
                            <span className="text-emerald-400 font-medium">Available</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-[#F1EADE]">Booking Confirmation</h3>
              </div>

              <div className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8B9CB5]">Physician</span>
                  <span className="text-[#F1EADE] font-semibold">{selectedDoctor?.name || 'Selected Doctor'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B9CB5]">Department</span>
                  <span className="text-[#F1EADE]">{selectedDoctor?.department || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B9CB5]">Date</span>
                  <span className="text-[#F1EADE] font-mono">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B9CB5]">Consultation Fee</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    ₹{((selectedDoctor?.consultation_fee_paise || 30000) / 100).toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#8B9CB5]">Administrative Note (Non-Diagnostic)</label>
                <input
                  type="text"
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  placeholder="e.g. Regular health checkup or followup"
                  className="w-full bg-[#151415] border border-[#2A2C30] rounded-lg px-3 py-2 text-xs text-[#F1EADE] focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-[#8B9CB5]">
                  Strictly administrative. Entering medical symptoms will trigger rejection.
                </p>
              </div>

              <button
                onClick={handleBookAppointment}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-h-[44px] shadow-lg shadow-blue-950/40"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Appointment (₹{((selectedDoctor?.consultation_fee_paise || 30000) / 100).toFixed(0)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR / OPERATOR TAB */}
      {activeTab === 'doctor' && (
        <div className="space-y-6">
          <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-semibold text-[#F1EADE]">Clinic Outpatient Schedule Manifest</h3>
                  <p className="text-xs text-[#8B9CB5]">All registered patient bookings and administrative statuses</p>
                </div>
              </div>
              <button
                onClick={loadAppointments}
                className="p-2 text-[#8B9CB5] hover:text-[#F1EADE] transition-colors"
                title="Refresh schedule"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
                No active appointments booked in this clinic.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                    <tr>
                      <th className="p-3">Appointment ID</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Fee</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2C30] font-mono">
                    {appointments.map((a) => (
                      <tr key={a.id} className="hover:bg-[#242528]/40">
                        <td className="p-3 text-[#F1EADE] font-bold">{a.id}</td>
                        <td className="p-3 text-[#F1EADE]">
                          {a.patient_name}
                          <span className="block text-[10px] text-[#8B9CB5] font-normal">{a.patient_phone}</span>
                        </td>
                        <td className="p-3 text-[#8B9CB5]">
                          {a.doctor_name}
                          <span className="block text-[10px] text-[#8B9CB5]">{a.department}</span>
                        </td>
                        <td className="p-3 text-[#F1EADE]">
                          {a.appointment_date}
                          <span className="block text-[11px] text-blue-400 font-bold">{a.time_slot}</span>
                        </td>
                        <td className="p-3 text-emerald-400 font-bold">
                          ₹{(a.consultation_fee_paise / 100).toFixed(0)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              a.status === 'CONFIRMED'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                : 'bg-rose-950/60 text-rose-300 border-rose-800'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {a.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCancelAppointment(a.id)}
                              className="px-2.5 py-1 rounded bg-[#2A2C30] hover:bg-rose-900/60 text-rose-300 text-[11px] font-medium transition-all min-h-[36px]"
                            >
                              Cancel & Free Slot
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
