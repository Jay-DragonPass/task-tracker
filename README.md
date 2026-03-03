# Task Tracker

A minimal, efficient web-based task tracker built with vanilla JavaScript, HTML, and CSS.

## Features

✨ **Simple & Fast** - Lightweight single-page application with instant task entry

📊 **Smart Prioritization** - Tasks automatically sorted by importance and urgency

💾 **Persistent Storage** - All tasks saved locally in your browser

📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

✅ **Task Management** - Mark tasks complete, delete tasks, categorize by size

## Task Attributes

### Size
- **S** (Small) - Quick tasks
- **M** (Medium) - Standard tasks  
- **L** (Large) - Complex tasks

### Urgency & Importance
Toggle each task's urgency and importance level independently.

## Priority System

Tasks are sorted in this strict order:

1. **High Importance + High Urgency** (🔴 Red border)
2. **High Importance + Low Urgency** (🟠 Orange border)
3. **Low Importance + High Urgency** (🟡 Yellow border)
4. **Low Importance + Low Urgency** (🟢 Green border)

Within each priority level, tasks are sorted by size: **S → M → L**

## How to Use

1. **Add a Task**
   - Type task title
   - Select size (S, M, or L)
   - Toggle urgency and importance
   - Click "Add Task" or press Enter

2. **Manage Tasks**
   - Check the checkbox to mark tasks complete
   - Click "Delete" to remove a task
   - Completed tasks move to the "Done" section

3. **View Completed Tasks**
   - Click the "Done" section header to expand/collapse
   - Shows count of completed tasks

## Local Storage

All tasks are automatically saved to your browser's local storage. Your task list persists even after closing the browser.

To clear all tasks:
```javascript
localStorage.removeItem('tasks');
location.reload();
```

## File Structure

```
task-tracker/
├── index.html      # Main HTML file
├── styles.css      # All styling
├── app.js          # Application logic
└── README.md       # This file
```

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid/Flexbox
- Local Storage API

## No Dependencies

This project uses zero external dependencies - just vanilla JavaScript, HTML, and CSS!

## Future Enhancements

Possible features for future versions:
- [ ] Task categories/tags
- [ ] Due dates
- [ ] Time estimates
- [ ] Dark mode
- [ ] Export/import tasks
- [ ] Task filtering options

---

Built with ❤️ for productivity
