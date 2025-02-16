// app/api/save/route.js
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const files = await request.json();
    const templateDir = join(process.cwd(), 'static/template/');
    console.log(templateDir);
    
    await Promise.all(
      Object.entries(files).map(async ([filename, content]) => {
        const filePath = join(templateDir, filename);
        await writeFile(filePath, content, 'utf8');
      })
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
