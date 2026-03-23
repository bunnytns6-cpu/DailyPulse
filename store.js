// Basic Data logic wrapper

const STORE_KEY = 'dailypulse_tasks';
const LAST_ACCESS_KEY = 'dailypulse_last_date';

class Store {
  constructor() {
    this.tasks = this.loadTasks();
    this.checkRollover();
  }

  loadTasks() {
    try {
      const data = localStorage.getItem(STORE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed loading tasks", e);
      return [];
    }
  }

  saveTasks() {
    localStorage.setItem(STORE_KEY, JSON.stringify(this.tasks));
  }

  getTodayString() {
    return new Date().toDateString(); // e.g. "Sun Mar 22 2026"
  }

  checkRollover() {
    const today = this.getTodayString();
    const lastAccess = localStorage.getItem(LAST_ACCESS_KEY);

    if (lastAccess && lastAccess !== today) {
      // It's a new day! Rollover logic
      let changed = false;
      this.tasks.forEach(task => {
        // Any task that isn't completed and wasn't created today gets 'pending'
        if (task.state === 'new' && task.dateAdded !== today) {
          task.state = 'pending';
          changed = true;
        }
      });
      if (changed) {
        this.saveTasks();
      }
    }
    
    // Update last access to today immediately
    localStorage.setItem(LAST_ACCESS_KEY, today);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  addTask(title, timeFrame = '') {
    const newTask = {
      id: this.generateId(),
      title: title.trim(),
      timeFrame: timeFrame.trim(),
      state: 'new', // new, pending, completed
      dateAdded: this.getTodayString(),
      createdAt: Date.now()
    };
    this.tasks.push(newTask);
    this.saveTasks();
    return newTask;
  }

  updateTaskState(id, newState) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.state = newState;
      this.saveTasks();
      return true;
    }
    return false;
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
  }

  getTasksByState() {
    // Return categorized
    return {
      today: this.tasks.filter(t => t.state === 'new'),
      pending: this.tasks.filter(t => t.state === 'pending'),
      completed: this.tasks.filter(t => t.state === 'completed'),
    };
  }

  getProgress() {
    const total = this.tasks.length;
    if (total === 0) return { percent: 0, text: '0/0' };
    const completed = this.tasks.filter(t => t.state === 'completed').length;
    return {
      percent: Math.round((completed / total) * 100),
      text: `${completed}/${total}`
    };
  }
}

// Global instance
window.store = new Store();
