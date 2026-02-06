const SVG_NS = 'http://www.w3.org/2000/svg';

const createSvgElement = (tag) => document.createElementNS(SVG_NS, tag);

export const createDagViewer = (container) => {
  const svg = createSvgElement('svg');
  svg.classList.add('dag-svg');
  container.appendChild(svg);

  const renderEmpty = () => {
    svg.innerHTML = '';
    const text = createSvgElement('text');
    text.setAttribute('x', '24');
    text.setAttribute('y', '40');
    text.setAttribute('fill', '#7c879e');
    text.setAttribute('font-size', '13');
    text.textContent = 'Waiting for execution graph...';
    svg.appendChild(text);
  };

  const update = (orchestrator) => {
    if (!orchestrator || !orchestrator.nodes?.length) {
      renderEmpty();
      return;
    }

    svg.innerHTML = '';

    const defs = createSvgElement('defs');
    const marker = createSvgElement('marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('refX', '6');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const path = createSvgElement('path');
    path.setAttribute('d', 'M0,0 L6,3 L0,6 Z');
    path.setAttribute('fill', '#7482a8');
    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const phases = orchestrator.phases?.length
      ? orchestrator.phases
      : [{ phaseNumber: 1, nodes: orchestrator.nodes.map((node) => node.id), mode: 'parallel' }];

    const nodeWidth = 180;
    const nodeHeight = 56;
    const xGap = 90;
    const yGap = 26;
    const paddingX = 40;
    const paddingY = 50;

    const positions = new Map();

    phases.forEach((phase, phaseIndex) => {
      const nodesInPhase = phase.nodes
        .map((id) => orchestrator.nodes.find((node) => node.id === id))
        .filter(Boolean);

      const label = createSvgElement('text');
      label.setAttribute('class', 'phase-label');
      label.setAttribute('x', `${paddingX + phaseIndex * (nodeWidth + xGap)}`);
      label.setAttribute('y', `${paddingY - 18}`);
      label.textContent = `Phase ${phase.phaseNumber}`;
      svg.appendChild(label);

      nodesInPhase.forEach((node, nodeIndex) => {
        const x = paddingX + phaseIndex * (nodeWidth + xGap);
        const y = paddingY + nodeIndex * (nodeHeight + yGap);
        positions.set(node.id, { x, y });

        const group = createSvgElement('g');
        const rect = createSvgElement('rect');
        rect.setAttribute('x', `${x}`);
        rect.setAttribute('y', `${y}`);
        rect.setAttribute('width', `${nodeWidth}`);
        rect.setAttribute('height', `${nodeHeight}`);
        rect.setAttribute('rx', '14');
        rect.setAttribute('class', `node-rect node-status-${node.status}`);
        group.appendChild(rect);

        const title = createSvgElement('text');
        title.setAttribute('x', `${x + 16}`);
        title.setAttribute('y', `${y + 24}`);
        title.setAttribute('class', 'node-label');
        title.textContent = node.name;
        group.appendChild(title);

        const subtitle = createSvgElement('text');
        subtitle.setAttribute('x', `${x + 16}`);
        subtitle.setAttribute('y', `${y + 42}`);
        subtitle.setAttribute('fill', '#8d98b6');
        subtitle.setAttribute('font-size', '10');
        subtitle.textContent = node.status.toUpperCase();
        group.appendChild(subtitle);

        svg.appendChild(group);
      });
    });

    orchestrator.nodes.forEach((node) => {
      if (!node.dependsOn?.length) {
        return;
      }
      node.dependsOn.forEach((depId) => {
        const from = positions.get(depId);
        const to = positions.get(node.id);
        if (!from || !to) {
          return;
        }
        const line = createSvgElement('line');
        line.setAttribute('x1', `${from.x + nodeWidth}`);
        line.setAttribute('y1', `${from.y + nodeHeight / 2}`);
        line.setAttribute('x2', `${to.x}`);
        line.setAttribute('y2', `${to.y + nodeHeight / 2}`);
        line.setAttribute('stroke', '#6e7aa0');
        line.setAttribute('stroke-width', '1.2');
        line.setAttribute('marker-end', 'url(#arrow)');
        svg.insertBefore(line, svg.firstChild);
      });
    });

    const totalWidth =
      paddingX * 2 + phases.length * nodeWidth + Math.max(0, phases.length - 1) * xGap;
    const maxNodes = Math.max(
      ...phases.map(
        (phase) =>
          phase.nodes.map((id) => orchestrator.nodes.find((node) => node.id === id)).filter(Boolean)
            .length
      )
    );
    const totalHeight = paddingY * 2 + maxNodes * nodeHeight + Math.max(0, maxNodes - 1) * yGap;
    svg.setAttribute('viewBox', `0 0 ${Math.max(totalWidth, 600)} ${Math.max(totalHeight, 320)}`);
  };

  return { update };
};
