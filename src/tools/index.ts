/**
 * Telegraph Tools Export
 * Combines all tool definitions and handlers
 */

import { accountTools, handleAccountTool } from './account.js';
import { pageTools, handlePageTool } from './pages.js';
import { mediaTools, handleMediaTool } from './media.js';
import { templateTools, handleTemplateTool } from './templates.js';
import { exportTools, handleExportTool } from './export.js';

// Export all tool definitions
export const allTools = [...accountTools, ...pageTools, ...mediaTools, ...templateTools, ...exportTools];

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

  // Try media tools
  const mediaResult = await handleMediaTool(name, args);
  if (mediaResult !== null) {
    return mediaResult;
  }

  // Try template tools
  const templateResult = await handleTemplateTool(name, args);
  if (templateResult !== null) {
    return templateResult;
  }

  // Try export tools
  const exportResult = await handleExportTool(name, args);
  if (exportResult !== null) {
    return exportResult;
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
