# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-07

### Added

- **Markdown Support**: Write content in Markdown format with automatic conversion to Telegraph HTML
  - Headers (`#`, `##`, `###`, `####`)
  - Bold (`**text**`), Italic (`*text*`)
  - Links (`[text](url)`), Images (`![alt](src)`)
  - Lists (ordered and unordered)
  - Blockquotes, code blocks, horizontal rules
  - New `format` parameter for `telegraph_create_page` and `telegraph_edit_page`

- **Image Upload**: New `telegraph_upload_image` tool
  - Upload images directly to Telegraph servers
  - Supports file path or base64 input
  - Supported formats: JPEG, PNG, GIF, MP4

- **Templates System**: Pre-built page templates
  - `telegraph_list_templates` - List all available templates
  - `telegraph_create_from_template` - Create pages using templates
  - 5 templates: `blog_post`, `documentation`, `article`, `changelog`, `tutorial`

- **Export/Backup**: Export and backup capabilities
  - `telegraph_export_page` - Export single page to Markdown or HTML
  - `telegraph_backup_account` - Backup all pages from an account

- **MCP Resources**: Access Telegraph pages as MCP resources
  - `telegraph://page/{path}` - Get page content by path

- **MCP Prompts**: Pre-defined prompts for guided workflows
  - `create-blog-post` - Guide for creating blog posts
  - `create-documentation` - Guide for creating documentation
  - `summarize-page` - Summarize existing pages

### Changed

- Updated `parseContent()` to accept optional `format` parameter
- Server capabilities now include `resources` and `prompts`

## [1.0.0] - 2025-12-06

### Added

- Initial release
- 9 Telegraph API tools:
  - `telegraph_create_account`
  - `telegraph_edit_account_info`
  - `telegraph_get_account_info`
  - `telegraph_revoke_access_token`
  - `telegraph_create_page`
  - `telegraph_edit_page`
  - `telegraph_get_page`
  - `telegraph_get_page_list`
  - `telegraph_get_views`
- HTML to Telegraph Node conversion
- Full TypeScript support
- Zod input validation
