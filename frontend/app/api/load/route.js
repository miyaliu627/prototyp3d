import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const templateDir = join(process.cwd(), 'static/template/');

    // Check if the template directory exists
    const fs = require('fs');
    fs.accessSync(templateDir, fs.constants.F_OK);  // This checks if the directory exists

    const files = {
      'index.html': await readFile(join(templateDir, 'index.html'), 'utf8'),
      'styles.css': await readFile(join(templateDir, 'styles.css'), 'utf8'),
      'script.js': await readFile(join(templateDir, 'script.js'), 'utf8')
    };

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error loading files:', error);  // Log the error details
    return NextResponse.json(
      { error: 'Failed to load files' },
      { status: 500 }
    );
  }
}

