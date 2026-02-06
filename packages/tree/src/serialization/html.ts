import fs from 'node:fs/promises';
import path from 'node:path';

import { TreeNode } from '../node/index.js';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCount = (count: number): string => `${count} skill${count === 1 ? '' : 's'}`;

const renderNode = (node: TreeNode, depth: number, openByDefault: boolean): string => {
  const count = node.countAllSkills();
  const description = node.description?.trim() ?? '';
  const hasChildren = node.children.length > 0;
  const showSkills = !hasChildren && node.skills.length > 0;
  const openAttr = openByDefault ? ' open' : '';

  const summary = `
    <summary>
      <span class="node-name">${escapeHtml(node.name)}</span>
      <span class="node-count">${escapeHtml(formatCount(count))}</span>
      ${description ? `<span class="node-desc">${escapeHtml(description)}</span>` : ''}
    </summary>
  `;

  const childrenHtml = hasChildren
    ? node.children.map((child) => renderNode(child, depth + 1, depth < 1)).join('\n')
    : '';

  const skillsHtml = showSkills
    ? `
      <ul class="skills">
        ${node.skills
          .map((skill) => {
            const skillDescription = skill.description?.trim() ?? '';
            return `
              <li>
                <span class="skill-name">${escapeHtml(skill.name)}</span>
                ${
                  skillDescription
                    ? `<span class="skill-desc">${escapeHtml(skillDescription)}</span>`
                    : ''
                }
              </li>
            `;
          })
          .join('')}
      </ul>
    `
    : '';

  return `
    <details class="node depth-${depth}"${openAttr}>
      ${summary}
      <div class="node-body">
        ${childrenHtml}
        ${skillsHtml}
      </div>
    </details>
  `;
};

export async function saveTreeToHTML(node: TreeNode, filePath: string): Promise<void> {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Skill Capability Tree</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0f1115;
        --surface: #171a21;
        --surface-strong: #1f2430;
        --text: #f2f3f7;
        --muted: #a2a9b8;
        --accent: #4cc9f0;
        --border: #262b3a;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 32px;
        font-family: 'Space Grotesk', 'Sora', 'Avenir', system-ui, sans-serif;
        background: radial-gradient(circle at top, #1b1f2a, var(--bg));
        color: var(--text);
      }

      header {
        margin-bottom: 24px;
      }

      h1 {
        font-size: 28px;
        margin: 0 0 8px;
      }

      p {
        margin: 0;
        color: var(--muted);
      }

      .tree {
        display: grid;
        gap: 12px;
      }

      details.node {
        border: 1px solid var(--border);
        border-radius: 12px;
        background: var(--surface);
        padding: 12px 16px;
      }

      details.node[open] {
        background: var(--surface-strong);
      }

      summary {
        list-style: none;
        cursor: pointer;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 12px;
        align-items: baseline;
      }

      summary::-webkit-details-marker {
        display: none;
      }

      .node-name {
        font-weight: 600;
        font-size: 16px;
      }

      .node-count {
        color: var(--accent);
        font-size: 13px;
      }

      .node-desc {
        color: var(--muted);
        font-size: 13px;
        flex-basis: 100%;
      }

      .node-body {
        margin-top: 12px;
        display: grid;
        gap: 12px;
      }

      .skills {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 8px;
      }

      .skills li {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(15, 17, 21, 0.6);
        border: 1px solid var(--border);
      }

      .skill-name {
        font-weight: 600;
        display: block;
      }

      .skill-desc {
        color: var(--muted);
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Skill Capability Tree</h1>
      <p>Explore skills grouped by capability domains.</p>
    </header>
    <section class="tree">
      ${renderNode(node, 0, true)}
    </section>
  </body>
</html>
`;

  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(filePath, html, 'utf8');
}
