// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async getToken() {
    return await window.electronAPI.store.get('authToken');
  }

  async setToken(token) {
    await window.electronAPI.store.set('authToken', token);
  }

  async removeToken() {
    await window.electronAPI.store.delete('authToken');
  }

  async request(endpoint, options = {}) {
    const token = await this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (data.success && data.data.token) {
      await this.setToken(data.data.token);
      await window.electronAPI.store.set('user', data.data.user);
    }
    
    return data;
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (data.success && data.data.token) {
      await this.setToken(data.data.token);
      await window.electronAPI.store.set('user', data.data.user);
    }
    
    return data;
  }

  async logout() {
    await this.removeToken();
    await window.electronAPI.store.delete('user');
    window.electronAPI.navigateTo('auth');
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  // Todos
  async getTodos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/todos?${queryString}`);
  }

  async getTodoById(id) {
    return await this.request(`/todos/${id}`);
  }

  async createTodo(todoData) {
    return await this.request('/todos', {
      method: 'POST',
      body: JSON.stringify(todoData)
    });
  }

  async updateTodo(id, todoData) {
    return await this.request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todoData)
    });
  }

  async deleteTodo(id) {
    return await this.request(`/todos/${id}`, {
      method: 'DELETE'
    });
  }

  // Events
  async getEvents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/events?${queryString}`);
  }

  async getEventById(id) {
    return await this.request(`/events/${id}`);
  }

  async getEventsByDate(date) {
    return await this.request(`/events/by-date?date=${date}`);
  }

  async createEvent(eventData) {
    return await this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  async updateEvent(id, eventData) {
    return await this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  }

  async deleteEvent(id) {
    return await this.request(`/events/${id}`, {
      method: 'DELETE'
    });
  }

  // Categories
  async getCategories() {
    return await this.request('/categories');
  }

  async createCategory(categoryData) {
    return await this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(id, categoryData) {
    return await this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(id) {
    return await this.request(`/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Tags
  async getTags() {
    return await this.request('/tags');
  }

  async createTag(tagData) {
    return await this.request('/tags', {
      method: 'POST',
      body: JSON.stringify(tagData)
    });
  }

  async updateTag(id, tagData) {
    return await this.request(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tagData)
    });
  }

  async deleteTag(id) {
    return await this.request(`/tags/${id}`, {
      method: 'DELETE'
    });
  }

  // Reminders
  async getReminders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/reminders?${queryString}`);
  }

  async createReminder(reminderData) {
    return await this.request('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminderData)
    });
  }

  async updateReminder(id, reminderData) {
    return await this.request(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reminderData)
    });
  }

  async deleteReminder(id) {
    return await this.request(`/reminders/${id}`, {
      method: 'DELETE'
    });
  }

  // Analytics
  async getDashboardAnalytics() {
    return await this.request('/analytics/dashboard');
  }

  async getProductivityAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/analytics/productivity?${queryString}`);
  }
}

// Export singleton instance
const api = new ApiService();
