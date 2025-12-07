# Telegraph MCP - Implementation Guide for AI Agents

## Mission

You are tasked with enhancing the Telegraph MCP server with additional features and capabilities. Follow this guide systematically to research, implement, test, and document all improvements.

---

## Phase 1: Research (MANDATORY FIRST STEP)

### 1.1 Study the Official Telegraph API

**IMPORTANT**: Before implementing anything, thoroughly research the Telegraph API:

1. Fetch and analyze the official API documentation:
   - URL: https://telegra.ph/api
   - Document ALL endpoints, parameters, and response types
   - Note any undocumented features or edge cases

2. Research Telegraph's file upload capability:
   - Endpoint: https://telegra.ph/upload
   - Supported file types and size limits
   - Response format

3. Check for any API updates or changes since the original implementation

### 1.2 Analyze Current Implementation

Read and understand the existing codebase:
- `src/types.ts` - Type definitions
- `src/telegraph-client.ts` - API client
- `src/tools/account.ts` - Account tools
- `src/tools/pages.ts` - Page tools
- `src/index.ts` - Main server

Document what's already implemented vs what's missing.

---

## Phase 2: Implementation Tasks

### 2.1 Markdown Support (Priority: HIGH)

**Goal**: Allow users to write content in Markdown instead of HTML.

**Implementation**:
1. Add a Markdown-to-HTML converter (use a lightweight library or implement basic conversion)
2. Update `telegraph_create_page` and `telegraph_edit_page` to accept `format: "markdown" | "html"`
3. Supported Markdown features:
   - Headers (`#`, `##`, `###`, `####`)
   - Bold (`**text**`)
   - Italic (`*text*`)
   - Links (`[text](url)`)
   - Images (`![alt](url)`)
   - Lists (ordered and unordered)
   - Blockquotes (`>`)
   - Code blocks (``` and inline `)
   - Horizontal rules (`---`)

**Files to modify**:
- `src/telegraph-client.ts` - Add `markdownToHtml()` function
- `src/tools/pages.ts` - Update schemas and handlers

### 2.2 Image Upload (Priority: HIGH)

**Goal**: Allow uploading images directly to Telegraph's servers.

**Research first**:
- Telegraph upload endpoint: `POST https://telegra.ph/upload`
- Accepts multipart/form-data
- Returns array of image paths

**Implementation**:
1. Create new tool `telegraph_upload_image`
2. Input: file path or base64 content
3. Output: Telegraph image URL

**New file**: `src/tools/media.ts`

### 2.3 Templates System (Priority: MEDIUM)

**Goal**: Pre-built templates for common page types.

**Templates to create**:
1. `blog_post` - Title, intro, sections, conclusion
2. `documentation` - Title, overview, sections with code examples
3. `article` - Title, subtitle, author, content sections
4. `changelog` - Version, date, changes list
5. `tutorial` - Title, prerequisites, steps, conclusion

**Implementation**:
1. Create `src/templates/` directory
2. Define template interfaces
3. Create new tool `telegraph_create_from_template`

### 2.4 MCP Resources (Priority: MEDIUM)

**Goal**: Expose Telegraph data as MCP Resources.

**Resources to implement**:
1. `telegraph://account/{token}/info` - Account information
2. `telegraph://account/{token}/pages` - List of pages
3. `telegraph://page/{path}` - Page content

**Implementation**:
- Add resource handlers in `src/index.ts`
- Implement `ListResourcesRequestSchema` and `ReadResourceRequestSchema`

### 2.5 MCP Prompts (Priority: LOW)

**Goal**: Pre-defined prompts for common tasks.

**Prompts to create**:
1. `create-blog-post` - Guide for creating a blog post
2. `create-documentation` - Guide for creating documentation
3. `summarize-page` - Summarize an existing page

**Implementation**:
- Add prompt handlers in `src/index.ts`
- Implement `ListPromptsRequestSchema` and `GetPromptRequestSchema`

### 2.6 Backup & Export (Priority: LOW)

**Goal**: Export pages to different formats.

**Tools to create**:
1. `telegraph_export_page` - Export single page to Markdown/HTML
2. `telegraph_backup_account` - Export all pages from an account

---

## Phase 3: Testing

### 3.1 Manual Testing

For each new feature:
1. Build the project: `npm run build`
2. Test with MCP Inspector: `npx @modelcontextprotocol/inspector node dist/index.js`
3. Verify all tools appear and work correctly

### 3.2 Test Scenarios

Create test scenarios for:
- [ ] Create page with Markdown content
- [ ] Upload an image and use it in a page
- [ ] Create page from each template
- [ ] Read resources
- [ ] Export page to Markdown
- [ ] Backup entire account

---

## Phase 4: Documentation Updates

### 4.1 Update README.md

Add documentation for all new features:
- New tools with examples
- Markdown syntax support
- Templates usage
- Resources documentation

### 4.2 Update PLAN.md

Document the new architecture and any design decisions.

### 4.3 Create CHANGELOG.md

Document all changes for version 1.1.0:
```markdown
# Changelog

## [1.1.0] - YYYY-MM-DD

### Added
- Markdown content support
- Image upload tool
- Page templates system
- MCP Resources
- MCP Prompts
- Export/backup tools

### Changed
- Updated content parsing to support format parameter
```

---

## Phase 5: Release

### 5.1 Version Bump

Update `package.json` version to `1.1.0`

### 5.2 Commit Changes

```bash
git add -A
git commit -m "feat: Add Markdown support, image upload, templates, and more

- Add Markdown to HTML conversion
- Add telegraph_upload_image tool
- Add template system with 5 templates
- Add MCP Resources for account and pages
- Add MCP Prompts for common tasks
- Add export and backup tools
- Update documentation"
```

### 5.3 Push and Release

```bash
git push origin main
git tag v1.1.0
git push origin v1.1.0
```

Then create a GitHub Release to trigger npm publish.

---

## Code Quality Guidelines

### TypeScript
- Use strict typing
- Add JSDoc comments for all public functions
- Use Zod for input validation

### Error Handling
- Wrap all API calls in try-catch
- Return meaningful error messages
- Use the existing `TelegraphError` class

### Consistency
- Follow existing code patterns
- Use the same naming conventions
- Keep tool names prefixed with `telegraph_`

---

## Checklist

Before completing, verify:

- [ ] All Phase 1 research is documented
- [ ] All new tools are implemented and working
- [ ] All existing tests still pass
- [ ] README.md is updated with all new features
- [ ] CHANGELOG.md is created
- [ ] package.json version is updated
- [ ] Code is committed and pushed
- [ ] No TypeScript errors (`npm run build` succeeds)

---

## Quick Start Command

To begin implementation, run:

```bash
cd /home/ubuntu/projects/telegraph-mcp
npm install
npm run build
```

Then start implementing Phase 2 features one by one.

Good luck! 🚀
