export const createLogViewer = (container) => {
  const list = document.createElement('div');
  list.className = 'log-list';
  container.appendChild(list);

  const update = (logs) => {
    if (!Array.isArray(logs) || !logs.length) {
      list.innerHTML = '<p class="empty">Logs will appear during execution.</p>';
      return;
    }
    list.innerHTML = logs
      .map(
        (log) => `
        <div class="log-entry ${log.level}">
          <div class="meta">
            <span>${log.timestamp}</span>
            <span>${log.elapsed}</span>
          </div>
          <div>${log.message}</div>
        </div>
      `
      )
      .join('');
    list.scrollTop = list.scrollHeight;
  };

  return { update };
};
