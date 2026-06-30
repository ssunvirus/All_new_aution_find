import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename') || '';

  if (!filename) {
    return new Response('Filename parameter is required', { status: 400 });
  }

  // Security: no directory traversal, must end with .zip
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new Response('Invalid filename', { status: 400 });
  }
  if (!filename.endsWith('.zip')) {
    return new Response('Invalid file type', { status: 400 });
  }

  const filePath = path.resolve(process.cwd(), '..', filename);

  if (!fs.existsSync(filePath)) {
    return new Response('ZIP file not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new Response(fileBuffer, {
    headers: {
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Type': 'application/zip',
    },
  });
}
