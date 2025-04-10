let currentUser = localStorage.getItem("currentUser") || "guest";
let score = parseInt(localStorage.getItem(`${currentUser}_score`)) || 0;
let tasks = JSON.parse(localStorage.getItem(`${currentUser}_tasks`)) || [];
let completed = JSON.parse(localStorage.getItem(`${currentUser}_completed`)) || [];
let editingTaskIndex = null;

function generateCSV(data) {
  const header = Object.keys(data[0] || {}).join(",");
  const rows = data.map(task => Object.values(task).map(value => `"${value}"`).join(","));
  return [header, ...rows].join("\n");
}

function saveCSVToLocal(data) {
  const csv = generateCSV(data);
  localStorage.setItem(`${currentUser}_completed_csv`, csv);
}

function loadCSVFromLocal() {
  return localStorage.getItem(`${currentUser}_completed_csv`) || "";
}

function addTask() {
  const title = document.getElementById("taskTitle").value;
  const deadline = document.getElementById("taskDeadline").value;
  const type = document.getElementById("taskType").value;

  if (!title || !deadline || !type) return;

  const now = new Date();

  if (editingTaskIndex !== null) {
    tasks[editingTaskIndex] = {
      ...tasks[editingTaskIndex],
      title,
      deadline,
      type
    };
    editingTaskIndex = null;
    document.getElementById("addBtn").textContent = "➕ Add Task";
  } else {
    tasks.push({ title, deadline, type, createdAt: now.toISOString() });
  }

  saveTasks();
  document.getElementById("taskTitle").value = '';
  document.getElementById("taskDeadline").value = '';
  document.getElementById("taskType").value = 'quiz';
  renderTasks();
}

function completeTask(index) {
  const task = tasks.splice(index, 1)[0];
  completed.push({ ...task, completedAt: new Date().toISOString() });
  score++;
  saveTasks();
  localStorage.setItem(`${currentUser}_score`, score);
  renderTasks();
}

function deleteTask(index) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
}

function saveTasks() {
  localStorage.setItem(`${currentUser}_tasks`, JSON.stringify(tasks));
  localStorage.setItem(`${currentUser}_completed`, JSON.stringify(completed));
  saveCSVToLocal(completed);
}

function formatRemainingTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function updateTaskCounts() {
  const quizCount = tasks.filter(t => t.type === 'quiz').length;
  const assignmentCount = tasks.filter(t => t.type === 'assignment').length;
  const projectCount = tasks.filter(t => t.type === 'project').length;

  document.getElementById("quizCount").textContent = quizCount;
  document.getElementById("assignmentCount").textContent = assignmentCount;
  document.getElementById("projectCount").textContent = projectCount;
}

function renderTasks() {
  const quizTasks = document.getElementById("quizTasks");
  const assignmentTasks = document.getElementById("assignmentTasks");
  const projectTasks = document.getElementById("projectTasks");

  quizTasks.innerHTML = "";
  assignmentTasks.innerHTML = "";
  projectTasks.innerHTML = "";

  tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  tasks.forEach((task, index) => {
    const taskEl = document.createElement("div");
    taskEl.className = "task-item";

    taskEl.innerHTML = `
      <div class="task-content">
        <div class="task-title">${task.title}</div>
        <div class="task-deadline">Due: ${new Date(task.deadline).toLocaleString()}</div>
        <div class="task-type badge ${task.type}">${task.type}</div>
        <div class="remaining-time" data-title="${task.title}"></div>
        <div class="progress-bar">
          <div class="progress-bar-fill"></div>
        </div>
      </div>
      <div class="task-controls">
        <button class="complete-btn" onclick="completeTask(${index})">✅ Complete</button>
        <button class="complete-btn" style="background-color: #dc2626;" onclick="deleteTask(${index})">🗑️ Delete</button>
      </div>
    `;

    if (task.type === "quiz") quizTasks.appendChild(taskEl);
    else if (task.type === "assignment") assignmentTasks.appendChild(taskEl);
    else if (task.type === "project") projectTasks.appendChild(taskEl);
  });

  document.getElementById("scoreDisplay").textContent = score;
  updateTaskCounts();
  updateRemainingTimes();
}

function updateRemainingTimes() {
  const now = new Date().getTime();

  document.querySelectorAll(".remaining-time").forEach(el => {
    const taskTitle = el.dataset.title;
    const task = tasks.find(t => t.title === taskTitle);
    if (!task) return;

    const deadline = new Date(task.deadline).getTime();
    const createdTime = new Date(task.createdAt).getTime();
    const remaining = Math.max(0, deadline - now);
    const totalDuration = deadline - createdTime;
    const elapsed = now - createdTime;
    const percent = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 100;

    el.textContent = "Time Left: " + formatRemainingTime(remaining);

    const taskEl = el.closest(".task-item");
    const fill = taskEl.querySelector(".progress-bar-fill");
    if (fill) fill.style.width = `${percent}%`;
  });
}

function checkForNotifications() {
  const now = new Date().getTime();
  let notifications = JSON.parse(localStorage.getItem(`${currentUser}_notifications`)) || [];

  tasks.forEach(task => {
    const deadline = new Date(task.deadline).getTime();
    const timeDiff = deadline - now;

    const is24HrLeft = timeDiff <= 86400000 && timeDiff > 0;
    const alreadyNotified = notifications.find(n => n.title === task.title);

    if (is24HrLeft && !alreadyNotified) {
      const message = `Your ${task.type} "${task.title}" deadline is today!`;
      const notificationObj = {
        title: task.title,
        message,
        type: task.type,
        timestamp: new Date().toISOString(),
        seen: false
      };

      notifications.unshift(notificationObj); // Add to start for latest on top
      sendBrowserNotification("Task Reminder", message);
    }
  });

  localStorage.setItem(`${currentUser}_notifications`, JSON.stringify(notifications));
  updateNotificationCounter();
}

function updateNotificationCounter() {
  const notifications = JSON.parse(localStorage.getItem(`${currentUser}_notifications`)) || [];
  const unseenCount = notifications.filter(n => !n.seen).length;

  const bellIcon = document.getElementById("notificationBell");
  if (!bellIcon) return;

  let counter = document.getElementById("notificationCount");
  if (!counter) {
    counter = document.createElement("span");
    counter.id = "notificationCount";
    bellIcon.appendChild(counter);
  }

  counter.textContent = unseenCount;
  counter.style.cssText = unseenCount > 0 ? `
    position: absolute;
    top: -6px;
    right: -6px;
    background: red;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 12px;
  ` : `display: none;`;
}

// Initial rendering
renderTasks();
checkForNotifications();
setInterval(updateRemainingTimes, 1000);
setInterval(checkForNotifications, 5 * 60 * 1000); // every 5 minutes

// Theme toggle
const toggleThemeBtn = document.getElementById('toggleTheme');
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'night') {
    document.body.classList.add('night');
    toggleThemeBtn.textContent = '☀️ Light Mode';
  } else {
    toggleThemeBtn.textContent = '🌙 Night Mode';
  }

  document.getElementById("scoreDisplay").textContent = score;
  renderTasks();
});

toggleThemeBtn.addEventListener('click', () => {
  const isNight = document.body.classList.toggle('night');
  localStorage.setItem('theme', isNight ? 'night' : 'light');
  toggleThemeBtn.textContent = isNight ? '☀️ Light Mode' : '🌙 Night Mode';
});

// History button
const scoreboardBtn = document.getElementById("scoreboard");
scoreboardBtn.addEventListener('click', () => {
  localStorage.setItem("historyPageUser", currentUser);
  window.location.href = "history.html";
});
function sendBrowserNotification(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
  }
}
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}
