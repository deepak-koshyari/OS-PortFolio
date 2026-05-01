import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.ogg', '.mov', '.m4v']);

export const dynamic = 'force-dynamic';

function formatTitle(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const normalized = baseName.replace(/[-_]+/g, ' ').trim();
  return normalized
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function GET() {
  try {
    const videosDir = path.join(process.cwd(), 'public', 'portfolio-videos');
    const entries = await fs.readdir(videosDir, { withFileTypes: true });

    const videos = await Promise.all(
      entries
        .filter(entry => entry.isFile())
        .filter(entry => VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
        .map(async entry => {
          const absolutePath = path.join(videosDir, entry.name);
          const stat = await fs.stat(absolutePath);
          return {
            title: formatTitle(entry.name),
            src: `/portfolio-videos/${entry.name}`,
            updatedAtMs: stat.mtimeMs,
          };
        })
    );

    videos.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json(
      { error: `Unable to load videos: ${String(error)}` },
      { status: 500 }
    );
  }
}
