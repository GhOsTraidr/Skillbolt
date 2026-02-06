import { describe, it, expect } from 'vitest';
import { generateReport, exportReport } from '../src/reporter/generator.js';
import { exportToJSON, parseJSONReport } from '../src/reporter/json.js';
import { exportToCSV } from '../src/reporter/csv.js';
import { exportToHTML } from '../src/reporter/html.js';
import { renderTerminalReport } from '../src/reporter/terminal.js';
import { sampleEvents, eventsWithDistribution } from './fixtures/events.js';

describe('Report Generator', () => {
  describe('generateReport', () => {
    it('should generate a complete report', () => {
      const report = generateReport(eventsWithDistribution);

      expect(report.meta).toBeDefined();
      expect(report.meta.totalEvents).toBeGreaterThan(0);
      expect(report.statistics).toBeDefined();
      expect(report.topSkills).toBeDefined();
      expect(report.topSkills.length).toBeGreaterThan(0);
    });

    it('should filter by date range', () => {
      const report = generateReport(sampleEvents, {
        startDate: '2026-01-20T00:00:00.000Z',
        endDate: '2026-01-20T23:59:59.999Z',
      });

      expect(report.meta.totalEvents).toBe(4);
    });

    it('should filter by skill name', () => {
      const report = generateReport(sampleEvents, {
        skills: ['react-patterns'],
      });

      expect(report.topSkills.every((s) => s.skillName === 'react-patterns')).toBe(true);
    });

    it('should include suggestions by default', () => {
      const report = generateReport(eventsWithDistribution);

      expect(report.suggestions).toBeDefined();
    });

    it('should exclude suggestions when disabled', () => {
      const report = generateReport(eventsWithDistribution, {
        suggestions: false,
      });

      expect(report.suggestions).toBeUndefined();
    });
  });

  describe('exportReport', () => {
    it('should export to JSON format', () => {
      const report = generateReport(sampleEvents);
      const output = exportReport(report, sampleEvents, { format: 'json' });

      expect(() => JSON.parse(output)).not.toThrow();
      const parsed = JSON.parse(output);
      expect(parsed.report).toBeDefined();
    });

    it('should export to CSV format', () => {
      const report = generateReport(sampleEvents);
      const output = exportReport(report, sampleEvents, { format: 'csv' });

      expect(output).toContain('Summary');
      expect(output).toContain('Top Skills');
      expect(output).toContain(',');
    });

    it('should export to HTML format', () => {
      const report = generateReport(sampleEvents);
      const output = exportReport(report, sampleEvents, { format: 'html' });

      expect(output).toContain('<!DOCTYPE html>');
      expect(output).toContain('Skill Analytics Report');
    });

    it('should export to terminal format', () => {
      const report = generateReport(sampleEvents);
      const output = exportReport(report, sampleEvents, { format: 'terminal' });

      expect(output).toContain('Skill Usage Report');
    });
  });
});

describe('JSON Export', () => {
  it('should export and parse report correctly', () => {
    const report = generateReport(sampleEvents);
    const json = exportToJSON(report, sampleEvents, { format: 'json' });
    const parsed = parseJSONReport(json);

    expect(parsed.meta.totalEvents).toBe(report.meta.totalEvents);
    expect(parsed.statistics.uniqueSkills).toBe(report.statistics.uniqueSkills);
  });

  it('should include raw events when requested', () => {
    const report = generateReport(sampleEvents);
    const json = exportToJSON(report, sampleEvents, {
      format: 'json',
      includeRawEvents: true,
    });
    const data = JSON.parse(json);

    expect(data.events).toBeDefined();
    expect(data.events.length).toBe(sampleEvents.length);
  });
});

describe('CSV Export', () => {
  it('should escape special characters', () => {
    const report = generateReport(sampleEvents);
    const csv = exportToCSV(report, sampleEvents, { format: 'csv' });

    expect(csv).not.toContain('undefined');
  });

  it('should include sections', () => {
    const report = generateReport(sampleEvents);
    const csv = exportToCSV(report, sampleEvents, { format: 'csv' });

    expect(csv).toContain('# Summary');
    expect(csv).toContain('# Top Skills');
  });
});

describe('HTML Export', () => {
  it('should generate valid HTML structure', () => {
    const report = generateReport(sampleEvents);
    const html = exportToHTML(report);

    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
  });

  it('should include statistics cards', () => {
    const report = generateReport(sampleEvents);
    const html = exportToHTML(report);

    expect(html).toContain('Total Events');
    expect(html).toContain('Unique Skills');
    expect(html).toContain('Success Rate');
  });

  it('should include CSS styles', () => {
    const report = generateReport(sampleEvents);
    const html = exportToHTML(report);

    expect(html).toContain('<style>');
  });
});

describe('Terminal Report', () => {
  it('should render a formatted report', () => {
    const report = generateReport(sampleEvents);
    const output = renderTerminalReport(report);

    expect(output).toContain('Skill Usage Report');
    expect(output).toContain('Total Triggers');
    expect(output).toContain('Success Rate');
  });

  it('should include top skills table', () => {
    const report = generateReport(sampleEvents);
    const output = renderTerminalReport(report);

    expect(output).toContain('Top Skills');
    expect(output).toContain('Rank');
  });
});
