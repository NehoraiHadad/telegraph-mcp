/**
 * Telegraph Template Tools
 * MCP tool definitions for template operations
 */

import { z } from 'zod';
import { templates, listTemplates, getTemplate } from '../templates/index.js';
import * as telegraph from '../telegraph-client.js';

// Zod schema
export const CreateFromTemplateSchema = z.object({
  access_token: z.string().describe('Access token of the Telegraph account'),
  template: z.enum(['blog_post', 'documentation', 'article', 'changelog', 'tutorial'])
    .describe('Template to use'),
  title: z.string().min(1).max(256).describe('Page title'),
  data: z.record(z.unknown()).describe('Template data fields'),
  author_name: z.string().max(128).optional(),
  author_url: z.string().max(512).optional(),
  return_content: z.boolean().optional(),
});

// Tool definitions
export const templateTools = [
  {
    name: 'telegraph_list_templates',
    description: 'List all available page templates with their fields',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'telegraph_create_from_template',
    description: 'Create a new Telegraph page using a template',
    inputSchema: {
      type: 'object' as const,
      properties: {
        access_token: {
          type: 'string',
          description: 'Access token of the Telegraph account',
        },
        template: {
          type: 'string',
          enum: ['blog_post', 'documentation', 'article', 'changelog', 'tutorial'],
          description: 'Template to use',
        },
        title: {
          type: 'string',
          description: 'Page title',
        },
        data: {
          type: 'object',
          description: 'Template data (fields depend on template type)',
        },
        author_name: {
          type: 'string',
          description: 'Author name',
        },
        author_url: {
          type: 'string',
          description: 'Author URL',
        },
        return_content: {
          type: 'boolean',
          default: false,
        },
      },
      required: ['access_token', 'template', 'title', 'data'],
    },
  },
];

// Tool handler
export async function handleTemplateTool(name: string, args: unknown) {
  if (name === 'telegraph_list_templates') {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(listTemplates(), null, 2),
      }],
    };
  }

  if (name === 'telegraph_create_from_template') {
    const input = CreateFromTemplateSchema.parse(args);
    const template = getTemplate(input.template);

    if (!template) {
      throw new Error(`Unknown template: ${input.template}`);
    }

    const htmlContent = template.generate(input.data);
    const content = telegraph.parseContent(htmlContent);

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

  return null;
}
