const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    submitButton.textContent = 'Message Sent!';
    submitButton.disabled = true;
    submitButton.style.opacity = '0.8';

    setTimeout(() => {
      contactForm.reset();
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      submitButton.style.opacity = '1';
    }, 2200);
  });
}

const jokeButton = document.getElementById('jokeButton');
const jokeType = document.getElementById('jokeType');
const jokeText = document.getElementById('jokeText');

async function loadJoke() {
  if (!jokeButton || !jokeType || !jokeText) return;

  jokeButton.disabled = true;
  jokeButton.textContent = 'Loading…';
  jokeType.textContent = 'Loading joke…';
  jokeText.textContent = 'Fetching something funny...';

  try {
    const response = await fetch('https://v2.jokeapi.dev/joke/Any?type=single&safe-mode');
    if (!response.ok) throw new Error('Unable to fetch a joke right now.');

    const data = await response.json();
    if (data.error) throw new Error(data.message || 'Unable to fetch a joke right now.');

    jokeType.textContent = data.category ? `${data.category} • ${data.type}` : 'Random Joke';
    jokeText.textContent = data.joke || `${data.setup}\n\n${data.delivery}`;
  } catch (error) {
    jokeType.textContent = 'Error';
    jokeText.textContent = 'We could not load a joke right now. Please try again.';
  } finally {
    jokeButton.disabled = false;
    jokeButton.textContent = 'New Joke';
  }
}

if (jokeButton) {
  jokeButton.addEventListener('click', loadJoke);
  loadJoke();
}

/* Project task list: stored locally in the visitor's browser. */
const TODO_STORAGE_KEY = 'neil-construction-tasks';

function injectTaskList() {
  if (document.getElementById('task-planner')) return;

  const target = document.getElementById('team') || document.getElementById('contact');
  if (!target) return;

  const section = document.createElement('section');
  section.id = 'task-planner';
  section.className = 'section task-section';
  section.innerHTML = `
    <div class="container">
      <div class="section-heading">
        <h2>Project Task Planner</h2>
        <p>Keep track of project actions directly in your browser. Your tasks are saved locally on this device.</p>
      </div>
      <div class="task-panel">
        <form class="task-form" id="taskForm">
          <label class="sr-only" for="taskInput">Add a project task</label>
          <input id="taskInput" name="task" type="text" maxlength="160" placeholder="Add a project task…" required />
          <button class="btn btn-primary" type="submit">Add Task</button>
        </form>
        <div class="task-toolbar">
          <span id="taskSummary">0 tasks</span>
          <button id="clearCompleted" class="text-button" type="button">Clear completed</button>
        </div>
        <ul id="taskList" class="task-list" aria-live="polite"></ul>
        <p id="emptyTasks" class="empty-tasks">No tasks yet. Add your first project task above.</p>
      </div>
    </div>
  `;
  target.parentNode.insertBefore(section, target);

  const style = document.createElement('style');
  style.textContent = `
    .task-section { background: linear-gradient(135deg, #f8fafc 0%, #f5f0df 100%); }
    .task-panel { max-width: 820px; margin: 0 auto; background: var(--white); border: 1px solid var(--border); border-radius: 22px; padding: 1.5rem; box-shadow: var(--soft-shadow); }
    .task-form { display: flex; gap: .75rem; }
    .task-form input { flex: 1; min-width: 0; border: 1px solid var(--border); border-radius: 10px; padding: .9rem 1rem; color: var(--navy); outline: none; }
    .task-form input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(197,155,39,.16); }
    .task-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin: 1.25rem 0 .75rem; color: var(--muted); font-size: .9rem; }
    .text-button { border: 0; background: transparent; color: var(--gold-dark); cursor: pointer; font-weight: 700; }
    .text-button:hover { text-decoration: underline; }
    .task-list { display: grid; gap: .65rem; padding: 0; margin: 0; list-style: none; }
    .task-item { display: flex; align-items: center; gap: .75rem; padding: .85rem 1rem; border: 1px solid var(--border); border-radius: 12px; background: #fff; }
    .task-item input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--gold); flex: 0 0 auto; }
    .task-label { flex: 1; color: var(--navy); overflow-wrap: anywhere; }
    .task-item.completed .task-label { color: var(--muted); text-decoration: line-through; }
    .delete-task { border: 0; background: transparent; color: #b91c1c; cursor: pointer; font-size: 1.1rem; line-height: 1; padding: .25rem; }
    .empty-tasks { color: var(--muted); text-align: center; padding: 1.5rem 0 .5rem; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    @media (max-width: 540px) { .task-form { flex-direction: column; } .task-form .btn { width: 100%; } .task-toolbar { align-items: flex-start; flex-direction: column; } }
  `;
  document.head.appendChild(style);

  const form = document.getElementById('taskForm');
  const input = document.getElementById('taskInput');
  const list = document.getElementById('taskList');
  const summary = document.getElementById('taskSummary');
  const empty = document.getElementById('emptyTasks');
  const clearCompleted = document.getElementById('clearCompleted');
  let tasks = readTasks();

  function readTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(TODO_STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function saveTasks() {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(tasks));
  }

  function renderTasks() {
    list.innerHTML = '';
    empty.hidden = tasks.length > 0;
    clearCompleted.disabled = !tasks.some((task) => task.completed);

    const remaining = tasks.filter((task) => !task.completed).length;
    summary.textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} remaining`;

    tasks.forEach((task) => {
      const item = document.createElement('li');
      item.className = `task-item${task.completed ? ' completed' : ''}`;
      item.innerHTML = `
        <input type="checkbox" aria-label="Mark task complete" ${task.completed ? 'checked' : ''} />
        <span class="task-label"></span>
        <button class="delete-task" type="button" aria-label="Delete task">&times;</button>
      `;
      item.querySelector('.task-label').textContent = task.text;
      item.querySelector('input').addEventListener('change', () => {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
      });
      item.querySelector('.delete-task').addEventListener('click', () => {
        tasks = tasks.filter((candidate) => candidate.id !== task.id);
        saveTasks();
        renderTasks();
      });
      list.appendChild(item);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    tasks.unshift({ id: `${Date.now()}-${Math.random()}`, text, completed: false });
    saveTasks();
    renderTasks();
    form.reset();
    input.focus();
  });

  clearCompleted.addEventListener('click', () => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
  });

  renderTasks();
}

injectTaskList();
