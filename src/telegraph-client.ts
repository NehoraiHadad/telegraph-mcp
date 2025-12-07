/**
 * Telegraph API Client
 * Wrapper for all Telegraph API endpoints
 */

import type { Account, Page, PageList, PageViews, Node, ApiResponse, AccountField } from './types.js';

const BASE_URL = 'https://api.telegra.ph';

/**
 * Custom error class for Telegraph API errors
 */
export class TelegraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TelegraphError';
  }
}

/**
 * Make a request to the Telegraph API
 */
async function apiRequest<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
  const url = `${BASE_URL}/${method}`;

  // Filter out undefined values
  const filteredParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        filteredParams[key] = JSON.stringify(value);
      } else {
        filteredParams[key] = String(value);
      }
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(filteredParams).toString(),
  });

  if (!response.ok) {
    throw new TelegraphError(`HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as ApiResponse<T>;

  if (!data.ok) {
    throw new TelegraphError(data.error || 'Unknown Telegraph API error');
  }

  return data.result as T;
}

/**
 * Create a new Telegraph account
 * @param short_name Account name (1-32 characters)
 * @param author_name Default author name (0-128 characters)
 * @param author_url Default profile link (0-512 characters)
 * @returns Account object with access_token
 */
export async function createAccount(
  short_name: string,
  author_name?: string,
  author_url?: string
): Promise<Account> {
  return apiRequest<Account>('createAccount', {
    short_name,
    author_name,
    author_url,
  });
}

/**
 * Update information about a Telegraph account
 * @param access_token Access token of the Telegraph account
 * @param short_name New account name (1-32 characters)
 * @param author_name New default author name (0-128 characters)
 * @param author_url New default profile link (0-512 characters)
 * @returns Updated Account object
 */
export async function editAccountInfo(
  access_token: string,
  short_name?: string,
  author_name?: string,
  author_url?: string
): Promise<Account> {
  return apiRequest<Account>('editAccountInfo', {
    access_token,
    short_name,
    author_name,
    author_url,
  });
}

/**
 * Get information about a Telegraph account
 * @param access_token Access token of the Telegraph account
 * @param fields List of account fields to return
 * @returns Account object with requested fields
 */
export async function getAccountInfo(
  access_token: string,
  fields?: AccountField[]
): Promise<Account> {
  return apiRequest<Account>('getAccountInfo', {
    access_token,
    fields,
  });
}

/**
 * Revoke access_token and generate a new one
 * @param access_token Access token of the Telegraph account
 * @returns Account object with new access_token and auth_url
 */
export async function revokeAccessToken(access_token: string): Promise<Account> {
  return apiRequest<Account>('revokeAccessToken', {
    access_token,
  });
}

/**
 * Create a new Telegraph page
 * @param access_token Access token of the Telegraph account
 * @param title Page title (1-256 characters)
 * @param content Content of the page (Array of Node objects)
 * @param author_name Author name (0-128 characters)
 * @param author_url Profile link (0-512 characters)
 * @param return_content If true, content field will be returned
 * @returns Page object
 */
export async function createPage(
  access_token: string,
  title: string,
  content: Node[],
  author_name?: string,
  author_url?: string,
  return_content?: boolean
): Promise<Page> {
  return apiRequest<Page>('createPage', {
    access_token,
    title,
    content,
    author_name,
    author_url,
    return_content,
  });
}

/**
 * Edit an existing Telegraph page
 * @param access_token Access token of the Telegraph account
 * @param path Path to the page
 * @param title Page title (1-256 characters)
 * @param content Content of the page (Array of Node objects)
 * @param author_name Author name (0-128 characters)
 * @param author_url Profile link (0-512 characters)
 * @param return_content If true, content field will be returned
 * @returns Updated Page object
 */
export async function editPage(
  access_token: string,
  path: string,
  title: string,
  content: Node[],
  author_name?: string,
  author_url?: string,
  return_content?: boolean
): Promise<Page> {
  return apiRequest<Page>('editPage', {
    access_token,
    path,
    title,
    content,
    author_name,
    author_url,
    return_content,
  });
}

/**
 * Get a Telegraph page
 * @param path Path to the Telegraph page
 * @param return_content If true, content field will be returned
 * @returns Page object
 */
export async function getPage(path: string, return_content?: boolean): Promise<Page> {
  return apiRequest<Page>('getPage', {
    path,
    return_content,
  });
}

/**
 * Get a list of pages belonging to a Telegraph account
 * @param access_token Access token of the Telegraph account
 * @param offset Sequential number of the first page (default: 0)
 * @param limit Number of pages to be returned (0-200, default: 50)
 * @returns PageList object
 */
export async function getPageList(
  access_token: string,
  offset?: number,
  limit?: number
): Promise<PageList> {
  return apiRequest<PageList>('getPageList', {
    access_token,
    offset,
    limit,
  });
}

/**
 * Get the number of views for a Telegraph page
 * @param path Path to the Telegraph page
 * @param year Required if month is passed (2000-2100)
 * @param month Required if day is passed (1-12)
 * @param day Required if hour is passed (1-31)
 * @param hour Pass to get views for a specific hour (0-24)
 * @returns PageViews object
 */
export async function getViews(
  path: string,
  year?: number,
  month?: number,
  day?: number,
  hour?: number
): Promise<PageViews> {
  return apiRequest<PageViews>('getViews', {
    path,
    year,
    month,
    day,
    hour,
  });
}

/**
 * Simple HTML to Node converter
 * Converts basic HTML string to Telegraph Node array
 * Supports: p, b, i, strong, em, a, br, h3, h4, blockquote, code, pre, ul, ol, li, figure, figcaption, img, video, iframe
 */
export function htmlToNodes(html: string): Node[] {
  const nodes: Node[] = [];

  // Simple regex-based parser for basic HTML
  // This handles common cases but is not a full HTML parser
  const tagRegex = /<(\/?)([\w-]+)([^>]*)>|([^<]+)/g;
  const stack: { tag: string; attrs?: Record<string, string>; children: Node[] }[] = [];
  let current: Node[] = nodes;

  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const [, closing, tagName, attrString, text] = match;

    if (text) {
      // Text node
      const trimmedText = text;
      if (trimmedText) {
        current.push(trimmedText);
      }
    } else if (tagName) {
      const tag = tagName.toLowerCase();

      if (closing) {
        // Closing tag
        if (stack.length > 0) {
          const completed = stack.pop()!;
          current = stack.length > 0 ? stack[stack.length - 1].children : nodes;

          const element: Node = { tag: completed.tag };
          if (completed.attrs && Object.keys(completed.attrs).length > 0) {
            (element as any).attrs = completed.attrs;
          }
          if (completed.children.length > 0) {
            (element as any).children = completed.children;
          }
          current.push(element);
        }
      } else {
        // Opening tag
        const attrs: Record<string, string> = {};

        // Parse attributes
        const attrRegex = /([\w-]+)=["']([^"']*)["']/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attrString)) !== null) {
          attrs[attrMatch[1]] = attrMatch[2];
        }

        // Self-closing tags
        if (['br', 'hr', 'img'].includes(tag) || attrString.includes('/')) {
          const element: Node = { tag };
          if (Object.keys(attrs).length > 0) {
            (element as any).attrs = attrs;
          }
          current.push(element);
        } else {
          // Regular tag - push to stack
          const newElement = { tag, attrs, children: [] as Node[] };
          stack.push(newElement);
          current = newElement.children;
        }
      }
    }
  }

  // Handle any unclosed tags
  while (stack.length > 0) {
    const completed = stack.pop()!;
    const parent = stack.length > 0 ? stack[stack.length - 1].children : nodes;

    const element: Node = { tag: completed.tag };
    if (completed.attrs && Object.keys(completed.attrs).length > 0) {
      (element as any).attrs = completed.attrs;
    }
    if (completed.children.length > 0) {
      (element as any).children = completed.children;
    }
    parent.push(element);
  }

  return nodes;
}

/**
 * Convert Markdown to HTML
 * Supports basic Markdown syntax and converts it to Telegraph-compatible HTML
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape special HTML characters in code blocks first to preserve them
  const codeBlocks: string[] = [];
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    codeBlocks.push(code.trim());
    return `__CODEBLOCK_${codeBlocks.length - 1}__`;
  });

  const inlineCodes: string[] = [];
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    inlineCodes.push(code);
    return `__INLINECODE_${inlineCodes.length - 1}__`;
  });

  // Convert headers (Telegraph only supports h3 and h4)
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^##\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^#\s+(.+)$/gm, '<h3>$1</h3>');

  // Convert horizontal rules
  html = html.replace(/^---+$/gm, '<hr/>');

  // Convert images with caption ![alt](src)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure><img src="$2"/><figcaption>$1</figcaption></figure>');

  // Convert links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert bold **text** or __text__
  html = html.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  html = html.replace(/__([^_]+)__/g, '<b>$1</b>');

  // Convert italic *text* or _text_ (but not in middle of words)
  html = html.replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '<i>$1</i>');
  html = html.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<i>$1</i>');

  // Convert blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Convert unordered lists
  const ulLines: string[] = [];
  let inUl = false;
  const lines = html.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ulMatch = line.match(/^[-*]\s+(.+)$/);

    if (ulMatch) {
      ulLines.push(`<li>${ulMatch[1]}</li>`);
      inUl = true;
    } else {
      if (inUl) {
        processedLines.push(`<ul>${ulLines.join('')}</ul>`);
        ulLines.length = 0;
        inUl = false;
      }
      processedLines.push(line);
    }
  }
  if (inUl) {
    processedLines.push(`<ul>${ulLines.join('')}</ul>`);
  }
  html = processedLines.join('\n');

  // Convert ordered lists
  const olLines: string[] = [];
  let inOl = false;
  const lines2 = html.split('\n');
  const processedLines2: string[] = [];

  for (let i = 0; i < lines2.length; i++) {
    const line = lines2[i];
    const olMatch = line.match(/^\d+\.\s+(.+)$/);

    if (olMatch) {
      olLines.push(`<li>${olMatch[1]}</li>`);
      inOl = true;
    } else {
      if (inOl) {
        processedLines2.push(`<ol>${olLines.join('')}</ol>`);
        olLines.length = 0;
        inOl = false;
      }
      processedLines2.push(line);
    }
  }
  if (inOl) {
    processedLines2.push(`<ol>${olLines.join('')}</ol>`);
  }
  html = processedLines2.join('\n');

  // Restore code blocks
  html = html.replace(/__CODEBLOCK_(\d+)__/g, (match, index) => {
    return `<pre>${codeBlocks[parseInt(index)]}</pre>`;
  });

  // Restore inline code
  html = html.replace(/__INLINECODE_(\d+)__/g, (match, index) => {
    return `<code>${inlineCodes[parseInt(index)]}</code>`;
  });

  // Convert paragraphs (lines separated by blank lines)
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map(para => {
      const trimmed = para.trim();
      // Don't wrap if already an HTML tag
      if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
        return trimmed;
      }
      // Don't wrap empty lines
      if (!trimmed) {
        return '';
      }
      return `<p>${trimmed}</p>`;
    })
    .filter(p => p)
    .join('\n');

  return html;
}

/**
 * Parse content input - accepts either HTML string, Markdown string, or Node array
 */
export function parseContent(content: string | Node[], format: 'html' | 'markdown' = 'html'): Node[] {
  if (Array.isArray(content)) {
    return content;
  }

  // Try to parse as JSON first (in case it's a stringified Node array)
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Not JSON, continue with string parsing
  }

  // Convert markdown to HTML if format is markdown
  let htmlContent = content;
  if (format === 'markdown') {
    htmlContent = markdownToHtml(content);
  }

  // Convert HTML to nodes
  return htmlToNodes(htmlContent);
}
