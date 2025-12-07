# Telegraph MCP Server

An MCP (Model Context Protocol) server that exposes the [Telegraph API](https://telegra.ph/api) as tools for Claude and other LLM clients. This allows AI assistants to create, edit, and manage Telegraph pages programmatically.

## Features

- **9 Telegraph API tools** covering all Telegraph functionality
- Create and manage Telegraph accounts
- Create, edit, and retrieve Telegraph pages
- View statistics for pages
- HTML content support with automatic conversion to Telegraph's Node format

## Installation

### Option 1: Via npm (Recommended)

```bash
# With Claude Code
claude mcp add telegraph -- npx telegraph-mcp

# Or globally
npm install -g telegraph-mcp
```

### Option 2: From Source

```bash
git clone https://github.com/NehoraiHadad/telegraph-mcp.git
cd telegraph-mcp
npm install
npm run build
claude mcp add telegraph -- node $(pwd)/dist/index.js
```

## Usage with Claude Code

```bash
claude mcp add telegraph -- npx telegraph-mcp
```

## Usage with Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "telegraph": {
      "command": "node",
      "args": ["/absolute/path/to/telegraph-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

### Account Management

| Tool | Description | Auth Required |
|------|-------------|---------------|
| `telegraph_create_account` | Create a new Telegraph account | No |
| `telegraph_edit_account_info` | Update account information | Yes |
| `telegraph_get_account_info` | Get account details | Yes |
| `telegraph_revoke_access_token` | Revoke and regenerate access token | Yes |

### Page Management

| Tool | Description | Auth Required |
|------|-------------|---------------|
| `telegraph_create_page` | Create a new Telegraph page | Yes |
| `telegraph_edit_page` | Edit an existing page | Yes |
| `telegraph_get_page` | Get a page by path | No |
| `telegraph_get_page_list` | List all pages for an account | Yes |
| `telegraph_get_views` | Get view statistics for a page | No |

## Example Usage

### Creating an Account

```
Use telegraph_create_account with:
- short_name: "MyBot"
- author_name: "AI Assistant"
```

This returns an `access_token` that you should save for future operations.

### Creating a Page

```
Use telegraph_create_page with:
- access_token: "your_token_here"
- title: "My First Telegraph Page"
- content: "<p>Hello <b>world</b>!</p><p>This is my first Telegraph page.</p>"
```

### Content Format

The `content` parameter accepts:
- **HTML strings**: `"<p>Hello <b>world</b></p>"`
- **JSON Node arrays**: `[{"tag": "p", "children": ["Hello ", {"tag": "b", "children": ["world"]}]}]`

#### Supported HTML Tags

`a`, `aside`, `b`, `blockquote`, `br`, `code`, `em`, `figcaption`, `figure`, `h3`, `h4`, `hr`, `i`, `iframe`, `img`, `li`, `ol`, `p`, `pre`, `s`, `strong`, `u`, `ul`, `video`

#### Supported Attributes

- `href` - for `<a>` tags
- `src` - for `<img>`, `<video>`, `<iframe>` tags

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run directly (for testing)
npm start
```

## Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## API Reference

This server implements all methods from the [Telegraph API](https://telegra.ph/api):

1. **createAccount** - Create a new Telegraph account
2. **editAccountInfo** - Update account information
3. **getAccountInfo** - Get account details
4. **revokeAccessToken** - Revoke access token
5. **createPage** - Create a new page
6. **editPage** - Edit an existing page
7. **getPage** - Get a page
8. **getPageList** - Get list of pages
9. **getViews** - Get page view statistics

## License

MIT
