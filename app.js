// DOM Elements
const sections = {
  today: document.getElementById('list-today'),
  pending: document.getElementById('list-pending'),
  completed: document.getElementById('list-completed')
};

// ONE-TIME RESET TO CLEAN MOCK DATA
if (!localStorage.getItem('app_reset_kickstart')) {
  localStorage.removeItem('dailypulse_tasks');
  localStorage.removeItem('dailypulse_last_date');
  localStorage.setItem('app_reset_kickstart', 'true');
}

const containers = {
  pending: document.getElementById('section-pending'),
  completed: document.getElementById('section-completed')
};

const modal = document.getElementById('add-task-modal');
const form = document.getElementById('add-task-form');
const input = document.getElementById('task-title');

// Initialize layout
function init() {
  updateHeader();
  renderAllTasks();
  setupEventListeners();
  setWeatherBackground();
}

function updateHeader() {
  const greetingEl = document.getElementById('greeting');
  const dateEl = document.getElementById('current-date');
  const progressContainer = document.querySelector('.progress-container');

  // Greeting
  const hour = new Date().getHours();
  if (hour < 12) greetingEl.textContent = 'Good Morning';
  else if (hour < 18) greetingEl.textContent = 'Good Afternoon';
  else greetingEl.textContent = 'Good Evening';

  // Date
  dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Progress Bar
  const stats = store.getProgress();
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.percent / 100) * circumference;

  progressContainer.innerHTML = `
    <div class="progress-circle">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle class="progress-bg" cx="26" cy="26" r="22"></circle>
        <circle class="progress-val" cx="26" cy="26" r="22" style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset};"></circle>
      </svg>
      <div class="progress-text">${stats.text}</div>
    </div>
  `;
}

function createTaskDOMItem(task) {
  const div = document.createElement('div');
  
  // Calculate days pending for visual graduation
  let pendingClass = '';
  if (task.state === 'pending') {
    const msPerDay = 1000 * 60 * 60 * 24;
    const addedTime = new Date(task.dateAdded).getTime();
    const todayTime = new Date(store.getTodayString()).getTime();
    const daysPending = Math.floor((todayTime - addedTime) / msPerDay);
    
    if (daysPending >= 3) {
      pendingClass = 'pending-critical';
    } else if (daysPending === 2) {
      pendingClass = 'pending-urgent';
    } else {
      pendingClass = 'pending';
    }
  }

  div.className = `task-item ${pendingClass} ${task.state === 'completed' ? 'completed-archived' : ''}`;
  div.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.state === 'completed';
  
  checkbox.addEventListener('change', (e) => {
    // When unchecked, return to its origin logic: 
    // If it was created today, go to 'new', else 'pending'
    if (e.target.checked) {
      store.updateTaskState(task.id, 'completed');
    } else {
      const isToday = task.dateAdded === store.getTodayString();
      store.updateTaskState(task.id, isToday ? 'new' : 'pending');
    }
    renderAllTasks();
    updateHeader();
  });

  const content = document.createElement('div');
  content.className = 'task-content';
  
  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = task.title;
  content.appendChild(title);

  if (task.timeFrame) {
    const time = document.createElement('div');
    time.className = 'task-time';
    time.textContent = '🕒 ' + task.timeFrame;
    content.appendChild(time);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '✕';
  deleteBtn.title = "Delete Task";
  deleteBtn.addEventListener('click', () => {
    store.deleteTask(task.id);
    renderAllTasks();
    updateHeader();
  });

  div.appendChild(checkbox);
  div.appendChild(content);
  div.appendChild(deleteBtn);

  return div;
}

function renderList(element, tasks, emptyMessage) {
  element.innerHTML = '';
  if (tasks.length === 0) {
    element.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
    return;
  }
  tasks.forEach(task => {
    element.appendChild(createTaskDOMItem(task));
  });
}

function renderAllTasks() {
  const groups = store.getTasksByState();

  renderList(sections.today, groups.today, "You have no tasks for today! Enjoy the rest.");
  renderList(sections.pending, groups.pending, "No pending tasks.");
  renderList(sections.completed, groups.completed, "No completed tasks yet.");

  // Hide sections if empty
  containers.pending.style.display = groups.pending.length > 0 ? 'flex' : 'none';
  containers.completed.style.display = groups.completed.length > 0 ? 'flex' : 'none';
}

function setupEventListeners() {
  document.getElementById('fab-add-task').addEventListener('click', () => {
    modal.classList.remove('hidden');
    // Ensure animation logic
    setTimeout(() => input.focus(), 100);
  });

  document.getElementById('close-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Toggle completed
  document.querySelector('.completed-header').addEventListener('click', () => {
    containers.completed.classList.toggle('collapsed');
  });

  // Modal clicks outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value;
    const timeVal = document.getElementById('task-time').value;
    if (val) {
      store.addTask(val, timeVal);
      input.value = '';
      document.getElementById('task-time').value = '';
      modal.classList.add('hidden');
      renderAllTasks();
      updateHeader();
    }
  });
}

// WEATHER & BACKGROUND LOGIC
const weatherImages = {
  clear: 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?q=80&w=1920&fit=crop', // Clear sky
  cloudy: 'https://images.unsplash.com/photo-1534088568595-a06df41084c3?q=80&w=1920&fit=crop', // Clouds
  rain: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920&fit=crop', // Rain
  snow: 'https://images.unsplash.com/photo-1478265409131-1f65c88f965c?q=80&w=1920&fit=crop', // Snow
  default: `https://picsum.photos/seed/${new Date().toDateString().replace(/ /g, '')}/1920/1080` // Daily random as fallback
};

async function setWeatherBackground() {
  const applyBgFade = (url) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      let bgLayer = document.getElementById('bg-layer');
      if (!bgLayer) {
        bgLayer = document.createElement('div');
        bgLayer.id = 'bg-layer';
        document.body.prepend(bgLayer);
      }
      bgLayer.style.backgroundImage = `url('${url}')`;
      requestAnimationFrame(() => {
        bgLayer.style.opacity = '1';
      });
    };
  };
  
  // Set default first so there's always an image gracefully loading
  applyBgFade(weatherImages.default);

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const data = await res.json();
        const code = data.current_weather.weathercode;
        
        let type = 'clear';
        if (code >= 1 && code <= 3) type = 'cloudy';
        if (code >= 51 && code <= 67) type = 'rain';
        if (code >= 71 && code <= 86) type = 'snow';
        if (code >= 95) type = 'rain'; // Thunderstorm
        
        applyBgFade(weatherImages[type]);
      } catch (err) {
        console.error("Weather fetch failed", err);
      }
    }, () => {
      console.log("Geolocation denied, using daily fallback image.");
    });
  }
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
