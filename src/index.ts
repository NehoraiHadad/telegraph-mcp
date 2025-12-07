#!/usr/bin/env node
/**
 * Telegraph MCP Server
 * Exposes Telegraph API as MCP tools for Claude and other LLM clients
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { allTools, handleTool } from './tools/index.js';
import { TelegraphError } from './telegraph-client.js';
import * as telegraph from './telegraph-client.js';

// Server metadata
const SERVER_NAME = 'telegraph-mcp';
const SERVER_VERSION = '1.1.0';

// Create the MCP server
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
      resources: {},
    },
  }
);

// Define prompts
const prompts = [
  {
    name: 'create-blog-post',
    description: 'Guide for creating a blog post on Telegraph',
    arguments: [
      { name: 'topic', description: 'The topic of the blog post', required: true },
    ],
  },
  {
    name: 'create-documentation',
    description: 'Guide for creating documentation on Telegraph',
    arguments: [
      { name: 'project_name', description: 'Name of the project to document', required: true },
    ],
  },
  {
    name: 'summarize-page',
    description: 'Summarize an existing Telegraph page',
    arguments: [
      { name: 'path', description: 'Path to the Telegraph page', required: true },
    ],
  },
];

// Handle prompt listing
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return { prompts };
});

// Handle prompt retrieval
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'create-blog-post') {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Help me create a blog post about: ${args?.topic || 'a topic'}

Please structure it with:
1. An engaging title
2. An introduction paragraph
3. 2-3 main sections with headers
4. A conclusion

Use Markdown format, then I'll publish it to Telegraph.`,
        },
      }],
    };
  }

  if (name === 'create-documentation') {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Help me create documentation for: ${args?.project_name || 'my project'}

Structure:
1. Project overview
2. Installation/Setup
3. Usage examples with code
4. API reference (if applicable)
5. FAQ or troubleshooting

Use Markdown format for Telegraph.`,
        },
      }],
    };
  }

  if (name === 'summarize-page') {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Please fetch and summarize the Telegraph page at path: ${args?.path || ''}

Use the telegraph_get_page tool with return_content=true, then provide:
1. A brief summary (2-3 sentences)
2. Key points covered
3. Target audience`,
        },
      }],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
});

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools,
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await handleTool(name, args);
    return result;
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return {
        isError: true,
        content: [{
          type: 'text' as const,
          text: `Validation error: ${errorMessages}`,
        }],
      };
    }

    // Handle Telegraph API errors
    if (error instanceof TelegraphError) {
      return {
        isError: true,
        content: [{
          type: 'text' as const,
          text: `Telegraph API error: ${error.message}`,
        }],
      };
    }

    // Handle other errors
    if (error instanceof Error) {
      return {
        isError: true,
        content: [{
          type: 'text' as const,
          text: `Error: ${error.message}`,
        }],
      };
    }

    return {
      isError: true,
      content: [{
        type: 'text' as const,
        text: 'An unknown error occurred',
      }],
    };
  }
});

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'telegraph://page/{path}',
        name: 'Telegraph Page',
        description: 'Get content of a Telegraph page by its path',
        mimeType: 'application/json',
      },
    ],
  };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  // Parse telegraph://page/{path}
  if (uri.startsWith('telegraph://page/')) {
    const path = uri.replace('telegraph://page/', '');
    const page = await telegraph.getPage(path, true);
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(page, null, 2),
      }],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP communication)
  console.error(`${SERVER_NAME} v${SERVER_VERSION} started`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
