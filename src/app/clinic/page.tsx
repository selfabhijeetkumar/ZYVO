import { getDb } from '@/lib/db';
import { getVerticalModule } from '@/lib/vertical-registry';
import { ModuleStatusBadge } from '@/components/ModuleStatusBadge';
import { VoiceActionCard } from '@/components/VoiceActionCard';
import { Stethoscope, Calendar, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ClinicAppointmentsPage() {
  const db = getDb();
  const moduleDef = getVerticalModule('clinic');

  const doctors = db.prepare('SELECT * FROM clinic_doctors WHERE workspace_id = ?').all('ws_clinic_01') as any[];
  const slots = db.prepare(`
    SELECT s.*, d.name as doctor_name
    FROM clinic_appointment_slots s
    JOIN clinic_doctors d ON s.doctor_id = d.id
    WHERE s.workspace_id = ?
    ORDER BY s.slot_date ASC, s.start_time ASC
  `).all('ws_clinic_01') as any[];
  const appointments = db.prepare(`
    SELECT a.*, d.name as doctor_name, u.name as patient_name
    FROM clinic_appointments a
    JOIN clinic_doctors d ON a.doctor_id = d.id
    JOIN users u ON a.patient_id = u.id
    WHERE a.workspace_id = ?
    ORDER BY a.created_at DESC
    LIMIT 5
  `).all('ws_clinic_01') as any[];

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
              <ModuleStatusBadge status="foundation_ready" />
            </div>
            <p className="text-xs text-[#8B9CB5] mt-1">
              Arogya Community Health Clinic · Outpatient slots, doctor schedules, and non-diagnostic privacy boundaries
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[#151415] border border-[#2A2C30] text-xs text-[#8B9CB5] font-mono">
          Phase 3 Multi-Vertical Foundation
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
            ZYVO operates strictly as a administrative scheduling engine. Voice submissions are processed only for outpatient doctor slot availability, booking, and cancellation. Clinical symptoms, diagnostics, and prescriptions are strictly ignored and never persisted.
          </p>
        </div>
      </div>

      {/* Voice Action Card */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-[#F1EADE]">Test Clinic Booking Workflow</h2>
        <VoiceActionCard
          verticalType="clinic"
          workspaceId="ws_clinic_01"
          samples={moduleDef?.sampleTranscripts || []}
        />
      </div>

      {/* Doctors & Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Doctors Directory */}
        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-[#F1EADE]">Attending Physicians</h3>
            </div>
            <span className="text-xs text-[#8B9CB5] font-mono">{doctors.length} Doctors</span>
          </div>

          <div className="space-y-2.5">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-3 bg-[#151415] border border-[#2A2C30] rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-[#F1EADE]">{doc.name}</div>
                  <div className="text-[11px] text-[#8B9CB5]">{doc.department}</div>
                  <div className="text-[10px] text-[#8B9CB5] font-mono mt-1">
                    Days: {doc.available_days} ({doc.start_time.slice(0, 5)} - {doc.end_time.slice(0, 5)})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    ₹{(doc.consultation_fee_paise / 100).toFixed(0)}
                  </div>
                  <div className="text-[10px] text-[#8B9CB5]">Consultation</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment Slots */}
        <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-[#F1EADE]">Available Slots (Upcoming)</h3>
            </div>
            <span className="text-xs text-[#8B9CB5] font-mono">{slots.length} Slots</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                <tr>
                  <th className="p-2.5">Doctor</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2C30] font-mono">
                {slots.map((s) => (
                  <tr key={s.id} className="hover:bg-[#242528]/40">
                    <td className="p-2.5 text-[#F1EADE]">{s.doctor_name}</td>
                    <td className="p-2.5 text-[#8B9CB5]">{s.slot_date}</td>
                    <td className="p-2.5 text-[#8B9CB5]">{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</td>
                    <td className="p-2.5 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.is_booked === 1
                            ? 'bg-red-950/60 text-red-300 border border-red-800'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {s.is_booked === 1 ? 'Booked' : 'Available'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmed Appointments Table */}
      <div className="bg-[#1B1C1E] border border-[#2A2C30] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F1EADE]">Confirmed Clinic Bookings</h3>
          <span className="text-xs text-[#8B9CB5] font-mono">Real-time DB Records</span>
        </div>

        {appointments.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#8B9CB5] border border-dashed border-[#2A2C30] rounded-lg">
            No clinic appointments registered yet. Submit a voice note above to schedule a doctor consultation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151415] text-[#8B9CB5] border-b border-[#2A2C30]">
                <tr>
                  <th className="p-2.5">Booking ID</th>
                  <th className="p-2.5">Patient</th>
                  <th className="p-2.5">Doctor</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Booked At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2C30] font-mono">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-[#242528]/40">
                    <td className="p-2.5 text-[#F1EADE] font-semibold">{a.id}</td>
                    <td className="p-2.5 text-[#F1EADE]">{a.patient_name}</td>
                    <td className="p-2.5 text-[#8B9CB5]">{a.doctor_name}</td>
                    <td className="p-2.5 text-[#8B9CB5]">{a.appointment_date}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                        {a.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-[#8B9CB5]">{a.created_at.slice(0, 19).replace('T', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
