import type { Session, Message } from '../../src/types/session.js';

export const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  role: 'user',
  content: 'Test message',
  timestamp: new Date().toISOString(),
  ...overrides,
});

export const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'test-session-001',
  projectPath: '/test/project',
  messages: [
    createMockMessage({ role: 'user', content: 'Help me create a React component' }),
    createMockMessage({
      role: 'assistant',
      content: 'I will help you create a React component. First, let me analyze your requirements.',
      toolCalls: [{ name: 'read_file', input: { path: 'src/App.tsx' } }],
    }),
    createMockMessage({ role: 'user', content: 'That looks good, continue' }),
    createMockMessage({
      role: 'assistant',
      content: 'I have created the component. Here is the code...',
    }),
  ],
  startTime: new Date(Date.now() - 3600000).toISOString(),
  endTime: new Date().toISOString(),
  ...overrides,
});

export const createFailedAttemptSession = (): Session => ({
  id: 'test-session-failed',
  projectPath: '/test/project',
  messages: [
    createMockMessage({ role: 'user', content: 'Create a function' }),
    createMockMessage({ role: 'assistant', content: 'Here is the function...' }),
    createMockMessage({ role: 'user', content: "That's wrong, try again" }),
    createMockMessage({ role: 'assistant', content: 'Sorry, let me fix that...' }),
    createMockMessage({ role: 'assistant', content: 'Here is the corrected version...' }),
    createMockMessage({ role: 'user', content: 'Perfect, that works!' }),
  ],
  startTime: new Date(Date.now() - 3600000).toISOString(),
  endTime: new Date().toISOString(),
});

export const MOCK_INTENT = {
  goal: 'Create a React component with TypeScript',
  problem: 'Need a reusable button component',
  outcome: 'Created a Button component with proper typing',
  triggers: ['create component', 'add button', 'new react component'],
  category: 'feature-development',
};

export const MOCK_STEPS_RESULT = {
  steps: [
    {
      title: 'Analyze Requirements',
      description: 'Review the component requirements and determine the props interface',
      isKeyStep: true,
      substeps: ['Check existing components', 'Define prop types'],
    },
    {
      title: 'Create Component File',
      description: 'Create a new file in src/components/Button.tsx',
      isKeyStep: true,
      toolsUsed: ['write_file'],
    },
    {
      title: 'Add Styles',
      description: 'Add CSS modules or styled-components',
      isKeyStep: true,
    },
  ],
  parameters: [
    {
      name: 'component_name',
      type: 'string' as const,
      description: 'Name of the component',
      defaultValue: 'Button',
    },
  ],
  prerequisites: ['React project setup', 'TypeScript configured'],
  errorHandling: {
    'Missing dependencies': 'Run npm install to install required packages',
    'Type errors': 'Check that all prop types are correctly defined',
  },
};
