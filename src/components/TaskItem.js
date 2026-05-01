import { SwipeGesture } from '../services/swipeGesture.js';
import { completeTask, deleteTask, updateTask } from '../store/taskStore.js';

const PRIORITY_COLOR = { high: 'var(--color-high)', medium: 'var(--color-medium)', low: 'var(--color-low)' };

function formatTime(dueDate, dueTime) {
  if (!dueDate && !dueTime) return '';
  if (dueTime) return dueTime;
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate === today) return '오늘';
  const d = new Date(dueDate + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export class TaskItem {
  constructor(task) {
    this.task = task;
    this.el = null;
    this._swipe = null;
  }

  render() {
    const { title, priority, workspace, dueDate, dueTime, completed } = this.task;
    const timeLabel = formatTime(dueDate, dueTime);
    const priColor = PRIORITY_COLOR[priority] || PRIORITY_COLOR.medium;

    this.el = document.createElement('div');
    this.el.className = `task-item${completed ? ' task-item--done' : ''}`;
    this.el.innerHTML = `
      <style>
        .task-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px var(--spacing-md);
          background: var(--color-surface);
          border-radius: var(--radius-md);
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: opacity var(--transition-normal);
        }
        .task-item--done { opacity: 0.45; }
        .task-item__bar {
          width: 3px;
          min-height: 36px;
          border-radius: 2px;
          flex-shrink: 0;
          align-self: stretch;
        }
        .task-item__body { flex: 1; min-width: 0; }
        .task-item__title {
          font-size: 15px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: text-decoration var(--transition-fast);
        }
        .task-item--done .task-item__title { text-decoration: line-through; }
        .task-item__meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 3px;
        }
        .task-item__time { font-size: 12px; color: var(--color-text2); }
        .task-item__check {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--color-accent);
          font-size: 14px;
          transition: border-color var(--transition-fast), background var(--transition-fast);
        }
        .task-item--done .task-item__check {
          background: var(--color-accent);
          border-color: var(--color-accent);
        }
      </style>
      <div class="task-item__bar" style="background:${priColor}"></div>
      <div class="task-item__body">
        <div class="task-item__title">${title}</div>
        <div class="task-item__meta">
          ${timeLabel ? `<span class="task-item__time">⏰ ${timeLabel}</span>` : ''}
          <span class="badge badge--${workspace}">${workspace === 'work' ? 'Work' : 'Personal'}</span>
        </div>
      </div>
      <div class="task-item__check" role="checkbox" aria-checked="${completed}">${completed ? '✓' : ''}</div>
    `;

    this._bindEvents();
    return this.el;
  }

  _bindEvents() {
    const check = this.el.querySelector('.task-item__check');

    check.addEventListener('click', async (e) => {
      e.stopPropagation();
      await this._toggleComplete();
    });

    this.el.addEventListener('click', (e) => {
      if (e.target.closest('.task-item__check')) return;
      document.dispatchEvent(new CustomEvent('task:open', { detail: { taskId: this.task.id } }));
    });

    this._swipe = new SwipeGesture(this.el, {
      onComplete: () => this._toggleComplete(),
      onDelete:   () => this._delete(),
      onPostpone: () => this._postpone(),
    });
  }

  async _toggleComplete() {
    const done = !this.task.completed;
    if (done) {
      await completeTask(this.task.id);
    } else {
      await updateTask(this.task.id, { completed: false, completedAt: null });
    }
    document.dispatchEvent(new CustomEvent('task:updated', { detail: { taskId: this.task.id } }));
  }

  async _delete() {
    await deleteTask(this.task.id);
    document.dispatchEvent(new CustomEvent('task:deleted', { detail: { taskId: this.task.id } }));
  }

  async _postpone() {
    const d = new Date(this.task.dueDate || new Date());
    d.setDate(d.getDate() + 1);
    await updateTask(this.task.id, { dueDate: d.toISOString().slice(0, 10) });
    document.dispatchEvent(new CustomEvent('task:updated', { detail: { taskId: this.task.id } }));
  }

  destroy() {
    this._swipe?.destroy();
  }
}
