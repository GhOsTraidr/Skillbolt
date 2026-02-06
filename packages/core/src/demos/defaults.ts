import type { DemoTask } from './types.js';

export const DEFAULT_DEMO_TASKS: DemoTask[] = [
  {
    id: 'frontend_debug',
    title: 'Frontend Debug Report',
    description: 'Fix login page bug and generate report',
    prompt:
      'I am a front-end developer. Users have reported a bug on the mobile login page where the submit button is unresponsive on iOS Safari. Please debug this issue, identify the root cause, and generate a comprehensive bug report with fix recommendations.',
    files: [],
    icon: 'bug',
  },
  {
    id: 'ui_research',
    title: 'Fusion UI Design',
    description: 'Visual design research for knowledge management product',
    prompt:
      'I am a product designer. Our company is planning a knowledge management product that combines note-taking, mind mapping, and task management. Please research current UI trends, analyze competitor products, and create a design brief with visual direction recommendations.',
    files: [],
    icon: 'design',
  },
  {
    id: 'paper_promotion',
    title: 'Paper Promotion Assistant',
    description: 'Multi-platform promotion plan for research paper',
    prompt:
      'As a PhD student, I recently completed a research paper on transformer-based architectures for code generation. Please create a comprehensive multi-platform promotion plan including Twitter threads, LinkedIn posts, blog article outline, and a presentation slide deck outline.',
    files: [],
    icon: 'paper',
  },
  {
    id: 'code_review',
    title: 'Code Review Automation',
    description: 'Automated code review and improvement suggestions',
    prompt:
      'Review the provided codebase for potential improvements including performance bottlenecks, security vulnerabilities, code style inconsistencies, and suggest refactoring opportunities. Generate a detailed review report.',
    files: [],
    icon: 'code',
  },
];
