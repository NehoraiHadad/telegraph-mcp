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
 * Parse content input - accepts either HTML string or Node array
 */
export function parseContent(content: string | Node[]): Node[] {
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
    // Not JSON, treat as HTML
  }

  // Convert HTML to nodes
  return htmlToNodes(content);
}
