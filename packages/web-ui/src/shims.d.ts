declare module '@skillbolt/execute' {
  export interface VisualizerProtocol {
    setTask(task: string): void;
    setNodes(nodes: unknown[], phases: { id: string; name: string; nodeIds: string[] }[]): void;
    updateStatus(nodeId: string, status: string): void;
    setPhase(phaseNum: number): void;
    addLog(message: string, level: 'info' | 'ok' | 'warn' | 'error', nodeId?: string): void;
    selectPlan(plans: object[], selectedIndex: number): void;
  }
}
