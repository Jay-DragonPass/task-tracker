// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = [];
        this.storageKey = 'tasks';
        this.loadTasks();
        this.initializeUI();
        this.setupEventListeners();
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
        }
    }

    // ==================== Sorting & Filtering ====================
    getPriorityCategory(urgency, importance) {
        // Priority Categories in strict order:
        // 1. High Importance + High Urgency
        // 2. High Importance + Low Urgency
        // 3. Low Importance + High Urgency
        // 4. Low Importance + Low Urgency
        
        if (importance === 'high' && urgency === 'high') return 1;
        if (importance === 'high' && urgency === 'low') return 2;
        if (importance === 'low' && urgency === 'high') return 3;
        return 4; // low importance + low urgency
    }

    getSizeOrder(size) {
        // S first, M second, L last
        const sizeMap = { 'S': 0, 'M': 1, 'L': 2 };
        return sizeMap[size] || 3;
    }

    getSortedTasksByPriority(status, priority) {
        return this.tasks
            .filter(task => task.status === status && this.getPriorityCategory(task.urgency, task.importance) === priority)
            .sort((a, b) => {
                // Sort by size order within priority
                const sizeA = this.getSizeOrder(a.size);
                const sizeB = this.getSizeOrder(b.size);
                return sizeA - sizeB;
            });
    }

    getSortedTasks(status) {
        return this.tasks
            .filter(task => task.status === status)
            .sort((a, b) => {
                // First sort by priority category
                const priorityA = this.getPriorityCategory(a.urgency, a.importance);
                const priorityB = this.getPriorityCategory(b.urgency, b.importance);
                
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                
                // Then sort by size order
                const sizeA = this.getSizeOrder(a.size);
                const sizeB = this.getSizeOrder(b.size);
                
                return sizeA - sizeB;
            });
    }

    // ==================== UI Rendering ====================
    renderTasks() {
        // Render todo tasks by priority
        for (let priority = 1; priority <= 4; priority++) {
            const tasks = this.getSortedTasksByPriority('todo', priority);
            this.renderTaskList(`priority${priority}Tasks`, tasks);
        }

        // Render done tasks
        const doneTasks = this.getSortedTasks('done');
        this.renderTaskList('doneTasks', doneTasks);
        this.updateDoneCount(doneTasks.length);

        // Update empty state
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
        // Set up toggle buttons initial state
        document.getElementById('urgencyToggle').dataset.state = 'low';
        document.getElementById('importanceToggle').dataset.state = 'low';
        
        // Set up done section toggle
        const doneToggle = document.getElementById('doneToggle');
        const doneTasks = document.getElementById('doneTasks');
        
        doneToggle.addEventListener('click', () => {
            doneToggle.classList.toggle('active');
            doneTasks.classList.toggle('collapsed');
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
            this.toggleButtonState(urgencyToggle);
        });

        importanceToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleButtonState(importanceToggle);
        });
    }

    toggleButtonState(button) {
        const currentState = button.dataset.state;
        const newState = currentState === 'high' ? 'low' : 'high';
        button.dataset.state = newState;
        button.querySelector('.toggle-label').textContent = this.capitalize(newState);
    }

    handleAddTask() {
        const titleInput = document.getElementById('taskTitle');
        const sizeSelect = document.getElementById('taskSize');
        const urgencyToggle = document.getElementById('urgencyToggle');
        const importanceToggle = document.getElementById('importanceToggle');

        const title = titleInput.value.trim();
        if (!title) return;

        this.createTask(
            title,
            sizeSelect.value,
            urgencyToggle.dataset.state,
            importanceToggle.dataset.state
        );

        // Reset form
        titleInput.value = '';
        sizeSelect.value = 'M';
        urgencyToggle.dataset.state = 'low';
        urgencyToggle.querySelector('.toggle-label').textContent = 'Low';
        importanceToggle.dataset.state = 'low';
        importanceToggle.querySelector('.toggle-label').textContent = 'Low';

        this.renderTasks();
        titleInput.focus();
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
