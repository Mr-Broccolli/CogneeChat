import { NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';

export async function GET() {
  try {
    // .port file is at project root (one level above Next.js project root)
    const filePath = path.join(process.cwd(), '..', '.port');
    const content = await readFile(filePath, 'utf8');
    const port = parseInt(content.trim(), 10);
    if (isNaN(port)) {
      return NextResponse.json({ port: 8000 }, { status: 400 });
    }
    return NextResponse.json({ port });
  } catch (error) {
    console.error('Error reading port file:', error);
    return NextResponse.json({ port: 8000 }, { status: 500 });
  }
}