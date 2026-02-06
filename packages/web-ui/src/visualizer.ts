import type { VisualizerProtocol } from '@skillbolt/execute';
import type { OrchestratorNode } from './types.js';

export class WebVisualizer implements VisualizerProtocol {
  private broadcaster: (type: string, data: Record<string, unknown>) => void;

  constructor(broadcaster: (type: string, data: Record<string, unknown>) => void) {
    this.broadcaster = broadcaster;
  }

  setTask(task: string): void {
    this.broadcaster('task', { task });
  }

  setNodes(
    nodes: OrchestratorNode[],
    phases: { id: string; name: string; nodeIds: string[] }[]
  ): void {
    this.broadcaster('orch_nodes', { nodes, phases });
  }

  updateStatus(nodeId: string, status: OrchestratorNode['status']): void {
    this.broadcaster('orch_status', { node_id: nodeId, status });
  }

  setPhase(phaseNum: number): void {
    this.broadcaster('orch_phase', { phase_num: phaseNum });
  }

  addLog(message: string, level: 'info' | 'ok' | 'warn' | 'error', nodeId?: string): void {
    this.broadcaster('orch_log', { message, level, node_id: nodeId });
  }

  selectPlan(plans: object[], selectedIndex: number): void {
    this.broadcaster('orch_plans', { plans, selected_index: selectedIndex });
  }
}
