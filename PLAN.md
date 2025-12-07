# Telegraph MCP Server - Implementation Plan

## Overview
Create an MCP (Model Context Protocol) server that exposes the Telegraph API (telegra.ph) as MCP tools, allowing Claude and other LLM clients to create and manage Telegraph pages.

## Telegraph API Summary

### Methods to Implement (9 total)

| Method | Auth Required | Description |
|--------|---------------|-------------|
| `createAccount` | No | Create new Telegraph account |
| `editAccountInfo` | Yes | Edit account details |
| `getAccountInfo` | Yes | Get account information |
| `revokeAccessToken` | Yes | Revoke and get new token |
| `createPage` | Yes | Create a new Telegraph page |
| `editPage` | Yes | Edit existing page |
| `getPage` | No | Get page content |
| `getPageList` | Yes | List account's pages |
| `getViews` | No | Get page view statistics |

### Data Types
- **Account**: short_name, author_name, author_url, access_token, auth_url, page_count
- **Page**: path, url, title, description, author_name, author_url, image_url, content, views, can_edit
- **Node**: String OR NodeElement (tag, attrs, children)
- **Available tags**: a, aside, b, blockquote, br, code, em, figcaption, figure, h3, h4, hr, i, iframe, img, li, ol, p, pre, s, strong, u, ul, video

---

## Project Structure

```
telegraph-mcp/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── telegraph-client.ts   # Telegraph API client wrapper
│   ├── tools/
│   │   ├── index.ts          # Tool registration
│   │   ├── account.ts        # Account-related tools
│   │   └── pages.ts          # Page-related tools
│   └── types.ts              # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

---

## Implementation Steps

### Step 1: Project Setup
- Initialize npm project
- Install dependencies:
  - `@modelcontextprotocol/sdk` - MCP SDK
  - `zod` - Schema validation
  - `typescript` - TypeScript compiler
- Configure TypeScript (ES modules, strict mode)
- Configure package.json with proper scripts and bin entry

### Step 2: Type Definitions (`src/types.ts`)
Define TypeScript interfaces for:
- Account
- Page
- PageList
- PageViews
- Node / NodeElement
- API response wrapper

### Step 3: Telegraph API Client (`src/telegraph-client.ts`)
Create a reusable HTTP client class:
- Base URL: `https://api.telegra.ph`
- Support for GET and POST requests
- JSON response parsing
- Error handling for API errors
- Methods for all 9 API endpoints

### Step 4: MCP Tools Implementation

#### Account Tools (`src/tools/account.ts`)

1. **telegraph_create_account**
   - Input: short_name (required), author_name, author_url
   - Output: Account with access_token
   - No auth required

2. **telegraph_edit_account_info**
   - Input: access_token (required), short_name, author_name, author_url
   - Output: Updated Account
   - Auth required

3. **telegraph_get_account_info**
   - Input: access_token (required), fields (optional array)
   - Output: Account info
   - Auth required

4. **telegraph_revoke_access_token**
   - Input: access_token (required)
   - Output: Account with new access_token
   - Auth required

#### Page Tools (`src/tools/pages.ts`)

5. **telegraph_create_page**
   - Input: access_token, title, content (HTML string or Node array), author_name, author_url, return_content
   - Output: Page object with URL
   - Auth required
   - Special handling: Convert HTML string to Node array if needed

6. **telegraph_edit_page**
   - Input: access_token, path, title, content, author_name, author_url, return_content
   - Output: Updated Page object
   - Auth required

7. **telegraph_get_page**
   - Input: path (required), return_content (optional)
   - Output: Page object
   - No auth required

8. **telegraph_get_page_list**
   - Input: access_token (required), offset (default 0), limit (0-200, default 50)
   - Output: PageList with total_count and pages array
   - Auth required

9. **telegraph_get_views**
   - Input: path (required), year, month, day, hour (optional filters)
   - Output: PageViews with view count
   - No auth required

### Step 5: Main Server (`src/index.ts`)
- Initialize MCP Server
- Register all tools
- Set up stdio transport
- Error handling and logging

### Step 6: Build & Package
- Build TypeScript to JavaScript
- Test with MCP Inspector
- Create README with usage instructions

---

## Tool Input Schemas (JSON Schema format)

### telegraph_create_account
```json
{
  "type": "object",
  "properties": {
    "short_name": { "type": "string", "minLength": 1, "maxLength": 32 },
    "author_name": { "type": "string", "maxLength": 128 },
    "author_url": { "type": "string", "maxLength": 512 }
  },
  "required": ["short_name"]
}
```

### telegraph_create_page
```json
{
  "type": "object",
  "properties": {
    "access_token": { "type": "string" },
    "title": { "type": "string", "minLength": 1, "maxLength": 256 },
    "content": { "type": "string", "description": "HTML content or JSON array of nodes" },
    "author_name": { "type": "string", "maxLength": 128 },
    "author_url": { "type": "string", "maxLength": 512 },
    "return_content": { "type": "boolean", "default": false }
  },
  "required": ["access_token", "title", "content"]
}
```

### telegraph_get_page
```json
{
  "type": "object",
  "properties": {
    "path": { "type": "string" },
    "return_content": { "type": "boolean", "default": false }
  },
  "required": ["path"]
}
```

---

## Content Handling Strategy

Telegraph content uses a specific Node format. For ease of use, the MCP tools will:

1. Accept HTML strings and automatically convert to Node format
2. Also accept raw Node arrays for advanced users
3. Use a simple HTML parser to convert common tags

Example conversion:
```
Input HTML: "<p>Hello <b>world</b></p>"
Output Nodes: [{"tag": "p", "children": ["Hello ", {"tag": "b", "children": ["world"]}]}]
```

---

## Configuration

The server will support configuration via environment variables:
- `TELEGRAPH_ACCESS_TOKEN` - Optional default access token
- `LOG_LEVEL` - Logging verbosity (debug/info/warn/error)

---

## Testing Strategy

1. Use MCP Inspector for interactive testing
2. Test each tool individually:
   - Create account
   - Create page with the new token
   - Get page
   - Edit page
   - Get views
   - Get page list
3. Test error cases (invalid tokens, missing parameters)

---

## Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Files to Create

1. `package.json` - Project configuration
2. `tsconfig.json` - TypeScript configuration
3. `src/types.ts` - Type definitions
4. `src/telegraph-client.ts` - API client
5. `src/tools/account.ts` - Account tools
6. `src/tools/pages.ts` - Page tools
7. `src/tools/index.ts` - Tool exports
8. `src/index.ts` - Main server
9. `README.md` - Documentation
