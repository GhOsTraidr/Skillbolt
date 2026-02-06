/**
 * Represents a single tool call made during a conversation
 */
export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
}

/**
 * Represents the result of a tool execution
 */
export interface ToolResult {
  name: string;
  output: string;
  success: boolean;
}

/**
 * Represents a single message in a conversation
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

/**
 * Represents a complete conversation session
 */
export interface Session {
  id: string;
  projectPath: string;
  messages: Message[];
  startTime: string;
  endTime?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Information about a session for listing purposes
 */
export interface SessionInfo {
  id: string;
  projectPath: string;
  startTime: string;
  endTime?: string;
  messageCount: number;
  summary?: string;
}
