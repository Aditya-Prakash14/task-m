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

// Load analytics data
async function loadAnalytics() {
  try {
    const response = await api.getDashboardAnalytics();
    
    if (response.success) {
      const data = response.data;
      
      // Update stats
      document.getElementById('total-todos').textContent = data.todos.total;
      document.getElementById('pending-todos').textContent = data.todos.pending;
      document.getElementById('completed-todos').textContent = data.todos.completed;
      document.getElementById('overdue-todos').textContent = data.todos.overdue;
      document.getElementById('total-events').textContent = data.events.total;
      document.getElementById('upcoming-reminders').textContent = data.upcomingReminders;
      
      // Update priority breakdown
      const priorityBreakdown = document.getElementById('priority-breakdown');
      const priorities = ['urgent', 'high', 'medium', 'low'];
      
      priorityBreakdown.innerHTML = priorities.map(priority => {
        const count = data.todos.byPriority[priority] || 0;
        return `
          <div class="priority-item">
            <span class="badge priority-${priority}">${priority.toUpperCase()}</span>
            <span class="priority-count">${count}</span>
          </div>
        `;
      }).join('');
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

// Load recent todos
async function loadRecentTodos() {
  try {
    const response = await api.getTodos({ limit: 5, sortBy: 'createdAt', order: 'desc' });
    
    if (response.success && response.data.todos.length > 0) {
      const todosHtml = response.data.todos.map(todo => {
        const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';
        const statusClass = todo.status.toLowerCase().replace('_', '-');
        
        return `
          <div class="todo-item" onclick="window.location.href='todos.html'">
            <div class="todo-header">
              <h4 class="todo-title">${todo.title}</h4>
              <span class="badge priority-${todo.priority.toLowerCase()}">${todo.priority}</span>
            </div>
            <div class="todo-meta">
              <span class="todo-status status-${statusClass}">${formatStatus(todo.status)}</span>
              <span>📅 ${dueDate}</span>
              ${todo.category ? `<span>📁 ${todo.category.name}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
      
      document.getElementById('recent-todos').innerHTML = todosHtml;
    } else {
      document.getElementById('recent-todos').innerHTML = `
        <p style="text-align: center; color: var(--text-secondary);">No todos yet. Create your first one!</p>
      `;
    }
  } catch (error) {
    console.error('Error loading recent todos:', error);
    document.getElementById('recent-todos').innerHTML = `
      <p style="text-align: center; color: var(--danger-color);">Error loading todos</p>
    `;
  }
}

// Load upcoming events
async function loadUpcomingEvents() {
  try {
    const now = new Date().toISOString();
    const response = await api.getEvents({ 
      status: 'SCHEDULED', 
      startDate: now,
      limit: 5,
      sortBy: 'startTime',
      order: 'asc'
    });
    
    if (response.success && response.data.events.length > 0) {
      const eventsHtml = response.data.events.map(event => {
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);
        const dateStr = startTime.toLocaleDateString();
        const timeStr = event.isAllDay 
          ? 'All day' 
          : `${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        return `
          <div class="event-item" onclick="window.location.href='calendar.html'" 
               style="border-left-color: ${event.category?.color || '#3b82f6'}">
            <div class="event-title">${event.title}</div>
            <div class="event-time">📅 ${dateStr} • ${timeStr}</div>
            ${event.location ? `<div class="event-time">📍 ${event.location}</div>` : ''}
          </div>
        `;
      }).join('');
      
      document.getElementById('upcoming-events').innerHTML = eventsHtml;
    } else {
      document.getElementById('upcoming-events').innerHTML = `
        <p style="text-align: center; color: var(--text-secondary);">No upcoming events</p>
      `;
    }
  } catch (error) {
    console.error('Error loading events:', error);
    document.getElementById('upcoming-events').innerHTML = `
      <p style="text-align: center; color: var(--danger-color);">Error loading events</p>
    `;
  }
}

// Helper functions
function formatStatus(status) {
  return status.replace('_', ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function showNewTodoModal() {
  window.location.href = 'todos.html?action=new';
}

function showNewEventModal() {
  window.location.href = 'calendar.html?action=new';
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    api.logout();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadUserInfo();
  loadAnalytics();
  loadRecentTodos();
  loadUpcomingEvents();
  
  // Refresh data every 30 seconds
  setInterval(() => {
    loadAnalytics();
    loadRecentTodos();
    loadUpcomingEvents();
  }, 30000);
});

// Listen for navigation events from main process
window.electronAPI.onNavigate((page) => {
  if (page !== 'dashboard') {
    window.location.href = `${page}.html`;
  }
});

window.electronAPI.onShowNewTodoModal(() => {
  showNewTodoModal();
});

window.electronAPI.onShowNewEventModal(() => {
  showNewEventModal();
});
