import { marked } from 'marked';
import type { HtmlOutputOptions } from '../types/index.js';

const DEFAULT_CSS = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: #333;
}
h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; }
pre { background: #f4f4f4; padding: 1em; overflow-x: auto; border-radius: 5px; }
pre code { background: none; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid #ddd; padding: 0.5em; text-align: left; }
th { background: #f4f4f4; }
blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1em; color: #666; }
a { color: #0366d6; }
`.trim();

const DARK_CSS = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: #e0e0e0;
  background: #1a1a1a;
}
h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; color: #fff; }
code { background: #2d2d2d; padding: 0.2em 0.4em; border-radius: 3px; }
pre { background: #2d2d2d; padding: 1em; overflow-x: auto; border-radius: 5px; }
pre code { background: none; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid #444; padding: 0.5em; text-align: left; }
th { background: #2d2d2d; }
blockquote { border-left: 4px solid #444; margin: 0; padding-left: 1em; color: #999; }
a { color: #58a6ff; }
`.trim();

export async function toHtml(
  markdown: string,
  options: Partial<HtmlOutputOptions> = {}
): Promise<string> {
  const {
    fullDocument = true,
    title = 'Documentation',
    darkTheme = false,
    includeCss = true,
  } = options;

  const htmlContent = await marked.parse(markdown);

  if (!fullDocument) {
    return htmlContent;
  }

  const css = includeCss ? (darkTheme ? DARK_CSS : DEFAULT_CSS) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
${htmlContent}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
