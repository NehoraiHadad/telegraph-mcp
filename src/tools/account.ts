/**
 * Telegraph Account Tools
 * MCP tool definitions for account-related operations
 */

import { z } from 'zod';
import * as telegraph from '../telegraph-client.js';
import type { AccountField } from '../types.js';

// Zod schemas for input validation
export const CreateAccountSchema = z.object({
  short_name: z.string().min(1).max(32).describe('Account name (1-32 characters)'),
  author_name: z.string().max(128).optional().describe('Default author name (0-128 characters)'),
  author_url: z.string().max(512).optional().describe('Default profile link (0-512 characters)'),
});

export const EditAccountInfoSchema = z.object({
  access_token: z.string().describe('Access token of the Telegraph account'),
  short_name: z.string().min(1).max(32).optional().describe('New account name (1-32 characters)'),
  author_name: z.string().max(128).optional().describe('New default author name (0-128 characters)'),
  author_url: z.string().max(512).optional().describe('New default profile link (0-512 characters)'),
});

export const GetAccountInfoSchema = z.object({
  access_token: z.string().describe('Access token of the Telegraph account'),
  fields: z.array(z.enum(['short_name', 'author_name', 'author_url', 'auth_url', 'page_count']))
    .optional()
    .describe('List of account fields to return'),
});

export const RevokeAccessTokenSchema = z.object({
  access_token: z.string().describe('Access token of the Telegraph account'),
});

// Tool definitions
export const accountTools = [
  {
    name: 'telegraph_create_account',
    description: 'Create a new Telegraph account. Returns an Account object with access_token that should be saved for future requests.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        short_name: {
          type: 'string',
          description: 'Account name (1-32 characters)',
          minLength: 1,
          maxLength: 32,
        },
        author_name: {
          type: 'string',
          description: 'Default author name used when creating new articles (0-128 characters)',
          maxLength: 128,
        },
        author_url: {
          type: 'string',
          description: 'Profile link opened when users click on the author name (0-512 characters)',
          maxLength: 512,
        },
      },
      required: ['short_name'],
    },
  },
  {
    name: 'telegraph_edit_account_info',
    description: 'Update information about a Telegraph account. At least one optional parameter must be provided.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        access_token: {
          type: 'string',
          description: 'Access token of the Telegraph account',
        },
        short_name: {
          type: 'string',
          description: 'New account name (1-32 characters)',
          minLength: 1,
          maxLength: 32,
        },
        author_name: {
          type: 'string',
          description: 'New default author name (0-128 characters)',
          maxLength: 128,
        },
        author_url: {
          type: 'string',
          description: 'New default profile link (0-512 characters)',
          maxLength: 512,
        },
      },
      required: ['access_token'],
    },
  },
  {
    name: 'telegraph_get_account_info',
    description: 'Get information about a Telegraph account.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        access_token: {
          type: 'string',
          description: 'Access token of the Telegraph account',
        },
        fields: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['short_name', 'author_name', 'author_url', 'auth_url', 'page_count'],
          },
          description: 'List of account fields to return (default: short_name, author_name, author_url)',
        },
      },
      required: ['access_token'],
    },
  },
  {
    name: 'telegraph_revoke_access_token',
    description: 'Revoke the current access_token and generate a new one. The old token becomes invalid immediately.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        access_token: {
          type: 'string',
          description: 'Access token of the Telegraph account to revoke',
        },
      },
      required: ['access_token'],
    },
  },
];

// Tool handlers
export async function handleAccountTool(name: string, args: unknown) {
  switch (name) {
    case 'telegraph_create_account': {
      const input = CreateAccountSchema.parse(args);
      const result = await telegraph.createAccount(
        input.short_name,
        input.author_name,
        input.author_url
      );
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }

    case 'telegraph_edit_account_info': {
      const input = EditAccountInfoSchema.parse(args);
      const result = await telegraph.editAccountInfo(
        input.access_token,
        input.short_name,
        input.author_name,
        input.author_url
      );
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }

    case 'telegraph_get_account_info': {
      const input = GetAccountInfoSchema.parse(args);
      const result = await telegraph.getAccountInfo(
        input.access_token,
        input.fields as AccountField[] | undefined
      );
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }

    case 'telegraph_revoke_access_token': {
      const input = RevokeAccessTokenSchema.parse(args);
      const result = await telegraph.revokeAccessToken(input.access_token);
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
