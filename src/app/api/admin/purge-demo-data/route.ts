import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seedInitialData } from '@/lib/db/schema';
import { validateSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('zyvo_session')?.value;
    const user = token ? validateSession(token) : null;
    const adminSecret = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret');
    const configuredSecret = process.env.ADMIN_SECRET || 'zyvo_demo_secret';

    const isAuthorizedOperator = user && user.role === 'operator';
    const isSecretAuthorized = adminSecret && adminSecret === configuredSecret;

    if (!isAuthorizedOperator && !isSecretAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin purge requires operator session or valid admin secret' },
        { status: 401 }
      );
    }

    const db = getDb();

    // Delete dynamic transaction data in strict foreign-key dependency order
    db.prepare('DELETE FROM audit_events').run();
    db.prepare('DELETE FROM kirana_grocery_order_items').run();
    db.prepare('DELETE FROM kirana_grocery_orders').run();
    db.prepare('DELETE FROM vegetable_order_items').run();
    db.prepare('DELETE FROM vegetable_orders').run();
    db.prepare('DELETE FROM clinic_appointments').run();
    db.prepare('UPDATE clinic_appointment_slots SET is_booked = 0').run();
    db.prepare('DELETE FROM agri_pickup_schedules').run();
    db.prepare('DELETE FROM agri_procurement_items').run();
    db.prepare('DELETE FROM agri_procurement_requests').run();
    db.prepare('DELETE FROM milk_delivery_calendar').run();
    db.prepare('DELETE FROM voice_submissions').run();
    db.prepare('DELETE FROM agri_procurement_items').run();
    db.prepare('DELETE FROM agri_procurement_requests').run();

    // Re-seed if needed
    seedInitialData(db);

    return NextResponse.json({
      success: true,
      message: 'Demo transaction data purged and catalogs reset to initial baseline',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
