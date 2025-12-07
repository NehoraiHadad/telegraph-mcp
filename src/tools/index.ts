/**
 * Telegraph Tools Export
 * Combines all tool definitions and handlers
 */

import { accountTools, handleAccountTool } from './account.js';
import { pageTools, handlePageTool } from './pages.js';

// Export all tool definitions
export const allTools = [...accountTools, ...pageTools];

// Combined tool handler
export async function handleTool(name: string, args: unknown) {
  // Try account tools first
  const accountResult = await handleAccountTool(name, args);
  if (accountResult !== null) {
    return accountResult;
  }

  // Try page tools
  const pageResult = await handlePageTool(name, args);
  if (pageResult !== null) {
    return pageResult;
  }

  // Unknown tool
  return {
    isError: true,
    content: [{
      type: 'text' as const,
      text: `Unknown tool: ${name}`,
    }],
  };
}
