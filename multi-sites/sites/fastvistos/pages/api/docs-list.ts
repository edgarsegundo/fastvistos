/**
 * API endpoint for listing all markdown documentation files
 * 
 * This endpoint returns a list of all markdown files in the project
 * with their metadata for the documentation viewer.
 * 
 * Path: /api/docs-list
 */

import type { APIRoute } from 'astro';
import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { basename } from 'path';
import { existsSync } from 'fs';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Get all markdown files in the project
    const markdownFiles = await glob('**/*.md', {
      cwd: process.cwd(),
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.astro/**']
    });

    // Read file metadata
    const documentList = await Promise.all(
      markdownFiles.map(async (filePath) => {
        try {
          const content = await readFile(filePath, 'utf-8');
          const lines = content.split('\n');
          const firstHeading = lines.find(line => line.startsWith('#'));
          const title = firstHeading 
            ? firstHeading.replace(/^#+\s*/, '').trim()
            : basename(filePath, '.md');
          
          // Extract first paragraph as description
          const descriptionLine = lines.find(line => 
            line.trim().length > 0 && 
            !line.startsWith('#') && 
            !line.startsWith('```') &&
            !line.startsWith('---')
          );
          
          const description = descriptionLine 
            ? descriptionLine.trim().substring(0, 150) + '...'
            : 'No description available';

          // Estimate word count
          const wordCount = content.split(/\s+/).length;
          
          return {
            path: filePath,
            title,
            description,
            wordCount,
            size: content.length,
            category: filePath.includes('docs/') ? 'Documentation' :
                     filePath.includes('components/') ? 'Components' :
                     filePath.startsWith('README') ? 'README' : 'Other'
          };
        } catch (error) {
          console.error(`Error reading file ${filePath}:`, error);
          return null;
        }
      })
    );

    const documents = documentList.filter(Boolean);

    // Group documents by category
    const documentsByCategory = documents.reduce((acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = [];
      }
      acc[doc.category].push(doc);
      return acc;
    }, {});

    // Calculate statistics
    const stats = {
      totalDocs: documents.length,
      totalWords: documents.reduce((sum, doc) => sum + doc.wordCount, 0),
      totalSize: documents.reduce((sum, doc) => sum + doc.size, 0),
      categories: Object.keys(documentsByCategory).length
    };

    return new Response(JSON.stringify({
      documents,
      documentsByCategory,
      stats
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error listing documentation files:', error);
    return new Response(JSON.stringify({
      error: 'Failed to load documentation list'
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Handle OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
