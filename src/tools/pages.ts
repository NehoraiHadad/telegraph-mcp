/**
 * Telegraph Page Tools
 * MCP tool definitions for page-related operations
 */

import { z } from 'zod';
import * as telegraph from '../telegraph-client.js';

// Zod schemas for input validation
export const CreatePageSchema = z.object({
  access_token: z.string().describe('Access token of the Telegraph account'),
  title: z.string().min(1).max(256).describe('Page title (1-256 characters)'),
  content: z.string().describe('Page content - can be HTML string or JSON array of Node objects'),
  author_name: z.string().max(128).optional().describe('Author name (0-128 characters)'),
  author_url: z.string().max(512).optional().describe('Profile link (0-512 characters)'),
  return_content: z.boolean().optional().describe('If true, content field will be returned in the Page object'),
});

export const EditPageSchema = z.object({
  access_token: z.string().describe('Access token of the Telegraph account'),
  path: z.string().describe('Path to the page'),
  title: z.string().min(1).max(256).describe('Page title (1-256 characters)'),
  content: z.string().describe('Page content - can be HTML string or JSON array of Node objects'),
  author_name: z.string().max(128).optional().describe('Author name (0-128 characters)'),
  author_url: z.string().max(512).optional().describe('Profile link (0-512 characters)'),
  return_content: z.boolean().optional().describe('If true, content field will be returned in the Page object'),
});

export const GetPageSchema = z.object({
  path: z.string().describe('Path to the Telegraph page (e.g., "Sample-Page-12-15")'),
  return_content: z.boolean().optional().describe('If true, content field will be returned'),
});

export const GetPageListSchema = z.object({
  access_token: z.string().describe('Access token of the Telegraph account'),
  offset: z.number().int().min(0).optional().describe('Sequential number of the first page (default: 0)'),
  limit: z.number().int().min(0).max(200).optional().describe('Number of pages to return (0-200, default: 50)'),
});

export const GetViewsSchema = z.object({
  path: z.string().describe('Path to the Telegraph page'),
  year: z.number().int().min(2000).max(2100).optional().describe('Year (required if month is passed)'),
  month: z.number().int().min(1).max(12).optional().describe('Month (required if day is passed)'),
  day: z.number().int().min(1).max(31).optional().describe('Day (required if hour is passed)'),
  hour: z.number().int().min(0).max(24).optional().describe('Hour (0-24)'),
});

// Tool definitions
export const pageTools = [
  {
    name: 'telegraph_create_page',
    description: 'Create a new Telegraph page. Returns a Page object including the URL of the created page.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        access_token: {
          type: 'string',
          description: 'Access token of the Telegraph account',
        },
        title: {
          type: 'string',
          description: 'Page title (1-256 characters)',
          minLength: 1,
          maxLength: 256,
        },
        content: {
          type: 'string',
          description: 'Page content - can be HTML string (e.g., "<p>Hello <b>world</b></p>") or JSON array of Node objects',
        },
        author_name: {
          type: 'string',
          description: 'Author name displayed below the title (0-128 characters)',
          maxLength: 128,
        },
        author_url: {
          type: 'string',
          description: 'Profile link opened when users click on the author name (0-512 characters)',
          maxLength: 512,
        },
        return_content: {
          type: 'boolean',
          description: 'If true, the content field will be returned in the Page object',
          default: false,
        },
      },
      required: ['access_token', 'title', 'content'],
    },
  },
  {
    name: 'telegraph_edit_page',
    description: 'Edit an existing Telegraph page. Returns the updated Page object.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        access_token: {
          type: 'string',
          description: 'Access token of the Telegraph account',
        },
        path: {
          type: 'string',
          description: 'Path to the page (e.g., "Sample-Page-12-15")',
        },
        title: {
          type: 'string',
          description: 'Page title (1-256 characters)',
          minLength: 1,
          maxLength: 256,
        },
        content: {
          type: 'string',
          description: 'Page content - can be HTML string or JSON array of Node objects',
        },
        author_name: {
          type: 'string',
          description: 'Author name (0-128 characters)',
          maxLength: 128,
        },
        author_url: {
          type: 'string',
          description: 'Profile link (0-512 characters)',
          maxLength: 512,
        },
        return_content: {
          type: 'boolean',
          description: 'If true, content field will be returned in the Page object',
          default: false,
        },
      },
      required: ['access_token', 'path', 'title', 'content'],
    },
  },
  {
    name: 'telegraph_get_page',
    description: 'Get a Telegraph page by its path. Returns a Page object.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Path to the Telegraph page (e.g., "Sample-Page-12-15")',
        },
        return_content: {
          type: 'boolean',
          description: 'If true, content field will be returned',
          default: false,
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'telegraph_get_page_list',
    description: 'Get a list of pages belonging to a Telegraph account. Returns a PageList object with total_count and pages array.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        access_token: {
          type: 'string',
          description: 'Access token of the Telegraph account',
        },
        offset: {
          type: 'integer',
          description: 'Sequential number of the first page to be returned (default: 0)',
          minimum: 0,
          default: 0,
        },
        limit: {
          type: 'integer',
          description: 'Number of pages to be returned (0-200, default: 50)',
          minimum: 0,
          maximum: 200,
          default: 50,
        },
      },
      required: ['access_token'],
    },
  },
  {
    name: 'telegraph_get_views',
    description: 'Get the number of views for a Telegraph page. Can filter by year, month, day, or hour.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Path to the Telegraph page',
        },
        year: {
          type: 'integer',
          description: 'Year (2000-2100, required if month is passed)',
          minimum: 2000,
          maximum: 2100,
        },
        month: {
          type: 'integer',
          description: 'Month (1-12, required if day is passed)',
          minimum: 1,
          maximum: 12,
        },
        day: {
          type: 'integer',
          description: 'Day (1-31, required if hour is passed)',
          minimum: 1,
          maximum: 31,
        },
        hour: {
          type: 'integer',
          description: 'Hour (0-24)',
          minimum: 0,
          maximum: 24,
        },
      },
      required: ['path'],
    },
  },
];

// Tool handlers
export async function handlePageTool(name: string, args: unknown) {
  switch (name) {
    case 'telegraph_create_page': {
      const input = CreatePageSchema.parse(args);
      const content = telegraph.parseContent(input.content);
      const result = await telegraph.createPage(
        input.access_token,
        input.title,
        content,
        input.author_name,
        input.author_url,
        input.return_content
      );
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }

    case 'telegraph_edit_page': {
      const input = EditPageSchema.parse(args);
      const content = telegraph.parseContent(input.content);
      const result = await telegraph.editPage(
        input.access_token,
        input.path,
        input.title,
        content,
        input.author_name,
        input.author_url,
        input.return_content
      );
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }

    case 'telegraph_get_page': {
      const input = GetPageSchema.parse(args);
      const result = await telegraph.getPage(
        input.path,
        input.return_content
      );
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }

    case 'telegraph_get_page_list': {
      const input = GetPageListSchema.parse(args);
      const result = await telegraph.getPageList(
        input.access_token,
        input.offset,
        input.limit
      );
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }

    case 'telegraph_get_views': {
      const input = GetViewsSchema.parse(args);
      const result = await telegraph.getViews(
        input.path,
        input.year,
        input.month,
        input.day,
        input.hour
      );
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }

    default:
      return null;
  }
}
