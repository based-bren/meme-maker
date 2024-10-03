import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const memeDir = path.join(process.cwd(), 'public', 'memes');
  const memeFiles = fs.readdirSync(memeDir);

  const memeTemplates = memeFiles.map((file, index) => ({
    id: index + 1,
    src: `/memes/${file}`,
    alt: `Meme template ${index + 1}`
  }));

  return NextResponse.json(memeTemplates);
}