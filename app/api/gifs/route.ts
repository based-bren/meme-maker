import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const gifDir = path.join(process.cwd(), 'public', 'gif');

  const gifFiles = fs.existsSync(gifDir)
    ? fs
        .readdirSync(gifDir)
        .filter((file) => file.toLowerCase().endsWith('.gif'))
    : [];

  const gifs = gifFiles.map((file, index) => ({
    id: index + 1,
    src: `/gif/${file}`,
    alt: `GIF ${index + 1}`,
  }));

  return NextResponse.json(gifs);
}
