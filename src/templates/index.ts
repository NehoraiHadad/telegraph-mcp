/**
 * Telegraph Page Templates
 * Pre-built templates for common page types
 */

export interface TemplateField {
  name: string;
  description: string;
  required: boolean;
  type: 'string' | 'string[]';
}

export interface Template {
  name: string;
  description: string;
  fields: TemplateField[];
  generate: (data: Record<string, unknown>) => string;
}

// Blog Post Template
const blogPostTemplate: Template = {
  name: 'blog_post',
  description: 'A blog post with title, introduction, body sections, and conclusion',
  fields: [
    { name: 'title', description: 'Blog post title', required: true, type: 'string' },
    { name: 'intro', description: 'Introduction paragraph', required: true, type: 'string' },
    { name: 'sections', description: 'Array of {heading, content} objects', required: true, type: 'string[]' },
    { name: 'conclusion', description: 'Conclusion paragraph', required: false, type: 'string' },
  ],
  generate: (data) => {
    const sections = (data.sections as Array<{heading: string; content: string}>) || [];
    let html = `<p>${data.intro}</p>`;

    for (const section of sections) {
      html += `<h3>${section.heading}</h3><p>${section.content}</p>`;
    }

    if (data.conclusion) {
      html += `<h4>Conclusion</h4><p>${data.conclusion}</p>`;
    }

    return html;
  },
};

// Documentation Template
const documentationTemplate: Template = {
  name: 'documentation',
  description: 'Technical documentation with overview, installation, usage, and API reference',
  fields: [
    { name: 'title', description: 'Documentation title', required: true, type: 'string' },
    { name: 'overview', description: 'Project overview', required: true, type: 'string' },
    { name: 'installation', description: 'Installation instructions', required: false, type: 'string' },
    { name: 'usage', description: 'Usage examples', required: false, type: 'string' },
    { name: 'api_reference', description: 'API reference sections', required: false, type: 'string[]' },
  ],
  generate: (data) => {
    let html = `<h3>Overview</h3><p>${data.overview}</p>`;

    if (data.installation) {
      html += `<h3>Installation</h3><pre>${data.installation}</pre>`;
    }

    if (data.usage) {
      html += `<h3>Usage</h3><pre>${data.usage}</pre>`;
    }

    const apiRef = data.api_reference as Array<{name: string; description: string}> | undefined;
    if (apiRef?.length) {
      html += `<h3>API Reference</h3>`;
      for (const item of apiRef) {
        html += `<h4>${item.name}</h4><p>${item.description}</p>`;
      }
    }

    return html;
  },
};

// Article Template
const articleTemplate: Template = {
  name: 'article',
  description: 'News article with title, subtitle, and body',
  fields: [
    { name: 'title', description: 'Article title', required: true, type: 'string' },
    { name: 'subtitle', description: 'Article subtitle', required: false, type: 'string' },
    { name: 'body', description: 'Article body paragraphs', required: true, type: 'string[]' },
  ],
  generate: (data) => {
    let html = '';
    if (data.subtitle) {
      html += `<aside>${data.subtitle}</aside>`;
    }

    const body = data.body as string[] || [];
    for (const paragraph of body) {
      html += `<p>${paragraph}</p>`;
    }

    return html;
  },
};

// Changelog Template
const changelogTemplate: Template = {
  name: 'changelog',
  description: 'Software changelog with version, date, and categorized changes',
  fields: [
    { name: 'title', description: 'Changelog title', required: true, type: 'string' },
    { name: 'version', description: 'Version number', required: true, type: 'string' },
    { name: 'date', description: 'Release date', required: true, type: 'string' },
    { name: 'added', description: 'New features', required: false, type: 'string[]' },
    { name: 'changed', description: 'Changes', required: false, type: 'string[]' },
    { name: 'fixed', description: 'Bug fixes', required: false, type: 'string[]' },
  ],
  generate: (data) => {
    let html = `<h3>Version ${data.version} - ${data.date}</h3>`;

    const added = data.added as string[] | undefined;
    if (added?.length) {
      html += `<h4>Added</h4><ul>${added.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }

    const changed = data.changed as string[] | undefined;
    if (changed?.length) {
      html += `<h4>Changed</h4><ul>${changed.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }

    const fixed = data.fixed as string[] | undefined;
    if (fixed?.length) {
      html += `<h4>Fixed</h4><ul>${fixed.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }

    return html;
  },
};

// Tutorial Template
const tutorialTemplate: Template = {
  name: 'tutorial',
  description: 'Step-by-step tutorial with prerequisites and numbered steps',
  fields: [
    { name: 'title', description: 'Tutorial title', required: true, type: 'string' },
    { name: 'description', description: 'Brief description', required: true, type: 'string' },
    { name: 'prerequisites', description: 'Prerequisites list', required: false, type: 'string[]' },
    { name: 'steps', description: 'Tutorial steps with title and content', required: true, type: 'string[]' },
    { name: 'conclusion', description: 'Conclusion', required: false, type: 'string' },
  ],
  generate: (data) => {
    let html = `<p>${data.description}</p>`;

    const prereqs = data.prerequisites as string[] | undefined;
    if (prereqs?.length) {
      html += `<h3>Prerequisites</h3><ul>${prereqs.map(p => `<li>${p}</li>`).join('')}</ul>`;
    }

    const steps = data.steps as Array<{title: string; content: string}> || [];
    html += `<h3>Steps</h3><ol>`;
    for (const step of steps) {
      html += `<li><b>${step.title}</b><p>${step.content}</p></li>`;
    }
    html += `</ol>`;

    if (data.conclusion) {
      html += `<h3>Conclusion</h3><p>${data.conclusion}</p>`;
    }

    return html;
  },
};

export const templates: Record<string, Template> = {
  blog_post: blogPostTemplate,
  documentation: documentationTemplate,
  article: articleTemplate,
  changelog: changelogTemplate,
  tutorial: tutorialTemplate,
};

export function getTemplate(name: string): Template | undefined {
  return templates[name];
}

export function listTemplates(): Array<{name: string; description: string; fields: TemplateField[]}> {
  return Object.values(templates).map(t => ({
    name: t.name,
    description: t.description,
    fields: t.fields,
  }));
}
