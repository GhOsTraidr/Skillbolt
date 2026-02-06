import { createTaskInput } from './components/task-input.js';
import { createDagViewer } from './components/dag-viewer.js';
import { createLogViewer } from './components/log-viewer.js';

const phaseIndicator = document.getElementById('phase-indicator');
const skillResults = document.getElementById('skill-results');
const planList = document.getElementById('plan-list');
const confirmSearchBtn = document.getElementById('confirm-search');
const confirmDagBtn = document.getElementById('confirm-dag');
const confirmFreestyleBtn = document.getElementById('confirm-freestyle');
const resetBtn = document.getElementById('reset-btn');

const panels = Array.from(document.querySelectorAll('.panel[data-phase]'));

const dagViewer = createDagViewer(document.getElementById('dag-viewer'));
const logViewer = createLogViewer(document.getElementById('log-viewer'));

let socket = null;
let state = null;

const sendMessage = (type, data = {}) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }
  socket.send(JSON.stringify({ type, data }));
};

const connect = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  socket = new WebSocket(`${protocol}://${window.location.host}`);

  socket.addEventListener('message', (event) => {
    const payload = JSON.parse(event.data);
    handleMessage(payload);
  });

  socket.addEventListener('close', () => {
    setTimeout(connect, 1500);
  });
};

const handleMessage = (payload) => {
  if (!payload || !payload.type) {
    return;
  }
  switch (payload.type) {
    case 'init':
      state = payload.data;
      render();
      break;
    case 'state':
      state = payload.data.state;
      render();
      break;
    case 'phase':
      if (state) {
        state = { ...state, phase: payload.data.phase };
        renderPhase();
        updatePanelVisibility();
      }
      break;
    case 'skills_updated':
      if (state) {
        state = { ...state, selectedSkillIds: payload.data.selected_ids };
        renderSkills();
      }
      break;
    case 'search_complete':
      if (state) {
        state = {
          ...state,
          searchResult: {
            skills: payload.data.skills,
            llmCalls: payload.data.llm_calls,
          },
          selectedSkillIds: payload.data.selected_ids,
          searchComplete: true,
        };
        renderSkills();
      }
      break;
    case 'orch_nodes':
      if (state) {
        const phases = Array.isArray(payload.data.phases)
          ? payload.data.phases.map((phase, index) => ({
              phaseNumber: index + 1,
              nodes: phase.nodeIds ?? [],
              mode: 'parallel',
            }))
          : [];
        state = {
          ...state,
          orchestrator: {
            nodes: payload.data.nodes ?? [],
            phases,
            currentPhase: 0,
            plans: state.orchestrator?.plans ?? [],
            selectedPlanIndex: state.orchestrator?.selectedPlanIndex ?? -1,
          },
        };
        renderDag();
      }
      break;
    case 'orch_status':
      if (state?.orchestrator) {
        state = {
          ...state,
          orchestrator: {
            ...state.orchestrator,
            nodes: state.orchestrator.nodes.map((node) =>
              node.id === payload.data.node_id ? { ...node, status: payload.data.status } : node
            ),
          },
        };
        renderDag();
      }
      break;
    case 'orch_log':
      if (state) {
        const entry = {
          message: payload.data.message,
          level: payload.data.level,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          elapsed: state.elapsed,
        };
        state = { ...state, logs: [...state.logs, entry] };
        renderLogs();
      }
      break;
    default:
      break;
  }
};

const taskInput = createTaskInput(document.getElementById('task-panel'), {
  onStart: ({ task, taskName, files }) => {
    sendMessage('start_search', { task, task_name: taskName, files });
  },
});

confirmSearchBtn.addEventListener('click', () => sendMessage('confirm_search'));
confirmDagBtn.addEventListener('click', () =>
  sendMessage('confirm_skills', { execution_mode: 'dag' })
);
confirmFreestyleBtn.addEventListener('click', () =>
  sendMessage('confirm_skills', { execution_mode: 'freestyle' })
);
resetBtn.addEventListener('click', () => sendMessage('reset'));

const renderPhase = () => {
  if (!state || !phaseIndicator) {
    return;
  }
  const label = state.phase?.toUpperCase?.() ?? 'IDLE';
  phaseIndicator.textContent = label;
};

const updatePanelVisibility = () => {
  if (!state) {
    return;
  }
  panels.forEach((panel) => {
    const phases = panel.dataset.phase?.split(' ') ?? [];
    if (phases.includes(state.phase)) {
      panel.classList.add('is-active');
    } else {
      panel.classList.remove('is-active');
    }
  });
};

const renderSkills = () => {
  if (!state || !skillResults) {
    return;
  }
  const skills = state.searchResult?.skills ?? [];
  if (!skills.length) {
    skillResults.innerHTML = '<p class="empty">No skills yet. Run a search to populate.</p>';
    return;
  }
  const selected = new Set(state.selectedSkillIds ?? []);
  const items = skills
    .map((skill) => {
      const id = skill.id ?? skill.name ?? 'skill';
      const name = skill.name ?? id;
      const description = skill.description ?? 'Skill description.';
      return `
        <label class="skill-card">
          <input type="checkbox" data-skill-id="${id}" ${selected.has(id) ? 'checked' : ''} />
          <div>
            <h3>${name}</h3>
            <p>${description}</p>
          </div>
        </label>
      `;
    })
    .join('');
  skillResults.innerHTML = `<div class="skill-list">${items}</div>`;

  skillResults.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener('change', () => {
      const updated = Array.from(skillResults.querySelectorAll('input[type="checkbox"]'))
        .filter((el) => el.checked)
        .map((el) => el.dataset.skillId);
      sendMessage('update_skills', { skill_ids: updated });
    });
  });
};

const renderPlans = () => {
  if (!state || !planList) {
    return;
  }
  const plans = state.orchestrator?.plans ?? [];
  if (!plans.length) {
    planList.innerHTML = '<p class="empty">Plans appear after DAG selection.</p>';
    return;
  }
  const selected = state.orchestrator?.selectedPlanIndex ?? -1;
  planList.innerHTML = plans
    .map((plan, index) => {
      const name = plan.name ?? `Plan ${index + 1}`;
      const description = plan.description ?? 'Execution plan.';
      return `
        <div class="plan-card ${selected === index ? 'selected' : ''}">
          <div>
            <strong>${name}</strong>
            <p>${description}</p>
          </div>
          <button class="btn secondary" data-plan-index="${index}">Select Plan</button>
        </div>
      `;
    })
    .join('');

  planList.querySelectorAll('button[data-plan-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.planIndex ?? 0);
      sendMessage('select_plan', { index });
    });
  });
};

const renderDag = () => {
  dagViewer.update(state?.orchestrator ?? null);
};

const renderLogs = () => {
  logViewer.update(state?.logs ?? []);
};

const render = () => {
  if (!state) {
    return;
  }
  renderPhase();
  updatePanelVisibility();
  renderSkills();
  renderPlans();
  renderDag();
  renderLogs();
  taskInput.update(state);
};

connect();
