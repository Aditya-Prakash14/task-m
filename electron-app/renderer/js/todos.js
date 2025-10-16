let currentTodos = [];
let categories = [];
let tags = [];

// Load user info
async function loadUserInfo() {
  try {
    const user = await window.electronAPI.store.get('user');
    if (user) {
      document.querySelector('.user-name').textContent = user.name;
      document.querySelector('.user-email').textContent = user.email;
    }
  } catch (error) {
    console.error('Error loading user info:', error);
  }
}

// Load todos
async function loadTodos() {
  try {
    const status = document.getElementById('filter-status').value;
    const priority = document.getElementById('filter-priority').value;
    const search = document.getElementById('search-input').value;

    const params = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && { search }),
      sortBy: 'dueDate',
      order: 'asc'
    };

    const response = await api.getTodos(params);
    
    if (response.success) {
      currentTodos = response.data.todos;
      renderTodos();
    }
  } catch (error) {
    console.error('Error loading todos:', error);
    document.getElementById('todos-container').innerHTML = `
      <p style="text-align: center; color: var(--danger-color);">Error loading todos</p>
    `;
  }
}

// Render todos
function renderTodos() {
  const container = document.getElementById('todos-container');
  
  if (currentTodos.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; color: var(--text-secondary); padding: 3rem;">
        No todos found. Create your first one!
      </p>
    `;
    return;
  }

  const todosHtml = currentTodos.map(todo => {
    const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
    const isOverdue = dueDate && dueDate < new Date() && todo.status !== 'COMPLETED';
    const dueDateStr = dueDate ? dueDate.toLocaleString() : 'No due date';
    const statusClass = todo.status.toLowerCase().replace('_', '-');
    
    return `
      <div class="card" style="margin-bottom: 1rem;">
        <div class="card-body">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
            <div style="flex: 1;">
              <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem;">${todo.title}</h3>
              ${todo.description ? `<p style="color: var(--text-secondary); margin: 0 0 0.5rem 0;">${todo.description}</p>` : ''}
              
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem;">
                <span class="badge priority-${todo.priority.toLowerCase()}">${todo.priority}</span>
                <span class="badge status-${statusClass}">${formatStatus(todo.status)}</span>
                ${todo.category ? `<span class="badge badge-secondary">${todo.category.name}</span>` : ''}
                ${isOverdue ? '<span class="badge badge-danger">Overdue</span>' : ''}
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-sm btn-outline" onclick="editTodo('${todo.id}')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteTodo('${todo.id}')">Delete</button>
            </div>
          </div>

          <div style="display: flex; gap: 1.5rem; font-size: 0.875rem; color: var(--text-secondary); flex-wrap: wrap;">
            <span>📅 ${dueDateStr}</span>
            ${todo.estimatedTime ? `<span>⏱️ ${todo.estimatedTime} min</span>` : ''}
            ${todo.subTodos && todo.subTodos.length > 0 ? `<span>📋 ${todo.subTodos.length} subtasks</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = todosHtml;
}

// Show todo modal
function showTodoModal(todo = null) {
  const modal = document.getElementById('todo-modal');
  const form = document.getElementById('todo-form');
  
  form.reset();
  
  if (todo) {
    document.getElementById('modal-title').textContent = 'Edit Todo';
    document.getElementById('todo-id').value = todo.id;
    document.getElementById('todo-title').value = todo.title;
    document.getElementById('todo-description').value = todo.description || '';
    document.getElementById('todo-priority').value = todo.priority;
    document.getElementById('todo-status').value = todo.status;
    
    if (todo.dueDate) {
      const date = new Date(todo.dueDate);
      document.getElementById('todo-due-date').value = date.toISOString().slice(0, 16);
    }
    
    if (todo.estimatedTime) {
      document.getElementById('todo-estimated-time').value = todo.estimatedTime;
    }
  } else {
    document.getElementById('modal-title').textContent = 'New Todo';
    document.getElementById('todo-id').value = '';
  }
  
  modal.classList.add('active');
}

// Close todo modal
function closeTodoModal() {
  document.getElementById('todo-modal').classList.remove('active');
}

// Edit todo
async function editTodo(id) {
  try {
    const response = await api.getTodoById(id);
    if (response.success) {
      showTodoModal(response.data);
    }
  } catch (error) {
    console.error('Error loading todo:', error);
    alert('Error loading todo');
  }
}

// Delete todo
async function deleteTodo(id) {
  if (!confirm('Are you sure you want to delete this todo?')) return;
  
  try {
    await api.deleteTodo(id);
    loadTodos();
  } catch (error) {
    console.error('Error deleting todo:', error);
    alert('Error deleting todo');
  }
}

// Submit todo form
document.getElementById('todo-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const todoId = document.getElementById('todo-id').value;
  const todoData = {
    title: document.getElementById('todo-title').value,
    description: document.getElementById('todo-description').value || null,
    priority: document.getElementById('todo-priority').value,
    status: document.getElementById('todo-status').value,
    dueDate: document.getElementById('todo-due-date').value || null,
    estimatedTime: parseInt(document.getElementById('todo-estimated-time').value) || null
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (todoId) {
      await api.updateTodo(todoId, todoData);
    } else {
      await api.createTodo(todoData);
    }
    
    closeTodoModal();
    loadTodos();
  } catch (error) {
    console.error('Error saving todo:', error);
    alert('Error saving todo: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Todo';
  }
});

// Filter handlers
document.getElementById('filter-status').addEventListener('change', loadTodos);
document.getElementById('filter-priority').addEventListener('change', loadTodos);

let searchTimeout;
document.getElementById('search-input').addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadTodos, 300);
});

function clearFilters() {
  document.getElementById('filter-status').value = '';
  document.getElementById('filter-priority').value = '';
  document.getElementById('search-input').value = '';
  loadTodos();
}

function formatStatus(status) {
  return status.replace('_', ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    api.logout();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadUserInfo();
  loadTodos();

  // Check if we should open new todo modal
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'new') {
    showTodoModal();
  }
});

// Listen for keyboard shortcuts
window.electronAPI.onShowNewTodoModal(() => {
  showTodoModal();
});

// Close modal on escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeTodoModal();
  }
});

// Close modal on backdrop click
document.getElementById('todo-modal').addEventListener('click', (e) => {
  if (e.target.id === 'todo-modal') {
    closeTodoModal();
  }
});
