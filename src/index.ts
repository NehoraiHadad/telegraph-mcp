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
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { allTools, handleTool } from './tools/index.js';
import { TelegraphError } from './telegraph-client.js';

// Server metadata
const SERVER_NAME = 'telegraph-mcp';
const SERVER_VERSION = '1.0.0';

// Create the MCP server
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

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
