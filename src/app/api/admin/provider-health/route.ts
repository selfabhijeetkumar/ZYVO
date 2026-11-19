import { NextResponse } from 'next/server';
import { speechRouter } from '@/lib/providers/speech/provider-router';
import { intentRouter } from '@/lib/providers/intent/provider-router';

export async function GET() {
  const isExternalEnabled = process.env.EXTERNAL_API_ENABLED === 'true';

  const speechHealth = speechRouter.getHealth();
  const intentHealth = intentRouter.getHealth();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    externalApiEnabled: isExternalEnabled,
    routing: {
      speechPrimary: process.env.STT_PRIMARY_PROVIDER || 'sarvam',
      speechFallbacks: (process.env.STT_FALLBACK_PROVIDERS || 'gemini,groq,mock').split(',').map((s) => s.trim()),
      speechActive: speechRouter.getLastActiveProvider(),
      intentPrimary: process.env.INTENT_PRIMARY_PROVIDER || 'gemini',
      intentFallback: process.env.INTENT_FALLBACK_PROVIDER || 'deterministic',
      intentActive: intentRouter.getLastActiveProvider(),
      intentFallbackCount: intentRouter.getFallbackCount(),
    },
    privacy: {
      clinicNonDiagnosticShield: 'ENFORCED',
      policy: 'Identifiable patient data & clinical notes are strictly guarded; zero external LLM transmission',
    },
    speechProviders: speechHealth,
    intentProviders: intentHealth,
  });
}
