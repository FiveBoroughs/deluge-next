import { validateSession } from '@/app/actions/auth';
import { getDelugeClient } from '@/lib/deluge-client';
import { NextRequest, NextResponse } from 'next/server';
import 'server-only';
import { z } from 'zod';

// Zod schema for POST body validation
const getTorrentStatusSchema = z.object({
  torrentId: z.string().min(1, 'Torrent ID is required'),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { authenticated } = await validateSession();
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const deluge = await getDelugeClient();
  if (!deluge) {
    return NextResponse.json(
      { success: false, error: 'Deluge client not available' },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const torrentIdParam = url.searchParams.get('torrentId');

  const parsed = getTorrentStatusSchema.safeParse({
    torrentId: torrentIdParam,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }
  try {
    // Ensure authenticated session and fetch all torrent data
    const data = await deluge.getTorrentStatus(parsed.data.torrentId);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
