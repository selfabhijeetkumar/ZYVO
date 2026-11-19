import { NextResponse } from 'next/server';
import { getAllVerticalModules } from '@/lib/vertical-registry';

export async function GET() {
  const modules = getAllVerticalModules().map((mod) => ({
    id: mod.id,
    displayName: mod.displayName,
    shortDescription: mod.shortDescription,
    routePath: mod.routePath,
    iconName: mod.iconName,
    status: mod.status,
    statusBadgeLabel: mod.statusBadgeLabel,
    description: mod.description,
    supportedIntents: mod.supportedIntents,
    sampleTranscripts: mod.sampleTranscripts,
  }));

  return NextResponse.json({ modules });
}
