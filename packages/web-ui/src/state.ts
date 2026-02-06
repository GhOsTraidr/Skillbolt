import { UnifiedPhase } from './types.js';
import type { LogEntry, OrchestratorState, ServerOptions, UnifiedState } from './types.js';

const PHASE_TRANSITIONS: Record<UnifiedPhase, UnifiedPhase[]> = {
  [UnifiedPhase.IDLE]: [UnifiedPhase.SEARCHING],
  [UnifiedPhase.SEARCHING]: [UnifiedPhase.REVIEWING, UnifiedPhase.IDLE],
  [UnifiedPhase.REVIEWING]: [UnifiedPhase.PLANNING, UnifiedPhase.EXECUTING, UnifiedPhase.IDLE],
  [UnifiedPhase.PLANNING]: [UnifiedPhase.EXECUTING, UnifiedPhase.IDLE],
  [UnifiedPhase.EXECUTING]: [UnifiedPhase.COMPLETE, UnifiedPhase.ERROR, UnifiedPhase.IDLE],
  [UnifiedPhase.COMPLETE]: [UnifiedPhase.IDLE],
  [UnifiedPhase.ERROR]: [UnifiedPhase.IDLE],
};

const formatTimestamp = (date: Date): string => {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const seconds = `${date.getSeconds()}`.padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const formatElapsed = (startTime: string | null, now: Date): string => {
  if (!startTime) {
    return '0:00';
  }
  const start = new Date(startTime).getTime();
  const elapsedMs = Math.max(0, now.getTime() - start);
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const createInitialState = (options: ServerOptions = {}): UnifiedState => {
  const mode = options.mode ?? (options.task || options.presetSkills?.length ? 'execute' : 'full');
  return {
    phase: UnifiedPhase.IDLE,
    task: options.task ?? '',
    taskName: options.taskName ?? '',
    files: options.files ?? [],
    startTime: null,
    mode,
    runMode: options.runMode ?? null,
    presetSkills: options.presetSkills ?? [],
    executionMode: 'dag',
    searchResult: null,
    selectedSkillIds: options.presetSkills ?? [],
    treeData: null,
    searchEvents: [],
    searchComplete: false,
    orchestrator: null,
    workDir: '',
    elapsed: '0:00',
    logs: [],
  };
};

export const updatePhase = (state: UnifiedState, nextPhase: UnifiedPhase): UnifiedState => {
  if (state.phase === nextPhase) {
    return state;
  }
  const allowed = PHASE_TRANSITIONS[state.phase] ?? [];
  if (!allowed.includes(nextPhase)) {
    throw new Error(`Invalid phase transition: ${state.phase} -> ${nextPhase}`);
  }
  return { ...state, phase: nextPhase };
};

export const addLog = (
  state: UnifiedState,
  message: string,
  level: LogEntry['level']
): UnifiedState => {
  const now = new Date();
  const entry: LogEntry = {
    message,
    level,
    timestamp: formatTimestamp(now),
    elapsed: formatElapsed(state.startTime, now),
  };
  return {
    ...state,
    logs: [...state.logs, entry],
    elapsed: entry.elapsed,
  };
};

export const setTask = (state: UnifiedState, task: string): UnifiedState => ({
  ...state,
  task,
});

export const setTaskName = (state: UnifiedState, taskName: string): UnifiedState => ({
  ...state,
  taskName,
});

export const setFiles = (state: UnifiedState, files: string[]): UnifiedState => ({
  ...state,
  files: [...files],
});

export const setStartTime = (state: UnifiedState, startTime: string | null): UnifiedState => ({
  ...state,
  startTime,
});

export const setRunMode = (
  state: UnifiedState,
  runMode: UnifiedState['runMode']
): UnifiedState => ({
  ...state,
  runMode,
});

export const setPresetSkills = (state: UnifiedState, presetSkills: string[]): UnifiedState => ({
  ...state,
  presetSkills: [...presetSkills],
});

export const setExecutionMode = (
  state: UnifiedState,
  executionMode: UnifiedState['executionMode']
): UnifiedState => ({
  ...state,
  executionMode,
});

export const setSearchResult = (
  state: UnifiedState,
  searchResult: UnifiedState['searchResult']
): UnifiedState => ({
  ...state,
  searchResult,
});

export const setSelectedSkillIds = (
  state: UnifiedState,
  selectedSkillIds: string[]
): UnifiedState => ({
  ...state,
  selectedSkillIds: [...selectedSkillIds],
});

export const setTreeData = (
  state: UnifiedState,
  treeData: UnifiedState['treeData']
): UnifiedState => ({
  ...state,
  treeData,
});

export const setSearchEvents = (
  state: UnifiedState,
  searchEvents: UnifiedState['searchEvents']
): UnifiedState => ({
  ...state,
  searchEvents: [...searchEvents],
});

export const setSearchComplete = (state: UnifiedState, searchComplete: boolean): UnifiedState => ({
  ...state,
  searchComplete,
});

export const setOrchestrator = (
  state: UnifiedState,
  orchestrator: OrchestratorState | null
): UnifiedState => ({
  ...state,
  orchestrator,
});

export const setWorkDir = (state: UnifiedState, workDir: string): UnifiedState => ({
  ...state,
  workDir,
});

export const resetState = (state: UnifiedState, options: ServerOptions = {}): UnifiedState => {
  const base = createInitialState(options);
  return {
    ...base,
    mode: state.mode,
  };
};
