import type { LLMAdapter } from '@skillbolt/core';
import type { TreeNode } from '@skillbolt/tree';

export interface SearchConfig {
  model?: string;
  maxParallel: number;
  pruneEnabled: boolean;
  temperature: number;
  timeout: number;
  caching: boolean;
}

export interface SearchResult {
  query: string;
  selectedSkills: SelectedSkill[];
  llmCalls: number;
  parallelRounds: number;
  exploredNodes: string[];
  selectedPaths: string[];
}

export interface SelectedSkill {
  id: string;
  name: string;
  description: string;
  path: string;
  skillPath: string;
  reason: string;
  githubUrl?: string;
  stars?: number;
  isOfficial?: boolean;
  author?: string;
}

export type SearchEventType =
  | 'search_start'
  | 'node_enter'
  | 'children_selected'
  | 'skills_selected'
  | 'early_stop'
  | 'prune_start'
  | 'prune_complete'
  | 'search_complete';

export interface SearchEvent {
  type: SearchEventType;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface SearchEventDataMap {
  search_start: { query: string };
  node_enter: {
    nodeId: string;
    nodeName: string;
    depth: number;
    isLeaf: boolean;
    skillCount: number;
  };
  children_selected: {
    parentId: string;
    selected: string[];
    rejected: string[];
    autoExpand: boolean;
  };
  skills_selected: {
    selected: string[];
    rejected: string[];
    totalOptions: number;
  };
  early_stop: {
    nodeId: string;
    skillCount: number;
  };
  prune_start: {
    skillCount: number;
    skillIds: string[];
  };
  prune_complete: {
    skillCount: number;
    selectedIds: string[];
    prunedIds: string[];
  };
  search_complete: {
    skills: SelectedSkill[];
    llmCalls: number;
  };
}

export type SearchEventCallback = (event: SearchEvent) => void;

export interface SearcherOptions {
  treePath?: string;
  tree?: TreeNode;
  llm: LLMAdapter;
  config?: Partial<SearchConfig>;
  eventCallback?: SearchEventCallback;
}

export interface SearchOptions {
  verbose?: boolean;
  maxSkills?: number;
}
