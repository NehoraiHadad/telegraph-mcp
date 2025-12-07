/**
 * Telegraph Export Tools
 * MCP tool definitions for export and backup operations
 */

import { z } from 'zod';
import * as telegraph from '../telegraph-client.js';
import type { Node, NodeElement } from '../types.js';

// Zod schemas
export const ExportPageSchema = z.object({
  path: z.string().describe('Path to the Telegraph page'),
  format: z.enum(['markdown', 'html']).default('markdown').describe('Export format'),
});

export const BackupAccountSchema = z.object({
  access_token: z.string().describe('Access token of the Telegraph account'),
  format: z.enum(['markdown', 'html']).default('markdown').describe('Export format'),
  limit: z.number().int().min(1).max(200).default(50).optional(),
});

// Convert nodes to Markdown
function nodesToMarkdown(nodes: Node[]): string {
  let markdown = '';

  for (const node of nodes) {
    if (typeof node === 'string') {
      markdown += node;
    } else {
      markdown += nodeElementToMarkdown(node as NodeElement);
    }
  }

  return markdown;
}

function nodeElementToMarkdown(node: NodeElement): string {
  const children = node.children ? nodesToMarkdown(node.children) : '';

  switch (node.tag) {
    case 'h3':
      return `\n# ${children}\n`;
    case 'h4':
      return `\n## ${children}\n`;
    case 'p':
      return `\n${children}\n`;
    case 'b':
    case 'strong':
      return `**${children}**`;
    case 'i':
    case 'em':
      return `*${children}*`;
    case 'a':
      return `[${children}](${node.attrs?.href || ''})`;
    case 'img':
      return `![image](${node.attrs?.src || ''})`;
    case 'figure':
      return children;
    case 'figcaption':
      return `\n*${children}*\n`;
    case 'ul':
      return `\n${children}`;
    case 'ol':
      return `\n${children}`;
    case 'li':
      return `- ${children}\n`;
    case 'blockquote':
      return `\n> ${children}\n`;
    case 'code':
      return `\`${children}\``;
    case 'pre':
      return `\n\`\`\`\n${children}\n\`\`\`\n`;
    case 'br':
      return '\n';
    case 'hr':
      return '\n---\n';
    case 's':
      return `~~${children}~~`;
    case 'u':
      return children; // No markdown equivalent
    case 'aside':
      return `\n*${children}*\n`;
    default:
      return children;
  }
}

// Convert nodes to HTML
function nodesToHtml(nodes: Node[]): string {
  let html = '';

  for (const node of nodes) {
    if (typeof node === 'string') {
      html += node;
    } else {
      const element = node as NodeElement;
      const children = element.children ? nodesToHtml(element.children) : '';
      const attrs = element.attrs
        ? Object.entries(element.attrs)
            .map(([k, v]) => `${k}="${v}"`)
            .join(' ')
        : '';

      if (['br', 'hr', 'img'].includes(element.tag)) {
        html += `<${element.tag}${attrs ? ' ' + attrs : ''}/>`;
      } else {
        html += `<${element.tag}${attrs ? ' ' + attrs : ''}>${children}</${element.tag}>`;
      }
    }
  }

  return html;
}

// Tool definitions
export const exportTools = [
  {
    name: 'telegraph_export_page',
    description: 'Export a Telegraph page to Markdown or HTML format',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Path to the Telegraph page',
        },
        format: {
          type: 'string',
          enum: ['markdown', 'html'],
          default: 'markdown',
          description: 'Export format',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'telegraph_backup_account',
    description: 'Backup all pages from a Telegraph account',
    inputSchema: {
      type: 'object' as const,
      properties: {
        access_token: {
          type: 'string',
          description: 'Access token of the Telegraph account',
        },
        format: {
          type: 'string',
          enum: ['markdown', 'html'],
          default: 'markdown',
          description: 'Export format',
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 200,
          default: 50,
          description: 'Maximum number of pages to export',
        },
      },
      required: ['access_token'],
    },
  },
];

// Tool handler
export async function handleExportTool(name: string, args: unknown) {
  if (name === 'telegraph_export_page') {
    const input = ExportPageSchema.parse(args);
    const page = await telegraph.getPage(input.path, true);

    if (!page.content) {
      throw new Error('Page has no content');
    }

    const content = input.format === 'markdown'
      ? nodesToMarkdown(page.content)
      : nodesToHtml(page.content);

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          title: page.title,
          path: page.path,
          url: page.url,
          format: input.format,
          content,
        }, null, 2),
      }],
    };
  }

  if (name === 'telegraph_backup_account') {
    const input = BackupAccountSchema.parse(args);
    const pageList = await telegraph.getPageList(input.access_token, 0, input.limit);

    const exportedPages = [];

    for (const page of pageList.pages) {
      const fullPage = await telegraph.getPage(page.path, true);
      const content = fullPage.content
        ? (input.format === 'markdown' ? nodesToMarkdown(fullPage.content) : nodesToHtml(fullPage.content))
        : '';

      exportedPages.push({
        title: fullPage.title,
        path: fullPage.path,
        url: fullPage.url,
        content,
      });
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          total_count: pageList.total_count,
          exported_count: exportedPages.length,
          format: input.format,
          pages: exportedPages,
        }, null, 2),
      }],
    };
  }

  return null;
}
