import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { CoverageReport, CoverageReporterType } from '../types/index.js';

export interface CoverageReporterOptions {
  outputDir?: string;
  threshold?: number;
}

export interface CoverageReporter {
  generate(report: CoverageReport): Promise<string>;
  write(report: CoverageReport, filePath: string): Promise<void>;
}

export function createTextReporter(): CoverageReporter {
  function generate(report: CoverageReport): Promise<string> {
    const lines: string[] = [];

    lines.push('='.repeat(60));
    lines.push('SKILL TEST COVERAGE REPORT');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Generated: ${report.timestamp}`);
    lines.push(`Threshold: ${report.threshold}%`);
    lines.push(`Status: ${report.thresholdMet ? 'PASSED' : 'FAILED'}`);
    lines.push('');
    lines.push('-'.repeat(60));
    lines.push('SUMMARY');
    lines.push('-'.repeat(60));
    lines.push(`Skills tested: ${report.summary.totalSkills}`);
    lines.push(
      `Trigger coverage: ${report.summary.coveredTriggers}/${report.summary.totalTriggers} (${report.summary.triggerCoverage.toFixed(1)}%)`
    );
    lines.push(
      `Section coverage: ${report.summary.coveredSections}/${report.summary.totalSections} (${report.summary.sectionCoverage.toFixed(1)}%)`
    );
    lines.push('');

    for (const skill of report.skills) {
      lines.push('-'.repeat(60));
      lines.push(`SKILL: ${skill.name}`);
      lines.push(`Path: ${skill.path}`);
      lines.push(`Overall: ${skill.overallPercentage.toFixed(1)}%`);
      lines.push('');
      lines.push(
        `  Triggers: ${skill.triggers.covered}/${skill.triggers.total} (${skill.triggers.percentage.toFixed(1)}%)`
      );

      if (skill.triggers.untested.length > 0) {
        lines.push(`  Untested triggers:`);
        for (const trigger of skill.triggers.untested) {
          lines.push(`    - ${trigger}`);
        }
      }

      lines.push('');
      lines.push(`  Sections:`);
      for (const section of skill.sections) {
        const status = section.covered ? '[x]' : '[ ]';
        lines.push(`    ${status} ${section.type}: ${section.title}`);
      }
      lines.push('');
    }

    lines.push('='.repeat(60));

    return Promise.resolve(lines.join('\n'));
  }

  async function write(report: CoverageReport, filePath: string): Promise<void> {
    const content = await generate(report);
    const fullPath = resolve(filePath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
  }

  return { generate, write };
}

export function createJsonReporter(): CoverageReporter {
  function generate(report: CoverageReport): Promise<string> {
    return Promise.resolve(JSON.stringify(report, null, 2));
  }

  async function write(report: CoverageReport, filePath: string): Promise<void> {
    const content = await generate(report);
    const fullPath = resolve(filePath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
  }

  return { generate, write };
}

export function createHtmlReporter(): CoverageReporter {
  function generate(report: CoverageReport): Promise<string> {
    const statusColor = report.thresholdMet ? '#28a745' : '#dc3545';
    const statusText = report.thresholdMet ? 'PASSED' : 'FAILED';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skill Test Coverage Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { margin-bottom: 20px; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .stat { background: white; padding: 15px; border-radius: 4px; text-align: center; }
    .stat-value { font-size: 2em; font-weight: bold; }
    .status { display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; background: ${statusColor}; }
    .skill { background: white; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; overflow: hidden; }
    .skill-header { background: #f5f5f5; padding: 15px; border-bottom: 1px solid #ddd; }
    .skill-body { padding: 15px; }
    .progress { height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
    .progress-bar { height: 100%; background: #28a745; transition: width 0.3s; }
    .trigger-list, .section-list { margin-top: 10px; }
    .untested { color: #dc3545; }
    .tested { color: #28a745; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Skill Test Coverage Report</h1>
  
  <div class="summary">
    <div class="summary-grid">
      <div class="stat">
        <div class="stat-value">${report.summary.totalSkills}</div>
        <div>Skills Tested</div>
      </div>
      <div class="stat">
        <div class="stat-value">${report.summary.triggerCoverage.toFixed(1)}%</div>
        <div>Trigger Coverage</div>
      </div>
      <div class="stat">
        <div class="stat-value">${report.summary.sectionCoverage.toFixed(1)}%</div>
        <div>Section Coverage</div>
      </div>
      <div class="stat">
        <span class="status">${statusText}</span>
        <div style="margin-top: 5px;">Threshold: ${report.threshold}%</div>
      </div>
    </div>
  </div>

  <h2>Skills</h2>
  ${report.skills
    .map(
      (skill) => `
    <div class="skill">
      <div class="skill-header">
        <strong>${skill.name}</strong>
        <div style="font-size: 0.9em; color: #666;">${skill.path}</div>
      </div>
      <div class="skill-body">
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Overall Coverage</span>
            <span>${skill.overallPercentage.toFixed(1)}%</span>
          </div>
          <div class="progress">
            <div class="progress-bar" style="width: ${skill.overallPercentage}%"></div>
          </div>
        </div>

        <h4>Triggers (${skill.triggers.covered}/${skill.triggers.total})</h4>
        <div class="trigger-list">
          ${skill.triggers.tested.map((t) => `<span class="tested">+ ${t}</span>`).join('<br>')}
          ${skill.triggers.untested.map((t) => `<span class="untested">- ${t}</span>`).join('<br>')}
        </div>

        <h4 style="margin-top: 15px;">Sections</h4>
        <table>
          <tr><th>Section</th><th>Status</th></tr>
          ${skill.sections.map((s) => `<tr><td>${s.title} (${s.type})</td><td>${s.covered ? '<span class="tested">Covered</span>' : '<span class="untested">Not Covered</span>'}</td></tr>`).join('')}
        </table>
      </div>
    </div>
  `
    )
    .join('')}

  <footer style="margin-top: 30px; text-align: center; color: #666; font-size: 0.9em;">
    Generated: ${report.timestamp} | @skillbolt/test
  </footer>
</body>
</html>`;

    return Promise.resolve(html);
  }

  async function write(report: CoverageReport, filePath: string): Promise<void> {
    const content = await generate(report);
    const fullPath = resolve(filePath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
  }

  return { generate, write };
}

export function createCoverageReporter(type: CoverageReporterType): CoverageReporter {
  switch (type) {
    case 'text':
      return createTextReporter();
    case 'json':
      return createJsonReporter();
    case 'html':
      return createHtmlReporter();
    default:
      return createTextReporter();
  }
}

export async function generateCoverageReport(
  report: CoverageReport,
  types: CoverageReporterType[],
  outputDir: string
): Promise<void> {
  const reporters = types.map((type) => ({
    type,
    reporter: createCoverageReporter(type),
  }));

  await mkdir(outputDir, { recursive: true });

  for (const { type, reporter } of reporters) {
    const ext = type === 'html' ? 'html' : type === 'json' ? 'json' : 'txt';
    const filePath = resolve(outputDir, `coverage.${ext}`);
    await reporter.write(report, filePath);
  }
}
