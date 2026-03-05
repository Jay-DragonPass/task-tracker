// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = [];
        this.storageKey = 'tasks';
        this.loadTasks();
        this.initializeUI();
        this.setupEventListeners();
        this.setupBulkUpload();
    }

    // ==================== Storage ====================
    loadTasks() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.tasks = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.tasks = [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Failed to save tasks:', error);
        }
    }

    // ==================== Task Operations ====================
    createTask(title, size, urgency, importance) {
        const task = {
            id: Date.now(),
            title: title.trim(),
            size,
            urgency,
            importance,
            status: 'todo',
            createdAt: new Date().toISOString()
        };
        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }

    toggleTaskStatus(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.status = task.status === 'todo' ? 'done' : 'todo';
            this.saveTasks();
            
            // Show celebration if task was completed
            if (task.status === 'done') {
                this.celebrate();
            }
        }
    }

    // ==================== Bulk Import ====================
    bulkCreateTasks(taskTitles, size, urgency, importance) {
        const validTitles = taskTitles
            .map(title => title.trim())
            .filter(title => title.length > 0);

        if (validTitles.length === 0) {
            return {
                success: false,
                message: '❌ No valid tasks to import. Please enter at least one task.',
                count: 0
            };
        }

        let createdCount = 0;
        validTitles.forEach(title => {
            this.createTask(title, size, urgency, importance);
            createdCount++;
        });

        return {
            success: true,
            message: `✅ Successfully imported ${createdCount} task${createdCount !== 1 ? 's' : ''}!`,
            count: createdCount
        };
    }

    // ==================== Celebration ====================
    celebrate() {
        const messages = [
            'Well done! 🎉',
            'Awesome! 💪',
            'Great job! ⭐',
            'You rock! 🌟',
            'Excellent! 🚀',
            'Keep it up! 🔥',
            'Fantastic! ✨',
            'Amazing! 🎊'
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.showSpeechBubble(randomMessage);
        this.animateCompanion();
    }

    showSpeechBubble(message) {
        const bubble = document.getElementById('speechBubble');
        const content = bubble.querySelector('.bubble-content');
        content.textContent = message;
        
        bubble.classList.remove('show');
        // Trigger reflow to restart animation
        void bubble.offsetWidth;
        bubble.classList.add('show');

        setTimeout(() => {
            bubble.classList.remove('show');
        }, 2500);
    }

    animateCompanion() {
        const companion = document.getElementById('companion');
        companion.style.animation = 'none';
        // Trigger reflow
        void companion.offsetWidth;
        companion.style.animation = 'float 3s ease-in-out infinite';
    }

    // ==================== Sorting & Filtering ====================
    getPriorityCategory(urgency, importance) {
        if (importance === 'high' && urgency === 'high') return 1;
        if (importance === 'high' && urgency === 'low') return 2;
        if (importance === 'low' && urgency === 'high') return 3;
        return 4;
    }

    getSizeOrder(size) {
        const sizeMap = { 'S': 0, 'M': 1, 'L': 2 };
        return sizeMap[size] || 3;
    }

    getSortedTasksByPriority(status, priority) {
        return this.tasks
            .filter(task => task.status === status && this.getPriorityCategory(task.urgency, task.importance) === priority)
            .sort((a, b) => {
                const sizeA = this.getSizeOrder(a.size);
                const sizeB = this.getSizeOrder(b.size);
                return sizeA - sizeB;
            });
    }

    getSortedTasks(status) {
        return this.tasks
            .filter(task => task.status === status)
            .sort((a, b) => {
                const priorityA = this.getPriorityCategory(a.urgency, a.importance);
                const priorityB = this.getPriorityCategory(b.urgency, b.importance);
                
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                
                const sizeA = this.getSizeOrder(a.size);
                const sizeB = this.getSizeOrder(b.size);
                
                return sizeA - sizeB;
            });
    }

    // ==================== UI Rendering ====================
    renderTasks() {
        for (let priority = 1; priority <= 4; priority++) {
            const tasks = this.getSortedTasksByPriority('todo', priority);
            this.renderTaskList(`priority${priority}Tasks`, tasks);
        }

        const doneTasks = this.getSortedTasks('done');
        this.renderTaskList('doneTasks', doneTasks);
        this.updateDoneCount(doneTasks.length);

        const allTodoTasks = this.getSortedTasks('todo');
        this.updateEmptyState(allTodoTasks.length === 0 && doneTasks.length === 0);
    }

    renderTaskList(containerId, tasks) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (tasks.length === 0) {
            return;
        }

        tasks.forEach(task => {
            const taskEl = this.createTaskElement(task);
            container.appendChild(taskEl);
        });
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        const priorityClass = `priority-${this.getPriorityCategory(task.urgency, task.importance)}`;
        
        div.className = `task-item ${priorityClass}`;
        if (task.status === 'done') {
            div.classList.add('completed');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.status === 'done';
        checkbox.addEventListener('change', () => {
            this.toggleTaskStatus(task.id);
            this.renderTasks();
        });

        const content = document.createElement('div');
        content.className = 'task-content';

        const title = document.createElement('div');
        title.className = 'task-title';
        title.textContent = task.title;

        const meta = document.createElement('div');
        meta.className = 'task-meta';

        const sizeBadge = document.createElement('span');
        sizeBadge.className = 'badge size';
        sizeBadge.textContent = task.size;

        const urgencyBadge = document.createElement('span');
        urgencyBadge.className = `badge urgency-${task.urgency}`;
        urgencyBadge.textContent = `Urgency: ${this.capitalize(task.urgency)}`;

        const importanceBadge = document.createElement('span');
        importanceBadge.className = `badge importance-${task.importance}`;
        importanceBadge.textContent = `Importance: ${this.capitalize(task.importance)}`;

        meta.appendChild(sizeBadge);
        meta.appendChild(urgencyBadge);
        meta.appendChild(importanceBadge);

        content.appendChild(title);
        content.appendChild(meta);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.type = 'button';
        deleteBtn.addEventListener('click', () => {
            this.deleteTask(task.id);
            this.renderTasks();
        });

        div.appendChild(checkbox);
        div.appendChild(content);
        div.appendChild(deleteBtn);

        return div;
    }

    updateDoneCount(count) {
        const doneCountEl = document.getElementById('doneCount');
        doneCountEl.textContent = count;
    }

    updateEmptyState(show) {
        const emptyState = document.getElementById('emptyState');
        if (show && this.tasks.length === 0) {
            emptyState.classList.add('show');
        } else {
            emptyState.classList.remove('show');
        }
    }

    // ==================== Utility ====================
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ==================== Event Listeners ====================
    initializeUI() {
        this.updateToggleButton('urgencyToggle', 'low');
        this.updateToggleButton('importanceToggle', 'low');
        
        const doneToggle = document.getElementById('doneToggle');
        const doneTasks = document.getElementById('doneTasks');
        
        doneToggle.addEventListener('click', (e) => {
            e.preventDefault();
            doneToggle.classList.toggle('active');
            doneTasks.classList.toggle('collapsed');
        });

        // Companion click animation
        const companion = document.getElementById('companion');
        companion.addEventListener('click', () => {
            this.celebrate();
        });

        this.renderTasks();
    }

    setupEventListeners() {
        const form = document.getElementById('taskForm');
        const urgencyToggle = document.getElementById('urgencyToggle');
        const importanceToggle = document.getElementById('importanceToggle');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTask();
        });

        urgencyToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleUrgency();
        });

        importanceToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleImportance();
        });
    }

    setupBulkUpload() {
        const toggleBtn = document.getElementById('toggleBulkBtn');
        const bulkPanel = document.getElementById('bulkUploadPanel');
        const importBtn = document.getElementById('importBtn');
        const cancelBtn = document.getElementById('cancelBulkBtn');
        const bulkFile = document.getElementById('bulkFile');
        const bulkTextarea = document.getElementById('bulkTextarea');

        // Toggle bulk panel
        toggleBtn.addEventListener('click', () => {
            bulkPanel.classList.toggle('show');
            if (bulkPanel.classList.contains('show')) {
                bulkTextarea.focus();
            }
        });

        // Cancel bulk import
        cancelBtn.addEventListener('click', () => {
            bulkPanel.classList.remove('show');
            this.clearBulkForm();
        });

        // Handle file upload
        bulkFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    bulkTextarea.value = event.target.result;
                };
                reader.readAsText(file);
            }
        });

        // Handle import
        importBtn.addEventListener('click', () => {
            this.handleBulkImport();
        });

        // Allow Enter+Shift to submit bulk import
        bulkTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                this.handleBulkImport();
            }
        });
    }

    handleBulkImport() {
        const bulkTextarea = document.getElementById('bulkTextarea');
        const bulkSize = document.getElementById('bulkSize').value;
        const bulkUrgency = document.getElementById('bulkUrgency').value;
        const bulkImportance = document.getElementById('bulkImportance').value;
        const statusEl = document.getElementById('importStatus');

        const taskLines = bulkTextarea.value.split('\n');
        const result = this.bulkCreateTasks(taskLines, bulkSize, bulkUrgency, bulkImportance);

        // Show status message
        statusEl.textContent = result.message;
        statusEl.classList.remove('error', 'success');
        statusEl.classList.add(result.success ? 'success' : 'error');

        if (result.success) {
            // Clear form after successful import
            setTimeout(() => {
                this.clearBulkForm();
                document.getElementById('bulkUploadPanel').classList.remove('show');
            }, 1500);

            this.renderTasks();
        }
    }

    clearBulkForm() {
        document.getElementById('bulkTextarea').value = '';
        document.getElementById('bulkFile').value = '';
        document.getElementById('bulkSize').value = 'M';
        document.getElementById('bulkUrgency').value = 'low';
        document.getElementById('bulkImportance').value = 'low';
        document.getElementById('importStatus').textContent = '';
        document.getElementById('importStatus').classList.remove('success', 'error');
    }

    toggleUrgency() {
        const button = document.getElementById('urgencyToggle');
        const newState = button.dataset.state === 'high' ? 'low' : 'high';
        this.updateToggleButton('urgencyToggle', newState);
    }

    toggleImportance() {
        const button = document.getElementById('importanceToggle');
        const newState = button.dataset.state === 'high' ? 'low' : 'high';
        this.updateToggleButton('importanceToggle', newState);
    }

    updateToggleButton(buttonId, state) {
        const button = document.getElementById(buttonId);
        button.dataset.state = state;
        const label = button.querySelector('.toggle-label');
        label.textContent = this.capitalize(state);
    }

    handleAddTask() {
        const titleInput = document.getElementById('taskTitle');
        const sizeSelect = document.getElementById('taskSize');
        const urgencyToggle = document.getElementById('urgencyToggle');
        const importanceToggle = document.getElementById('importanceToggle');

        const title = titleInput.value.trim();
        if (!title) {
            console.warn('Task title is empty');
            return;
        }

        this.createTask(
            title,
            sizeSelect.value,
            urgencyToggle.dataset.state,
            importanceToggle.dataset.state
        );

        titleInput.value = '';
        sizeSelect.value = 'M';
        this.updateToggleButton('urgencyToggle', 'low');
        this.updateToggleButton('importanceToggle', 'low');

        this.renderTasks();
        titleInput.focus();
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing TaskManager...');
    new TaskManager();
});
