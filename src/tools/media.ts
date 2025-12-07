/**
 * Telegraph Media Tools
 * MCP tool definitions for media upload operations
 */

import { z } from 'zod';
import { TelegraphError } from '../telegraph-client.js';
import * as fs from 'fs';
import * as path from 'path';

const UPLOAD_URL = 'https://telegra.ph/upload';

// Zod schema
export const UploadImageSchema = z.object({
  file_path: z.string().optional().describe('Local file path to upload'),
  base64: z.string().optional().describe('Base64 encoded image data'),
  content_type: z.enum(['image/jpeg', 'image/png', 'image/gif', 'video/mp4'])
    .optional()
    .describe('MIME type of the file (required with base64)'),
  filename: z.string().optional().describe('Filename (required with base64)'),
}).refine(
  data => data.file_path || (data.base64 && data.content_type),
  { message: 'Either file_path or (base64 + content_type) must be provided' }
);

// Tool definition
export const mediaTools = [
  {
    name: 'telegraph_upload_image',
    description: 'Upload an image or video to Telegraph servers. Returns the Telegraph URL of the uploaded file.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        file_path: {
          type: 'string',
          description: 'Local file path to upload (supports jpg, png, gif, mp4)',
        },
        base64: {
          type: 'string',
          description: 'Base64 encoded file data (alternative to file_path)',
        },
        content_type: {
          type: 'string',
          enum: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
          description: 'MIME type (required when using base64)',
        },
        filename: {
          type: 'string',
          description: 'Filename with extension (required when using base64)',
        },
      },
    },
  },
];

// Helper to get content type from file extension
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
  };
  return types[ext] || 'application/octet-stream';
}

// Upload function
async function uploadToTelegraph(
  fileData: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const formData = new FormData();
  // Convert Buffer to ArrayBuffer for Blob compatibility
  const arrayBuffer = fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: contentType });
  formData.append('file', blob, filename);

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new TelegraphError(`Upload failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json() as { src?: string; error?: string }[];

  if (result[0]?.error) {
    throw new TelegraphError(`Upload error: ${result[0].error}`);
  }

  if (!result[0]?.src) {
    throw new TelegraphError('Upload failed: No source returned');
  }

  return `https://telegra.ph${result[0].src}`;
}

// Tool handler
export async function handleMediaTool(name: string, args: unknown) {
  if (name !== 'telegraph_upload_image') {
    return null;
  }

  const input = UploadImageSchema.parse(args);

  let fileData: Buffer;
  let filename: string;
  let contentType: string;

  if (input.file_path) {
    // Read from file
    fileData = fs.readFileSync(input.file_path);
    filename = path.basename(input.file_path);
    contentType = getContentType(input.file_path);
  } else if (input.base64 && input.content_type) {
    // Decode base64
    fileData = Buffer.from(input.base64, 'base64');
    filename = input.filename || 'upload';
    contentType = input.content_type;
  } else {
    throw new TelegraphError('Either file_path or (base64 + content_type) must be provided');
  }

  const url = await uploadToTelegraph(fileData, filename, contentType);

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ url, message: 'Image uploaded successfully' }, null, 2),
    }],
  };
}
