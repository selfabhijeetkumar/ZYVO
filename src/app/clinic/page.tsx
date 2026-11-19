'use client';

import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  Users,
  AlertCircle,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';
import IndustryAccentScene from '@/components/spatial/IndustryAccentScene';

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
        setActionSuccess(data.result?.summary || 'Appointment confirmed successfully.');
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
        setActionSuccess(`Appointment ${appointmentId} cancelled and slot released.`);
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
      {/* Header with Spatial Accent */}
      <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <IndustryAccentScene moduleType="clinic" accentColor="#86D5D4" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#F2EFE6]">
                Clinic Outpatient Scheduling
              </h1>
              <ModuleStatusBadge status="active" />
            </div>
            <p className="text-xs text-[#A4B0A6] mt-1 font-mono">
              Arogya Health Clinic : Outpatient slot allocation and strict non-diagnostic privacy boundary
            </p>
          </div>
        </div>

        {/* Tab Switcher with min 44px targets */}
        <div className="flex items-center bg-[#101211] p-1 rounded-xs border border-[#46534A]">
          <button
            onClick={() => setActiveTab('patient')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xs text-xs font-semibold transition-all ${
              activeTab === 'patient'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#86D5D4]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#86D5D4]" />
            <span>Patient Slot Booking</span>
          </button>
          <button
            onClick={() => setActiveTab('doctor')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xs text-xs font-semibold transition-all ${
              activeTab === 'doctor'
                ? 'bg-[#2A322D] text-[#F2EFE6] border border-[#69D9AD]'
                : 'text-[#A4B0A6] hover:text-[#F2EFE6]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#69D9AD]" />
            <span>Doctor Daily Manifest</span>
          </button>
        </div>
      </div>

      {/* Non-Diagnostic Privacy Banner */}
      <div className="p-4 bg-[#202622] border border-[#46534A] rounded-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#86D5D4] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#F2EFE6] font-mono">
            STRICT NON-DIAGNOSTIC OPERATIONAL BOUNDARY
          </div>
          <p className="text-xs text-[#C3CBC3] leading-relaxed">
            ZYVO operates strictly as an administrative scheduling engine. Voice submissions and forms are processed only for outpatient doctor slot availability, booking, rescheduling, and cancellation. Clinical symptoms, medical notes, diagnostics, and prescriptions are strictly ignored and never persisted.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#202622] border border-[#A4E4B5] rounded-xs text-xs text-[#A4E4B5] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#A4E4B5] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-[#202622] border border-[#F1A79C] rounded-xs text-xs text-[#F1A79C] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#F1A79C] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Voice Action Card */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-[#F2EFE6] uppercase font-mono tracking-wider">
          Voice Scheduling Dispatch
        </h2>
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
            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
              <div className="pb-2 border-b border-[#2C3530]">
                <h3 className="text-sm font-semibold text-[#F2EFE6]">Available Attending Physicians</h3>
                <p className="text-xs text-[#A4B0A6]">Select a physician to view outpatient slots and schedule an appointment</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {doctors.map((doc) => {
                  const isSelected = doc.id === selectedDoctorId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`cursor-pointer rounded-xs p-4 border transition-colors flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#2A322D] border-[#86D5D4]'
                          : 'bg-[#101211] border-[#2C3530] hover:border-[#46534A]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#A4B0A6] uppercase">{doc.department}</span>
                          <span className="text-xs font-bold text-[#69D9AD] font-mono tabular-nums">
                            ₹{(doc.consultation_fee_paise / 100).toFixed(0)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#F2EFE6]">{doc.name}</h4>
                        <p className="text-[11px] text-[#A4B0A6] font-mono">
                          Schedule: {doc.available_days}
                        </p>
                        <p className="text-[11px] text-[#A4B0A6] font-mono tabular-nums">
                          Hours: {doc.start_time.slice(0, 5)} to {doc.end_time.slice(0, 5)}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#2C3530] flex items-center justify-between text-xs">
                        <span className={isSelected ? 'text-[#86D5D4] font-semibold' : 'text-[#A4B0A6]'}>
                          {isSelected ? 'Selected Physician' : 'Click to select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doctor Slots Grid */}
            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#2C3530]">
                <div>
                  <h3 className="text-sm font-semibold text-[#F2EFE6]">
                    Outpatient Slots for {selectedDoctor?.name || 'Doctor'}
                  </h3>
                  <p className="text-xs text-[#A4B0A6]">Choose an available time slot</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#A4B0A6]">Date:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-[#101211] border border-[#46534A] rounded-xs px-2.5 py-1.5 text-xs text-[#F2EFE6] font-mono"
                  />
                </div>
              </div>

              {slots.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#A4B0A6] border border-dashed border-[#46534A] rounded-xs">
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
                        className={`p-3 rounded-xs border text-left transition-colors min-h-[44px] ${
                          isBooked
                            ? 'bg-[#101211]/50 border-[#2C3530] opacity-40 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#2A322D] border-[#86D5D4] text-[#86D5D4]'
                            : 'bg-[#101211] border-[#2C3530] text-[#F2EFE6] hover:border-[#46534A]'
                        }`}
                      >
                        <div className="text-xs font-mono font-bold tabular-nums">
                          {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                        </div>
                        <div className="text-[10px] mt-1">
                          {isBooked ? (
                            <span className="text-[#F1A79C] font-medium">Booked</span>
                          ) : (
                            <span className="text-[#69D9AD] font-medium">Available</span>
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
            <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#2C3530]">
                <Calendar className="w-4 h-4 text-[#86D5D4]" />
                <h3 className="text-sm font-semibold text-[#F2EFE6]">Booking Confirmation</h3>
              </div>

              <div className="p-3 bg-[#101211] border border-[#2C3530] rounded-xs space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#A4B0A6]">Physician</span>
                  <span className="text-[#F2EFE6] font-semibold">{selectedDoctor?.name || 'Selected Doctor'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A4B0A6]">Department</span>
                  <span className="text-[#F2EFE6]">{selectedDoctor?.department || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A4B0A6]">Date</span>
                  <span className="text-[#F2EFE6] font-mono tabular-nums">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A4B0A6]">Consultation Fee</span>
                  <span className="text-[#69D9AD] font-bold font-mono tabular-nums">
                    ₹{((selectedDoctor?.consultation_fee_paise || 30000) / 100).toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#A4B0A6]">Scheduling Category (Non-Diagnostic Logistics)</label>
                <select
                  value={patientNotes || 'Routine General Consultation'}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  className="w-full bg-[#101211] border border-[#46534A] rounded-xs px-3 py-2 text-xs text-[#F2EFE6]"
                >
                  <option value="Routine General Consultation">Routine General Consultation</option>
                  <option value="Follow-up Consultation">Follow-up Consultation</option>
                  <option value="Report Review & Discussion">Report Review & Discussion</option>
                  <option value="General Health Fitness Check">General Health Fitness Check</option>
                </select>
                <p className="text-[10px] text-[#A4B0A6]">
                  Strictly administrative logistics. Clinical symptoms are rejected server-side.
                </p>
              </div>

              <button
                onClick={handleBookAppointment}
                disabled={loading}
                className="min-h-[44px] w-full py-2.5 rounded-xs bg-[#69D9AD] hover:bg-[#86D5D4] disabled:opacity-50 text-[#101211] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Appointment (₹{((selectedDoctor?.consultation_fee_paise || 30000) / 100).toFixed(0)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCTOR / OPERATOR TAB */}
      {activeTab === 'doctor' && (
        <div className="space-y-6">
          <div className="bg-[#171B19] border border-[#46534A] rounded-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2C3530]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#86D5D4]" />
                <div>
                  <h3 className="text-sm font-semibold text-[#F2EFE6]">Clinic Outpatient Schedule Manifest</h3>
                  <p className="text-xs text-[#A4B0A6]">All registered patient bookings and administrative statuses</p>
                </div>
              </div>
              <button
                onClick={loadAppointments}
                className="min-h-[44px] px-3.5 py-1.5 bg-[#202622] text-[#A4B0A6] hover:text-[#F2EFE6] border border-[#46534A] rounded-xs text-xs flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#A4B0A6] border border-dashed border-[#46534A] rounded-xs">
                No active appointments booked in this clinic.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#101211] text-[#A4B0A6] border-b border-[#46534A] font-mono">
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
                  <tbody className="divide-y divide-[#2C3530] font-mono">
                    {appointments.map((a) => (
                      <tr key={a.id} className="hover:bg-[#202622]">
                        <td className="p-3 text-[#F2EFE6] font-bold">{a.id}</td>
                        <td className="p-3 text-[#F2EFE6]">
                          {a.patient_name}
                          <span className="block text-[10px] text-[#A4B0A6] font-normal">{a.patient_phone}</span>
                        </td>
                        <td className="p-3 text-[#A4B0A6]">
                          {a.doctor_name}
                          <span className="block text-[10px] text-[#A4B0A6]">{a.department}</span>
                        </td>
                        <td className="p-3 text-[#F2EFE6]">
                          {a.appointment_date}
                          <span className="block text-[11px] text-[#86D5D4] font-bold">{a.time_slot}</span>
                        </td>
                        <td className="p-3 text-[#69D9AD] font-bold tabular-nums">
                          ₹{(a.consultation_fee_paise / 100).toFixed(0)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold border ${
                              a.status === 'CONFIRMED'
                                ? 'bg-[#202622] text-[#A4E4B5] border-[#A4E4B5]'
                                : 'bg-[#202622] text-[#F1A79C] border-[#F1A79C]'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {a.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleCancelAppointment(a.id)}
                              className="min-h-[36px] px-2.5 py-1 rounded-xs bg-[#202622] hover:bg-[#2A322D] text-[#F1A79C] border border-[#F1A79C] text-[11px] font-medium transition-colors"
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
