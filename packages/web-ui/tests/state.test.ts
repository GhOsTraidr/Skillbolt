import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialState,
  updatePhase,
  addLog,
  setTask,
  setTaskName,
  setFiles,
  resetState,
  setStartTime,
  setRunMode,
  setSelectedSkillIds,
  setOrchestrator,
  setSearchComplete,
} from '../src/state.js';
import { UnifiedPhase } from '../src/types.js';
import type { UnifiedState } from '../src/types.js';

describe('State Management', () => {
  let initialState: UnifiedState;

  beforeEach(() => {
    initialState = createInitialState();
  });

  describe('createInitialState', () => {
    it('should create initial state with defaults', () => {
      const state = createInitialState();
      expect(state.phase).toBe(UnifiedPhase.IDLE);
      expect(state.mode).toBe('full');
      expect(state.task).toBe('');
      expect(state.logs).toEqual([]);
      expect(state.taskName).toBe('');
      expect(state.files).toEqual([]);
      expect(state.startTime).toBeNull();
    });

    it('should create initial state with provided options', () => {
      const state = createInitialState({
        task: 'test task',
        taskName: 'Test Task',
        presetSkills: ['skill1', 'skill2'],
        files: ['file1.ts', 'file2.ts'],
      });
      expect(state.task).toBe('test task');
      expect(state.taskName).toBe('Test Task');
      expect(state.presetSkills).toEqual(['skill1', 'skill2']);
      expect(state.files).toEqual(['file1.ts', 'file2.ts']);
    });

    it('should set mode to execute when task is provided', () => {
      const state = createInitialState({ task: 'some task' });
      expect(state.mode).toBe('execute');
    });

    it('should set mode to execute when presetSkills are provided', () => {
      const state = createInitialState({ presetSkills: ['skill1'] });
      expect(state.mode).toBe('execute');
    });

    it('should preserve explicit mode option', () => {
      const state = createInitialState({
        task: 'some task',
        mode: 'full',
      });
      expect(state.mode).toBe('full');
    });

    it('should initialize with empty logs array', () => {
      const state = createInitialState();
      expect(Array.isArray(state.logs)).toBe(true);
      expect(state.logs.length).toBe(0);
    });

    it('should initialize selectedSkillIds from presetSkills', () => {
      const state = createInitialState({
        presetSkills: ['skill1', 'skill2'],
      });
      expect(state.selectedSkillIds).toEqual(['skill1', 'skill2']);
    });
  });

  describe('updatePhase', () => {
    it('should transition from IDLE to SEARCHING', () => {
      const state = updatePhase(initialState, UnifiedPhase.SEARCHING);
      expect(state.phase).toBe(UnifiedPhase.SEARCHING);
    });

    it('should transition from SEARCHING to REVIEWING', () => {
      let state = updatePhase(initialState, UnifiedPhase.SEARCHING);
      state = updatePhase(state, UnifiedPhase.REVIEWING);
      expect(state.phase).toBe(UnifiedPhase.REVIEWING);
    });

    it('should transition from REVIEWING to PLANNING', () => {
      let state = updatePhase(initialState, UnifiedPhase.SEARCHING);
      state = updatePhase(state, UnifiedPhase.REVIEWING);
      state = updatePhase(state, UnifiedPhase.PLANNING);
      expect(state.phase).toBe(UnifiedPhase.PLANNING);
    });

    it('should transition from PLANNING to EXECUTING', () => {
      let state = updatePhase(initialState, UnifiedPhase.SEARCHING);
      state = updatePhase(state, UnifiedPhase.REVIEWING);
      state = updatePhase(state, UnifiedPhase.PLANNING);
      state = updatePhase(state, UnifiedPhase.EXECUTING);
      expect(state.phase).toBe(UnifiedPhase.EXECUTING);
    });

    it('should transition from EXECUTING to COMPLETE', () => {
      let state = updatePhase(initialState, UnifiedPhase.SEARCHING);
      state = updatePhase(state, UnifiedPhase.REVIEWING);
      state = updatePhase(state, UnifiedPhase.PLANNING);
      state = updatePhase(state, UnifiedPhase.EXECUTING);
      state = updatePhase(state, UnifiedPhase.COMPLETE);
      expect(state.phase).toBe(UnifiedPhase.COMPLETE);
    });

    it('should throw error on invalid transition IDLE to COMPLETE', () => {
      expect(() => {
        updatePhase(initialState, UnifiedPhase.COMPLETE);
      }).toThrow('Invalid phase transition: idle -> complete');
    });

    it('should throw error on invalid transition IDLE to EXECUTING', () => {
      expect(() => {
        updatePhase(initialState, UnifiedPhase.EXECUTING);
      }).toThrow('Invalid phase transition: idle -> executing');
    });

    it('should return same state when updating to same phase', () => {
      const state = updatePhase(initialState, UnifiedPhase.IDLE);
      expect(state).toBe(initialState);
    });

    it('should allow transition from SEARCHING back to IDLE', () => {
      let state = updatePhase(initialState, UnifiedPhase.SEARCHING);
      state = updatePhase(state, UnifiedPhase.IDLE);
      expect(state.phase).toBe(UnifiedPhase.IDLE);
    });

    it('should allow transition from EXECUTING to ERROR', () => {
      let state = updatePhase(initialState, UnifiedPhase.SEARCHING);
      state = updatePhase(state, UnifiedPhase.REVIEWING);
      state = updatePhase(state, UnifiedPhase.PLANNING);
      state = updatePhase(state, UnifiedPhase.EXECUTING);
      state = updatePhase(state, UnifiedPhase.ERROR);
      expect(state.phase).toBe(UnifiedPhase.ERROR);
    });

    it('should allow transition from ERROR to IDLE', () => {
      let state = updatePhase(initialState, UnifiedPhase.SEARCHING);
      state = updatePhase(state, UnifiedPhase.REVIEWING);
      state = updatePhase(state, UnifiedPhase.PLANNING);
      state = updatePhase(state, UnifiedPhase.EXECUTING);
      state = updatePhase(state, UnifiedPhase.ERROR);
      state = updatePhase(state, UnifiedPhase.IDLE);
      expect(state.phase).toBe(UnifiedPhase.IDLE);
    });
  });

  describe('addLog', () => {
    it('should append log entry with timestamp and elapsed', () => {
      const state = addLog(initialState, 'Test message', 'info');
      expect(state.logs.length).toBe(1);
      expect(state.logs[0].message).toBe('Test message');
      expect(state.logs[0].level).toBe('info');
      expect(state.logs[0].timestamp).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(state.logs[0].elapsed).toMatch(/^\d+:\d{2}$/);
    });

    it('should add multiple log entries', () => {
      let state = addLog(initialState, 'First message', 'info');
      state = addLog(state, 'Second message', 'warn');
      expect(state.logs.length).toBe(2);
      expect(state.logs[0].message).toBe('First message');
      expect(state.logs[1].message).toBe('Second message');
    });

    it('should support different log levels', () => {
      let state = addLog(initialState, 'Info', 'info');
      state = addLog(state, 'OK', 'ok');
      state = addLog(state, 'Warning', 'warn');
      state = addLog(state, 'Error', 'error');
      expect(state.logs[0].level).toBe('info');
      expect(state.logs[1].level).toBe('ok');
      expect(state.logs[2].level).toBe('warn');
      expect(state.logs[3].level).toBe('error');
    });

    it('should calculate elapsed time when startTime is set', () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - 65000).toISOString(); // 65 seconds ago
      let state = setStartTime(initialState, startTime);
      state = addLog(state, 'Test message', 'info');
      expect(state.logs[0].elapsed).toMatch(/^1:\d{2}$/); // Should be around 1:05
    });

    it('should show 0:00 elapsed when no startTime', () => {
      const state = addLog(initialState, 'Test message', 'info');
      expect(state.logs[0].elapsed).toBe('0:00');
    });

    it('should update elapsed field on state', () => {
      const state = addLog(initialState, 'Test message', 'info');
      expect(state.elapsed).toBe(state.logs[0].elapsed);
    });

    it('should not mutate original logs array', () => {
      const originalLogs = initialState.logs;
      const state = addLog(initialState, 'Test message', 'info');
      expect(state.logs).not.toBe(originalLogs);
      expect(initialState.logs.length).toBe(0);
    });
  });

  describe('setTask', () => {
    it('should update task field', () => {
      const state = setTask(initialState, 'New task');
      expect(state.task).toBe('New task');
    });

    it('should preserve other fields', () => {
      const state = setTask(initialState, 'New task');
      expect(state.phase).toBe(initialState.phase);
      expect(state.mode).toBe(initialState.mode);
    });

    it('should handle empty task string', () => {
      const state = setTask(initialState, '');
      expect(state.task).toBe('');
    });
  });

  describe('setTaskName', () => {
    it('should update taskName field', () => {
      const state = setTaskName(initialState, 'My Task Name');
      expect(state.taskName).toBe('My Task Name');
    });

    it('should preserve other fields', () => {
      const state = setTaskName(initialState, 'My Task Name');
      expect(state.phase).toBe(initialState.phase);
      expect(state.task).toBe(initialState.task);
    });
  });

  describe('setFiles', () => {
    it('should update files array', () => {
      const files = ['file1.ts', 'file2.ts', 'file3.ts'];
      const state = setFiles(initialState, files);
      expect(state.files).toEqual(files);
    });

    it('should create new array reference', () => {
      const files = ['file1.ts', 'file2.ts'];
      const state = setFiles(initialState, files);
      expect(state.files).not.toBe(files);
    });

    it('should handle empty files array', () => {
      const state = setFiles(initialState, []);
      expect(state.files).toEqual([]);
    });

    it('should preserve other fields', () => {
      const state = setFiles(initialState, ['file1.ts']);
      expect(state.phase).toBe(initialState.phase);
      expect(state.task).toBe(initialState.task);
    });
  });

  describe('setStartTime', () => {
    it('should update startTime field', () => {
      const time = new Date().toISOString();
      const state = setStartTime(initialState, time);
      expect(state.startTime).toBe(time);
    });

    it('should handle null startTime', () => {
      const state = setStartTime(initialState, null);
      expect(state.startTime).toBeNull();
    });

    it('should preserve other fields', () => {
      const time = new Date().toISOString();
      const state = setStartTime(initialState, time);
      expect(state.phase).toBe(initialState.phase);
      expect(state.task).toBe(initialState.task);
    });
  });

  describe('setRunMode', () => {
    it('should update runMode field', () => {
      const state = setRunMode(initialState, 'dag');
      expect(state.runMode).toBe('dag');
    });

    it('should handle different runMode values', () => {
      let state = setRunMode(initialState, 'baseline');
      expect(state.runMode).toBe('baseline');
      state = setRunMode(state, 'freestyle');
      expect(state.runMode).toBe('freestyle');
    });

    it('should handle null runMode', () => {
      const state = setRunMode(initialState, null);
      expect(state.runMode).toBeNull();
    });

    it('should preserve other fields', () => {
      const state = setRunMode(initialState, 'dag');
      expect(state.phase).toBe(initialState.phase);
      expect(state.task).toBe(initialState.task);
    });
  });

  describe('setSelectedSkillIds', () => {
    it('should update selectedSkillIds array', () => {
      const skillIds = ['skill1', 'skill2', 'skill3'];
      const state = setSelectedSkillIds(initialState, skillIds);
      expect(state.selectedSkillIds).toEqual(skillIds);
    });

    it('should create new array reference', () => {
      const skillIds = ['skill1', 'skill2'];
      const state = setSelectedSkillIds(initialState, skillIds);
      expect(state.selectedSkillIds).not.toBe(skillIds);
    });

    it('should handle empty selectedSkillIds array', () => {
      const state = setSelectedSkillIds(initialState, []);
      expect(state.selectedSkillIds).toEqual([]);
    });

    it('should preserve other fields', () => {
      const state = setSelectedSkillIds(initialState, ['skill1']);
      expect(state.phase).toBe(initialState.phase);
      expect(state.task).toBe(initialState.task);
    });
  });

  describe('setOrchestrator', () => {
    it('should update orchestrator field', () => {
      const orchestrator = {
        nodes: [],
        phases: [],
        currentPhase: 0,
        plans: [],
        selectedPlanIndex: 0,
      };
      const state = setOrchestrator(initialState, orchestrator);
      expect(state.orchestrator).toEqual(orchestrator);
    });

    it('should handle null orchestrator', () => {
      const state = setOrchestrator(initialState, null);
      expect(state.orchestrator).toBeNull();
    });

    it('should preserve other fields', () => {
      const orchestrator = {
        nodes: [],
        phases: [],
        currentPhase: 0,
        plans: [],
        selectedPlanIndex: 0,
      };
      const state = setOrchestrator(initialState, orchestrator);
      expect(state.phase).toBe(initialState.phase);
      expect(state.task).toBe(initialState.task);
    });
  });

  describe('setSearchComplete', () => {
    it('should update searchComplete field to true', () => {
      const state = setSearchComplete(initialState, true);
      expect(state.searchComplete).toBe(true);
    });

    it('should update searchComplete field to false', () => {
      const state = setSearchComplete(initialState, false);
      expect(state.searchComplete).toBe(false);
    });

    it('should preserve other fields', () => {
      const state = setSearchComplete(initialState, true);
      expect(state.phase).toBe(initialState.phase);
      expect(state.task).toBe(initialState.task);
    });
  });

  describe('resetState', () => {
    it('should reset to initial state but preserve mode', () => {
      let state = createInitialState({ mode: 'execute' });
      state = setTask(state, 'Some task');
      state = addLog(state, 'Some log', 'info');
      state = updatePhase(state, UnifiedPhase.SEARCHING);

      const reset = resetState(state);
      expect(reset.phase).toBe(UnifiedPhase.IDLE);
      expect(reset.task).toBe('');
      expect(reset.logs).toEqual([]);
      expect(reset.mode).toBe('execute');
    });

    it('should reset with new options', () => {
      let state = createInitialState({ mode: 'execute', task: 'old task' });
      state = setTask(state, 'modified task');

      const reset = resetState(state, { task: 'new task' });
      expect(reset.task).toBe('new task');
      expect(reset.mode).toBe('execute');
    });

    it('should clear logs on reset', () => {
      let state = createInitialState();
      state = addLog(state, 'Log entry', 'info');
      expect(state.logs.length).toBe(1);

      const reset = resetState(state);
      expect(reset.logs).toEqual([]);
    });

    it('should reset phase to IDLE', () => {
      let state = createInitialState();
      state = updatePhase(state, UnifiedPhase.SEARCHING);
      expect(state.phase).toBe(UnifiedPhase.SEARCHING);

      const reset = resetState(state);
      expect(reset.phase).toBe(UnifiedPhase.IDLE);
    });
  });

  describe('State immutability', () => {
    it('should not mutate original state when updating phase', () => {
      const original = createInitialState();
      const updated = updatePhase(original, UnifiedPhase.SEARCHING);
      expect(original.phase).toBe(UnifiedPhase.IDLE);
      expect(updated.phase).toBe(UnifiedPhase.SEARCHING);
    });

    it('should not mutate original state when adding log', () => {
      const original = createInitialState();
      const updated = addLog(original, 'Test', 'info');
      expect(original.logs.length).toBe(0);
      expect(updated.logs.length).toBe(1);
    });

    it('should not mutate original state when setting files', () => {
      const original = createInitialState();
      const files = ['file1.ts'];
      const updated = setFiles(original, files);
      expect(original.files).toEqual([]);
      expect(updated.files).toEqual(files);
    });
  });
});
