/**
 * API endpoint for serving markdown documentation files
 * 
 * This endpoint handles:
 * - GET requests: Return markdown file content
 * - PUT requests: Save markdown file content (for editing)
 * 
 * Path: /api/docs/[...path]
 */

import type { APIRoute } from 'astro';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const filePath = params.path as string;
    
    if (!filePath) {
      return new Response('File path is required', { status: 400 });
    }
    
    // Decode the file path
    const decodedPath = decodeURIComponent(filePath);
    
    // Security check: prevent directory traversal
    if (decodedPath.includes('..') || decodedPath.startsWith('/')) {
      return new Response('Invalid file path', { status: 400 });
    }
    
    // Construct the full file path
    const fullPath = join(process.cwd(), decodedPath);
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return new Response('File not found', { status: 404 });
    }
    
    // Check if it's a markdown file
    if (!decodedPath.endsWith('.md')) {
      return new Response('Only markdown files are supported', { status: 400 });
    }
    
    // Read the file content
    const content = await readFile(fullPath, 'utf-8');
    
    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Error reading file:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const filePath = params.path as string;
    
    if (!filePath) {
      return new Response('File path is required', { status: 400 });
    }
    
    // Decode the file path
    const decodedPath = decodeURIComponent(filePath);
    
    // Security check: prevent directory traversal
    if (decodedPath.includes('..') || decodedPath.startsWith('/')) {
      return new Response('Invalid file path', { status: 400 });
    }
    
    // Check if it's a markdown file
    if (!decodedPath.endsWith('.md')) {
      return new Response('Only markdown files are supported', { status: 400 });
    }
    
    // Construct the full file path
    const fullPath = join(process.cwd(), decodedPath);
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return new Response('File not found', { status: 404 });
    }
    
    // Get the content from the request body
    const content = await request.text();
    
    // Write the file content
    await writeFile(fullPath, content, 'utf-8');
    
    return new Response('File saved successfully', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    
  } catch (error) {
    console.error('Error saving file:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

// Handle OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
