export const createTaskInput = (container, { onStart }) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'task-input';
  wrapper.innerHTML = `
    <div>
      <label for="task-name">Task Name</label>
      <input id="task-name" type="text" placeholder="Optional short name" />
    </div>
    <div>
      <label for="task-text">Task Description</label>
      <textarea id="task-text" placeholder="Describe the goal, constraints, and desired output..."></textarea>
    </div>
    <div>
      <label>Files</label>
      <div class="drop-zone" id="drop-zone">Drop files or click to select</div>
      <input id="file-input" type="file" multiple hidden />
      <div class="file-list" id="file-list"></div>
    </div>
    <button class="btn primary" id="start-search">Search Skills</button>
  `;

  container.appendChild(wrapper);

  const taskNameInput = wrapper.querySelector('#task-name');
  const taskTextInput = wrapper.querySelector('#task-text');
  const fileInput = wrapper.querySelector('#file-input');
  const dropZone = wrapper.querySelector('#drop-zone');
  const fileList = wrapper.querySelector('#file-list');
  const startButton = wrapper.querySelector('#start-search');

  let files = [];

  const renderFiles = () => {
    fileList.innerHTML = files.map((file) => `<span class="file-chip">${file}</span>`).join('');
  };

  const updateFiles = (fileItems) => {
    files = Array.from(fileItems).map((file) => file.name);
    renderFiles();
  };

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    if (event.dataTransfer?.files?.length) {
      updateFiles(event.dataTransfer.files);
    }
  });

  fileInput.addEventListener('change', (event) => {
    const target = event.target;
    if (target.files?.length) {
      updateFiles(target.files);
    }
  });

  startButton.addEventListener('click', () => {
    const task = taskTextInput.value.trim();
    if (!task) {
      taskTextInput.focus();
      return;
    }
    onStart({
      task,
      taskName: taskNameInput.value.trim(),
      files,
    });
  });

  const update = (state) => {
    if (!state) {
      return;
    }
    if (state.task && !taskTextInput.value) {
      taskTextInput.value = state.task;
    }
    if (state.taskName && !taskNameInput.value) {
      taskNameInput.value = state.taskName;
    }
    if (state.files?.length) {
      files = [...state.files];
      renderFiles();
    }
  };

  return { update };
};
