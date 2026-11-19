import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateSession } from '@/lib/auth';
import { clinicHandler } from '@/lib/verticals/clinic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('zyvo_session')?.value;
  const user = token ? validateSession(token) : null;
  const db = getDb();

  const workspaceId = req.nextUrl.searchParams.get('workspaceId') || 'ws_clinic_01';
  const role = user ? user.role : 'operator';

  let apptQuery = `
    SELECT a.*, d.name as doctor_name, d.department, d.consultation_fee_paise, u.name as patient_name, u.phone as patient_phone
    FROM clinic_appointments a
    JOIN clinic_doctors d ON a.doctor_id = d.id
    JOIN users u ON a.patient_id = u.id
    WHERE a.workspace_id = ?
  `;
  const queryParams: any[] = [workspaceId];

  if (role !== 'operator' && user) {
    apptQuery += ' AND a.patient_id = ?';
    queryParams.push(user.id);
  }

  apptQuery += ' ORDER BY a.appointment_date DESC, a.time_slot ASC LIMIT 30';
  const appointments = db.prepare(apptQuery).all(...queryParams);

  return NextResponse.json({
    appointments,
  });
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('zyvo_session')?.value;
    const user = token ? validateSession(token) : null;
    const db = getDb();

    const body = await req.json();
    const actorId = user ? user.id : (body.patientId || 'user_customer_01');
    const submissionId = body.submissionId || `v_clinic_${Date.now()}`;

    const result = await clinicHandler.applyTransaction(db, submissionId, body, actorId);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
