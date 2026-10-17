/**
 * VY'S TASKFLOW - PROFESSIONAL TASK MANAGEMENT DASHBOARD
 * Modern JavaScript Logic with LocalStorage, Search, Filter, Sort, Kanban, Subtasks & Dark Mode
 */

// ==========================================================================
// 1. CONSTANTS & INITIAL DATA
// ==========================================================================
const STORAGE_KEYS = {
  TASKS: 'vy_taskflow_tasks',
  THEME: 'vy_taskflow_theme',
  VIEW: 'vy_taskflow_view'
};

const CATEGORY_MAP = {
  study: { label: 'Học tập', icon: '📚', className: 'category-study' },
  project: { label: 'Dự án', icon: '💼', className: 'category-project' },
  chore: { label: 'Việc nhà', icon: '🏠', className: 'category-chore' },
  personal: { label: 'Cá nhân', icon: '💖', className: 'category-personal' }
};

const PRIORITY_MAP = {
  high: { label: 'Cao (Gấp)', icon: '🔴', weight: 3, className: 'priority-high' },
  medium: { label: 'Trung bình', icon: '🟡', weight: 2, className: 'priority-medium' },
  low: { label: 'Thấp', icon: '🟢', weight: 1, className: 'priority-low' }
};

// Default starter tasks for first-time launch
const DEFAULT_TASKS = [
  {
    id: 'task_init_1',
    text: 'Thiết kế Dashboard Quản lý Công việc cho Vy 🌸',
    priority: 'high',
    category: 'project',
    dueDate: getRelativeDateString(1, 18, 0), // Ngày mai 18:00
    status: 'in-progress',
    completed: false,
    subtasks: [
      { id: 'sub_1_1', text: 'Tạo layout Pastel dịu mắt và chuẩn responsive', completed: true },
      { id: 'sub_1_2', text: 'Tích hợp Dark Mode và Kanban Board', completed: true },
      { id: 'sub_1_3', text: 'Bổ sung quản lý Hạn chót & Subtasks chi tiết', completed: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'task_init_2',
    text: 'Học ngữ pháp tiếng Anh & luyện phát âm 30 phút 🎧',
    priority: 'medium',
    category: 'study',
    dueDate: getRelativeDateString(0, 21, 30), // Hôm nay 21:30
    status: 'todo',
    completed: false,
    subtasks: [
      { id: 'sub_2_1', text: 'Luyện 1 bài nghe podcast', completed: false },
      { id: 'sub_2_2', text: 'Ghi chú 5 từ vựng mới', completed: false }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'task_init_3',
    text: 'Uống đủ 2L nước và tập yoga thư giãn buổi tối 🌿',
    priority: 'low',
    category: 'personal',
    dueDate: getRelativeDateString(0, 22, 0),
    status: 'completed',
    completed: true,
    subtasks: [
      { id: 'sub_3_1', text: 'Uống ly nước ấm sau khi thức dậy', completed: true },
      { id: 'sub_3_2', text: 'Giãn cơ 15 phút trước khi ngủ', completed: true }
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

// Helper to generate ISO strings for default tasks
function getRelativeDateString(offsetDays, hours, minutes) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString().slice(0, 16);
}

// ==========================================================================
// 2. STATE MANAGEMENT
// ==========================================================================
let tasks = loadTasks();
let currentView = localStorage.getItem(STORAGE_KEYS.VIEW) || 'list'; // 'list' | 'kanban'
let currentTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';

// Filters & Search State
let searchQuery = '';
let filterStatus = 'all'; // 'all' | 'todo' | 'in-progress' | 'completed'
let filterCategory = 'all';
let filterPriority = 'all';
let sortBy = 'newest';

// State for modal editing
let editingTaskId = null;
let currentModalSubtasks = [];

// ==========================================================================
// 3. DOM ELEMENTS
// ==========================================================================
// Header & Clock
const liveClockEl = document.getElementById('liveClock');
const liveDateEl = document.getElementById('liveDate');
const greetingSubtitleEl = document.getElementById('greetingSubtitle');
const themeToggleBtn = document.getElementById('themeToggleBtn');

// Progress & Metrics
const progressPercentageEl = document.getElementById('progressPercentage');
const progressFillEl = document.getElementById('progressFill');
const progressSummaryTextEl = document.getElementById('progressSummaryText');
const metricTotalEl = document.getElementById('metricTotal');
const metricPendingEl = document.getElementById('metricPending');
const metricCompletedEl = document.getElementById('metricCompleted');
const metricOverdueEl = document.getElementById('metricOverdue');

// Input Form
const taskCreateForm = document.getElementById('taskCreateForm');
const taskInput = document.getElementById('taskInput');
const taskPriority = document.getElementById('taskPriority');
const taskCategory = document.getElementById('taskCategory');
const taskDueDate = document.getElementById('taskDueDate');
const addBtn = document.getElementById('addBtn');
const inputWrapper = document.getElementById('inputWrapper');

// Toolbar: Search, Filters, Views
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const viewListBtn = document.getElementById('viewListBtn');
const viewKanbanBtn = document.getElementById('viewKanbanBtn');
const listViewContainer = document.getElementById('listViewContainer');
const kanbanViewContainer = document.getElementById('kanbanViewContainer');
const taskListEl = document.getElementById('taskList');
const emptyStateEl = document.getElementById('emptyState');
const statusPills = document.querySelectorAll('.filter-pill');
const filterCategorySelect = document.getElementById('filterCategory');
const filterPrioritySelect = document.getElementById('filterPriority');
const sortSelect = document.getElementById('sortSelect');

// Kanban Columns
const kanbanListTodo = document.getElementById('kanbanListTodo');
const kanbanListProgress = document.getElementById('kanbanListProgress');
const kanbanListDone = document.getElementById('kanbanListDone');
const kanbanCountTodo = document.getElementById('kanbanCountTodo');
const kanbanCountProgress = document.getElementById('kanbanCountProgress');
const kanbanCountDone = document.getElementById('kanbanCountDone');

// Footer
const footerTotalEl = document.getElementById('footerTotal');
const footerPendingEl = document.getElementById('footerPending');
const footerCompletedEl = document.getElementById('footerCompleted');
const footerOverdueEl = document.getElementById('footerOverdue');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const exportDataBtn = document.getElementById('exportDataBtn');

// Modal Elements
const editModal = document.getElementById('editModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const editTaskForm = document.getElementById('editTaskForm');
const editTaskIdEl = document.getElementById('editTaskId');
const editTaskTitleEl = document.getElementById('editTaskTitle');
const editTaskPriorityEl = document.getElementById('editTaskPriority');
const editTaskCategoryEl = document.getElementById('editTaskCategory');
const editTaskStatusEl = document.getElementById('editTaskStatus');
const editTaskDueDateEl = document.getElementById('editTaskDueDate');
const modalSubtaskListEl = document.getElementById('modalSubtaskList');
const modalSubtasksCountEl = document.getElementById('modalSubtasksCount');
const newSubtaskInput = document.getElementById('newSubtaskInput');
const addSubtaskBtn = document.getElementById('addSubtaskBtn');

const toastContainer = document.getElementById('toastContainer');

// ==========================================================================
// 4. STORAGE HELPERS
// ==========================================================================
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Lỗi khi đọc tasks từ LocalStorage:', err);
  }
  return DEFAULT_TASKS;
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Lỗi khi lưu tasks vào LocalStorage:', err);
  }
}

// ==========================================================================
// 5. CLOCK & THEME SYSTEM
// ==========================================================================
function updateRealtimeClock() {
  const now = new Date();

  // Format HH:mm:ss
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  liveClockEl.textContent = `${hours}:${minutes}:${seconds}`;

  // Format Date in Vietnamese
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[now.getDay()];
  const date = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  liveDateEl.textContent = `${dayName}, ${date}/${month}/${year}`;

  // Dynamic greeting based on current hour
  const currentHour = now.getHours();
  if (currentHour >= 5 && currentHour < 12) {
    greetingSubtitleEl.textContent = '🌅 Chúc Vy một buổi sáng tràn đầy năng lượng và hiệu quả!';
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingSubtitleEl.textContent = '☀️ Buổi chiều thật nhiều niềm vui và hoàn thành xuất sắc các mục tiêu!';
  } else if (currentHour >= 18 && currentHour < 22) {
    greetingSubtitleEl.textContent = '🌙 Buổi tối an lành, cùng xem lại những thành quả hôm nay nhé!';
  } else {
    greetingSubtitleEl.textContent = '✨ Đã khuya rồi, Vy nhớ nghỉ ngơi sớm để nạp năng lượng cho ngày mới nhé!';
  }
}

function initTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem(STORAGE_KEYS.THEME, currentTheme);
  showToast(`Đã chuyển sang ${currentTheme === 'dark' ? 'Chế độ Tối 🌙' : 'Chế độ Sáng ☀️'}`);
}

// ==========================================================================
// 6. HELPER UTILITIES: OVERDUE, FORMATTING & TOASTS
// ==========================================================================
function isOverdue(task) {
  if (!task.dueDate || task.completed || task.status === 'completed') return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

function formatDueDate(dueDateStr) {
  if (!dueDateStr) return null;
  const d = new Date(dueDateStr);
  if (isNaN(d.getTime())) return null;

  const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${timeStr} - ${dateStr}`;
}

function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span><span>${escapeHTML(message)}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ==========================================================================
// 7. TASK CRUD OPERATIONS
// ==========================================================================
function addTask() {
  const text = taskInput.value.trim();

  // Validate empty input
  if (!text) {
    alert('Vui lòng nhập nội dung!');
    inputWrapper.classList.add('shake');
    taskInput.focus();
    setTimeout(() => inputWrapper.classList.remove('shake'), 400);
    return;
  }

  const priorityVal = taskPriority.value;
  const categoryVal = taskCategory.value;
  const dueDateVal = taskDueDate.value;

  const newTask = {
    id: 'task_' + Date.now(),
    text: text,
    priority: priorityVal,
    category: categoryVal,
    dueDate: dueDateVal || '',
    status: 'todo',
    completed: false,
    subtasks: [],
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  saveTasks();
  renderAll();

  // Reset form
  taskInput.value = '';
  taskDueDate.value = '';
  taskInput.focus();
  showToast('Đã thêm công việc mới thành công! 🌸');
}

function toggleTaskComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  if (task.completed) {
    task.status = 'completed';
    // Optionally mark all subtasks complete
    if (task.subtasks) {
      task.subtasks.forEach(st => st.completed = true);
    }
  } else {
    task.status = 'todo';
  }

  saveTasks();
  renderAll();
  showToast(task.completed ? '🎉 Đã hoàn thành công việc!' : 'Đã chuyển thành chưa hoàn thành');
}

function updateTaskStatus(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.status = newStatus;
  task.completed = (newStatus === 'completed');
  if (task.completed && task.subtasks) {
    task.subtasks.forEach(st => st.completed = true);
  }

  saveTasks();
  renderAll();
  showToast(`Đã chuyển trạng thái sang "${getStatusLabel(newStatus)}"`);
}

function deleteTask(id, cardElement) {
  if (cardElement) {
    cardElement.classList.add('fade-out');
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderAll();
      showToast('Đã xóa công việc khỏi danh sách');
    }, 350);
  } else {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderAll();
    showToast('Đã xóa công việc');
  }
}

function clearCompletedTasks() {
  const completedCount = tasks.filter(t => t.completed || t.status === 'completed').length;
  if (completedCount === 0) {
    showToast('Chưa có công việc nào hoàn thành để dọn dẹp!');
    return;
  }

  if (confirm(`Bạn có chắc muốn xóa tất cả ${completedCount} công việc đã hoàn thành không?`)) {
    tasks = tasks.filter(t => !t.completed && t.status !== 'completed');
    saveTasks();
    renderAll();
    showToast(`Đã dọn dẹp xong ${completedCount} công việc! 🧹`);
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'todo': return 'Cần làm';
    case 'in-progress': return 'Đang thực hiện';
    case 'completed': return 'Đã hoàn thành';
    default: return status;
  }
}

// ==========================================================================
// 8. FILTERING, SEARCHING & SORTING LOGIC
// ==========================================================================
function getProcessedTasks() {
  let result = [...tasks];

  // 1. Text Search Filter (Case-insensitive)
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(t => 
      t.text.toLowerCase().includes(q) || 
      (t.subtasks && t.subtasks.some(st => st.text.toLowerCase().includes(q)))
    );
  }

  // 2. Status Filter
  if (filterStatus !== 'all') {
    if (filterStatus === 'completed') {
      result = result.filter(t => t.completed || t.status === 'completed');
    } else if (filterStatus === 'todo') {
      result = result.filter(t => !t.completed && t.status === 'todo');
    } else if (filterStatus === 'in-progress') {
      result = result.filter(t => !t.completed && t.status === 'in-progress');
    }
  }

  // 3. Category Filter
  if (filterCategory !== 'all') {
    result = result.filter(t => t.category === filterCategory);
  }

  // 4. Priority Filter
  if (filterPriority !== 'all') {
    result = result.filter(t => t.priority === filterPriority);
  }

  // 5. Sorting
  result.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'priorityDesc') {
      const weightA = PRIORITY_MAP[a.priority]?.weight || 1;
      const weightB = PRIORITY_MAP[b.priority]?.weight || 1;
      return weightB - weightA;
    }
    if (sortBy === 'dueDateAsc') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  return result;
}

// ==========================================================================
// 9. RENDERING VIEWS: LIST & KANBAN
// ==========================================================================
function renderAll() {
  const processed = getProcessedTasks();

  // Render List View
  renderListView(processed);

  // Render Kanban View
  renderKanbanView(processed);

  // Update Metrics & Progress
  updateMetricsAndProgress();

  // Toggle Empty State
  if (processed.length === 0) {
    emptyStateEl.style.display = 'flex';
  } else {
    emptyStateEl.style.display = 'none';
  }
}

// --- RENDER LIST VIEW ---
function renderListView(tasksToRender) {
  taskListEl.innerHTML = '';

  tasksToRender.forEach(task => {
    const overdue = isOverdue(task);
    const categoryInfo = CATEGORY_MAP[task.category] || CATEGORY_MAP.personal;
    const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
    const formattedDue = formatDueDate(task.dueDate);

    const subtasksTotal = task.subtasks ? task.subtasks.length : 0;
    const subtasksDone = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;

    const li = document.createElement('li');
    li.className = `task-card ${task.completed ? 'completed' : ''} ${overdue ? 'is-overdue' : ''}`;
    li.setAttribute('data-id', task.id);

    li.innerHTML = `
      <div class="card-top-row">
        <div class="card-title-group">
          <label class="task-checkbox-wrap" title="${task.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}">
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span class="custom-checkbox">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </label>
          <span class="task-title ${task.completed ? 'completed' : ''}" title="Nhấn để gạch ngang / hoàn thành">
            ${escapeHTML(task.text)}
          </span>
        </div>

        <div class="card-actions-group">
          <button type="button" class="btn-card-action btn-edit" title="Chỉnh sửa công việc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="btn-card-action btn-delete" title="Xóa công việc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="card-metadata-row">
        <div class="badge-items-wrap">
          <span class="badge-pill ${priorityInfo.className}">
            ${priorityInfo.icon} ${priorityInfo.label}
          </span>
          <span class="badge-pill ${categoryInfo.className}">
            ${categoryInfo.icon} ${categoryInfo.label}
          </span>
          ${formattedDue ? `
            <span class="badge-pill due-badge ${overdue ? 'overdue' : ''}">
              ${overdue ? '⚠️ Quá hạn:' : '⏳ Hạn:'} ${formattedDue}
            </span>
          ` : ''}
        </div>

        ${subtasksTotal > 0 ? `
          <button type="button" class="subtasks-toggle-btn" title="Xem danh sách việc con">
            <span>Việc con: <strong>${subtasksDone}/${subtasksTotal}</strong></span>
            <span>▾</span>
          </button>
        ` : ''}
      </div>

      <!-- Inline Subtasks Drawer -->
      ${subtasksTotal > 0 ? `
        <div class="card-subtasks-wrapper" style="display: none;">
          ${task.subtasks.map(st => `
            <label class="inline-subtask-item">
              <input type="checkbox" data-sub-id="${st.id}" ${st.completed ? 'checked' : ''}>
              <span class="inline-subtask-text ${st.completed ? 'completed' : ''}">${escapeHTML(st.text)}</span>
            </label>
          `).join('')}
        </div>
      ` : ''}
    `;

    // Hook Events
    const checkbox = li.querySelector('.task-checkbox-wrap input');
    const titleText = li.querySelector('.task-title');
    const editBtn = li.querySelector('.btn-edit');
    const deleteBtn = li.querySelector('.btn-delete');
    const subtasksToggle = li.querySelector('.subtasks-toggle-btn');
    const subtasksDrawer = li.querySelector('.card-subtasks-wrapper');

    checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
    titleText.addEventListener('click', () => toggleTaskComplete(task.id));
    editBtn.addEventListener('click', () => openEditModal(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

    if (subtasksToggle && subtasksDrawer) {
      subtasksToggle.addEventListener('click', () => {
        const isHidden = subtasksDrawer.style.display === 'none';
        subtasksDrawer.style.display = isHidden ? 'flex' : 'none';
        subtasksToggle.querySelector('span:last-child').textContent = isHidden ? '▴' : '▾';
      });

      // Handle subtask checkbox toggle
      subtasksDrawer.querySelectorAll('input[type="checkbox"]').forEach(stCheck => {
        stCheck.addEventListener('change', (e) => {
          const subId = e.target.getAttribute('data-sub-id');
          const targetSub = task.subtasks.find(s => s.id === subId);
          if (targetSub) {
            targetSub.completed = e.target.checked;
            saveTasks();
            renderAll();
          }
        });
      });
    }

    taskListEl.appendChild(li);
  });
}

// --- RENDER KANBAN BOARD VIEW ---
function renderKanbanView(tasksToRender) {
  kanbanListTodo.innerHTML = '';
  kanbanListProgress.innerHTML = '';
  kanbanListDone.innerHTML = '';

  const todoTasks = tasksToRender.filter(t => !t.completed && t.status === 'todo');
  const progressTasks = tasksToRender.filter(t => !t.completed && t.status === 'in-progress');
  const doneTasks = tasksToRender.filter(t => t.completed || t.status === 'completed');

  kanbanCountTodo.textContent = todoTasks.length;
  kanbanCountProgress.textContent = progressTasks.length;
  kanbanCountDone.textContent = doneTasks.length;

  todoTasks.forEach(task => kanbanListTodo.appendChild(createKanbanCard(task)));
  progressTasks.forEach(task => kanbanListProgress.appendChild(createKanbanCard(task)));
  doneTasks.forEach(task => kanbanListDone.appendChild(createKanbanCard(task)));
}

function createKanbanCard(task) {
  const card = document.createElement('div');
  const overdue = isOverdue(task);
  const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
  const categoryInfo = CATEGORY_MAP[task.category] || CATEGORY_MAP.personal;
  const formattedDue = formatDueDate(task.dueDate);

  card.className = `kanban-card ${task.completed ? 'completed' : ''}`;
  card.setAttribute('data-id', task.id);

  card.innerHTML = `
    <div class="kanban-card-top">
      <span class="badge-pill ${priorityInfo.className}">${priorityInfo.icon} ${priorityInfo.label}</span>
      <button type="button" class="btn-card-action btn-edit" title="Chỉnh sửa">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
    </div>

    <div class="kanban-card-title ${task.completed ? 'completed' : ''}">
      ${escapeHTML(task.text)}
    </div>

    <div class="kanban-card-meta">
      <span class="badge-pill ${categoryInfo.className}">${categoryInfo.icon} ${categoryInfo.label}</span>
      ${formattedDue ? `
        <span class="badge-pill due-badge ${overdue ? 'overdue' : ''}">
          ${overdue ? '⚠️' : '⏳'} ${formattedDue}
        </span>
      ` : ''}
    </div>

    <div class="kanban-move-actions">
      ${task.status !== 'todo' ? `
        <button type="button" class="btn-move-status btn-move-todo" title="Chuyển sang Cần làm">⬅️ Cần làm</button>
      ` : '<span></span>'}
      ${task.status !== 'in-progress' ? `
        <button type="button" class="btn-move-status btn-move-prog" title="Chuyển sang Đang làm">⏳ Đang làm</button>
      ` : ''}
      ${task.status !== 'completed' ? `
        <button type="button" class="btn-move-status btn-move-done" title="Chuyển sang Đã xong">✅ Đã xong</button>
      ` : ''}
    </div>
  `;

  // Hook Events
  card.querySelector('.btn-edit').addEventListener('click', () => openEditModal(task.id));
  
  const moveTodoBtn = card.querySelector('.btn-move-todo');
  const moveProgBtn = card.querySelector('.btn-move-prog');
  const moveDoneBtn = card.querySelector('.btn-move-done');

  if (moveTodoBtn) moveTodoBtn.addEventListener('click', () => updateTaskStatus(task.id, 'todo'));
  if (moveProgBtn) moveProgBtn.addEventListener('click', () => updateTaskStatus(task.id, 'in-progress'));
  if (moveDoneBtn) moveDoneBtn.addEventListener('click', () => updateTaskStatus(task.id, 'completed'));

  return card;
}

// ==========================================================================
// 10. METRICS & PROGRESS CALCULATION
// ==========================================================================
function updateMetricsAndProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed || t.status === 'completed').length;
  const pending = total - completed;
  const overdueCount = tasks.filter(t => isOverdue(t)).length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Header Progress Fill
  progressFillEl.style.width = `${percentage}%`;
  progressPercentageEl.textContent = `${percentage}%`;

  if (total === 0) {
    progressSummaryTextEl.textContent = 'Chưa có công việc nào. Hãy thêm công việc mới nhé!';
  } else if (percentage === 100) {
    progressSummaryTextEl.textContent = '🎉 Xuất sắc! Vy đã hoàn thành 100% tất cả các mục tiêu!';
  } else {
    progressSummaryTextEl.textContent = `Đã hoàn thành ${completed}/${total} công việc (${percentage}%). Tiếp tục cố gắng nhé!`;
  }

  // Mini Metric Chips
  metricTotalEl.textContent = total;
  metricPendingEl.textContent = pending;
  metricCompletedEl.textContent = completed;
  metricOverdueEl.textContent = overdueCount;

  // Footer Stats
  footerTotalEl.textContent = total;
  footerPendingEl.textContent = pending;
  footerCompletedEl.textContent = completed;
  footerOverdueEl.textContent = overdueCount;
}

// ==========================================================================
// 11. MODAL EDIT & SUBTASKS MANAGEMENT
// ==========================================================================
function openEditModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  currentModalSubtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];

  // Populate form fields
  editTaskIdEl.value = task.id;
  editTaskTitleEl.value = task.text;
  editTaskPriorityEl.value = task.priority;
  editTaskCategoryEl.value = task.category;
  editTaskStatusEl.value = task.status;
  editTaskDueDateEl.value = task.dueDate || '';

  renderModalSubtasks();

  editModal.classList.add('active');
  editModal.setAttribute('aria-hidden', 'false');
  editTaskTitleEl.focus();
}

function closeEditModal() {
  editModal.classList.remove('active');
  editModal.setAttribute('aria-hidden', 'true');
  editingTaskId = null;
  currentModalSubtasks = [];
}

function renderModalSubtasks() {
  modalSubtaskListEl.innerHTML = '';
  modalSubtasksCountEl.textContent = `${currentModalSubtasks.length} việc con`;

  currentModalSubtasks.forEach((st, index) => {
    const li = document.createElement('li');
    li.className = 'modal-subtask-item';
    li.innerHTML = `
      <div class="subtask-left-wrap">
        <input type="checkbox" ${st.completed ? 'checked' : ''} data-index="${index}">
        <span class="${st.completed ? 'completed' : ''}">${escapeHTML(st.text)}</span>
      </div>
      <button type="button" class="btn-remove-subtask" data-index="${index}" title="Xóa bước này">✕</button>
    `;

    li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
      currentModalSubtasks[index].completed = e.target.checked;
      renderModalSubtasks();
    });

    li.querySelector('.btn-remove-subtask').addEventListener('click', () => {
      currentModalSubtasks.splice(index, 1);
      renderModalSubtasks();
    });

    modalSubtaskListEl.appendChild(li);
  });
}

function addSubtaskFromModal() {
  const text = newSubtaskInput.value.trim();
  if (!text) return;

  currentModalSubtasks.push({
    id: 'sub_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    text: text,
    completed: false
  });

  newSubtaskInput.value = '';
  newSubtaskInput.focus();
  renderModalSubtasks();
}

function saveEditedTask() {
  const task = tasks.find(t => t.id === editingTaskId);
  if (!task) return;

  const newTitle = editTaskTitleEl.value.trim();
  if (!newTitle) {
    alert('Tên công việc không được để trống!');
    editTaskTitleEl.focus();
    return;
  }

  task.text = newTitle;
  task.priority = editTaskPriorityEl.value;
  task.category = editTaskCategoryEl.value;
  task.status = editTaskStatusEl.value;
  task.completed = (task.status === 'completed');
  task.dueDate = editTaskDueDateEl.value || '';
  task.subtasks = currentModalSubtasks;

  saveTasks();
  renderAll();
  closeEditModal();
  showToast('Đã lưu thay đổi công việc thành công! 💾');
}

// ==========================================================================
// 12. EXPORT DATA FEATURE (JSON)
// ==========================================================================
function exportTasksToJSON() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Vy_TaskFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Đã xuất file sao lưu dữ liệu JSON thành công! 📥');
}

// ==========================================================================
// 13. EVENT LISTENERS
// ==========================================================================
// Add Task Form
taskCreateForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask();
});
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTask();
  }
});

// Theme Switcher
themeToggleBtn.addEventListener('click', toggleTheme);

// View Switcher (List vs Kanban)
viewListBtn.addEventListener('click', () => {
  currentView = 'list';
  localStorage.setItem(STORAGE_KEYS.VIEW, 'list');
  viewListBtn.classList.add('active');
  viewListBtn.setAttribute('aria-selected', 'true');
  viewKanbanBtn.classList.remove('active');
  viewKanbanBtn.setAttribute('aria-selected', 'false');
  listViewContainer.classList.add('active');
  kanbanViewContainer.classList.remove('active');
});

viewKanbanBtn.addEventListener('click', () => {
  currentView = 'kanban';
  localStorage.setItem(STORAGE_KEYS.VIEW, 'kanban');
  viewKanbanBtn.classList.add('active');
  viewKanbanBtn.setAttribute('aria-selected', 'true');
  viewListBtn.classList.remove('active');
  viewListBtn.setAttribute('aria-selected', 'false');
  kanbanViewContainer.classList.add('active');
  listViewContainer.classList.remove('active');
});

// Search Input Listener
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
  renderAll();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.style.display = 'none';
  searchInput.focus();
  renderAll();
});

// Filter Status Pills
statusPills.forEach(pill => {
  pill.addEventListener('click', () => {
    statusPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    filterStatus = pill.getAttribute('data-status');
    renderAll();
  });
});

// Dropdown Filters: Category, Priority, Sort
filterCategorySelect.addEventListener('change', (e) => {
  filterCategory = e.target.value;
  renderAll();
});

filterPrioritySelect.addEventListener('change', (e) => {
  filterPriority = e.target.value;
  renderAll();
});

sortSelect.addEventListener('change', (e) => {
  sortBy = e.target.value;
  renderAll();
});

// Footer Actions
clearCompletedBtn.addEventListener('click', clearCompletedTasks);
exportDataBtn.addEventListener('click', exportTasksToJSON);

// Modal Listeners
closeModalBtn.addEventListener('click', closeEditModal);
cancelModalBtn.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});
editTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  saveEditedTask();
});
addSubtaskBtn.addEventListener('click', addSubtaskFromModal);
newSubtaskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addSubtaskFromModal();
  }
});

// Keyboard ESC to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && editModal.classList.contains('active')) {
    closeEditModal();
  }
});

// ==========================================================================
// 14. INITIALIZATION
// ==========================================================================
// Init Theme
initTheme();

// Init View Mode
if (currentView === 'kanban') {
  viewKanbanBtn.click();
} else {
  viewListBtn.click();
}

// Start Clock
updateRealtimeClock();
setInterval(updateRealtimeClock, 1000);

// Initial Render
renderAll();
