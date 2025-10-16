const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Store operations
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key)
  },

  // Navigation
  navigateTo: (page) => ipcRenderer.send('navigate-to', page),

  // Listen to main process events
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (event, page) => callback(page));
  },
  onShowNewTodoModal: (callback) => {
    ipcRenderer.on('show-new-todo-modal', () => callback());
  },
  onShowNewEventModal: (callback) => {
    ipcRenderer.on('show-new-event-modal', () => callback());
  },
  onShowAboutModal: (callback) => {
    ipcRenderer.on('show-about-modal', () => callback());
  }
});
