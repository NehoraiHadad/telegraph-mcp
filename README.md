# Telegraph MCP Server

[![npm version](https://badge.fury.io/js/telegraph-mcp.svg)](https://www.npmjs.com/package/telegraph-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An MCP (Model Context Protocol) server that exposes the [Telegraph API](https://telegra.ph/api) as tools for Claude and other LLM clients. This allows AI assistants to create, edit, and manage Telegraph pages programmatically.

## Quick Start

```bash
npx telegraph-mcp
```

Or add to Claude Code:
```bash
claude mcp add telegraph -- npx telegraph-mcp
```

## Features

- **15 Telegraph API tools** covering all Telegraph functionality
- Create and manage Telegraph accounts
- Create, edit, and retrieve Telegraph pages
- View statistics for pages
- **Markdown support** - Write content in Markdown, automatically converted to Telegraph format
- **Image upload** - Upload images directly to Telegraph servers
- **Templates** - Pre-built templates for blog posts, documentation, articles, changelogs, and tutorials
- **Export/Backup** - Export pages to Markdown or HTML, backup entire accounts
- **MCP Resources** - Access Telegraph pages as MCP resources
- **MCP Prompts** - Pre-defined prompts for common tasks

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
      "command": "npx",
      "args": ["-y", "telegraph-mcp"]
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
| `telegraph_create_page` | Create a new Telegraph page (supports Markdown!) | Yes |
| `telegraph_edit_page` | Edit an existing page | Yes |
| `telegraph_get_page` | Get a page by path | No |
| `telegraph_get_page_list` | List all pages for an account | Yes |
| `telegraph_get_views` | Get view statistics for a page | No |

### Media

| Tool | Description | Auth Required |
|------|-------------|---------------|
| `telegraph_upload_image` | Upload image/video to Telegraph servers | No |

### Templates

| Tool | Description | Auth Required |
|------|-------------|---------------|
| `telegraph_list_templates` | List all available page templates | No |
| `telegraph_create_from_template` | Create a page using a template | Yes |

### Export & Backup

| Tool | Description | Auth Required |
|------|-------------|---------------|
| `telegraph_export_page` | Export a page to Markdown or HTML | No |
| `telegraph_backup_account` | Backup all pages from an account | Yes |

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

### Creating a Page with Markdown

```
Use telegraph_create_page with:
- access_token: "your_token_here"
- title: "My Markdown Page"
- content: "# Hello World\n\nThis is **bold** and *italic*.\n\n- List item 1\n- List item 2"
- format: "markdown"
```

### Uploading an Image

```
Use telegraph_upload_image with:
- file_path: "/path/to/image.jpg"
```

Returns the Telegraph URL for use in your pages.

### Using Templates

```
Use telegraph_create_from_template with:
- access_token: "your_token_here"
- template: "blog_post"
- title: "My Blog Post"
- data: {
    "intro": "Welcome to my blog!",
    "sections": [
      {"heading": "First Section", "content": "Section content here"}
    ],
    "conclusion": "Thanks for reading!"
  }
```

Available templates: `blog_post`, `documentation`, `article`, `changelog`, `tutorial`

### Content Format

The `content` parameter accepts:
- **Markdown** (with `format: "markdown"`): `"# Hello\n\n**Bold** and *italic*"`
- **HTML strings**: `"<p>Hello <b>world</b></p>"`
- **JSON Node arrays**: `[{"tag": "p", "children": ["Hello ", {"tag": "b", "children": ["world"]}]}]`

#### Supported Markdown Syntax

| Syntax | Result |
|--------|--------|
| `# Header` | H3 heading |
| `## Subheader` | H4 heading |
| `**bold**` | Bold text |
| `*italic*` | Italic text |
| `[text](url)` | Link |
| `![alt](url)` | Image |
| `- item` | Unordered list |
| `1. item` | Ordered list |
| `> quote` | Blockquote |
| `` `code` `` | Inline code |
| ` ```code``` ` | Code block |
| `---` | Horizontal rule |

#### Supported HTML Tags

`a`, `aside`, `b`, `blockquote`, `br`, `code`, `em`, `figcaption`, `figure`, `h3`, `h4`, `hr`, `i`, `iframe`, `img`, `li`, `ol`, `p`, `pre`, `s`, `strong`, `u`, `ul`, `video`

#### Supported Attributes

- `href` - for `<a>` tags
- `src` - for `<img>`, `<video>`, `<iframe>` tags

## MCP Resources

Access Telegraph pages as MCP resources:

```
telegraph://page/{path}
```

Example: `telegraph://page/Sample-Page-12-15`

## MCP Prompts

Available prompts for guided workflows:

| Prompt | Description |
|--------|-------------|
| `create-blog-post` | Guide for creating a blog post |
| `create-documentation` | Guide for creating documentation |
| `summarize-page` | Summarize an existing page |

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
