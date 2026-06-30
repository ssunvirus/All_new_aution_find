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

  // Security validation: check path safety to avoid Directory Traversal
  const pathSafePattern = /^[a-zA-Z0-9_\-\s가-힣\(\)×\.\,]+$/;
  if (!pathSafePattern.test(filename) || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new Response('Invalid filename', { status: 400 });
  }

  // Must end with .xlsx
  if (!filename.endsWith('.xlsx')) {
    return new Response('Invalid file type', { status: 400 });
  }

  const filePath = path.resolve(process.cwd(), '..', filename);

  if (!fs.existsSync(filePath)) {
    return new Response('File not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  // Return Excel file as attachment
  return new Response(fileBuffer, {
    headers: {
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });
}
