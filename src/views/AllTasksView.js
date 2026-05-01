import { getAllTasks } from '../store/taskStore.js';
import { TaskItem } from '../components/TaskItem.js';

export class AllTasksView {
  constructor() {
    this.el = null;
    this._tasks = [];
    this._filter = 'all';
    this._items = [];
    this._refreshHandler = () => this._loadAndRender();
  }

  render() {
    this.el = document.createElement('div');
    this.el.className = 'all-tasks-view';
    this.el.innerHTML = `
      <style>
        .all-tasks-view { padding: calc(var(--safe-top) + 16px) var(--spacing-md) var(--spacing-md); }
        .view-heading { font-size: 26px; font-weight: 700; margin-bottom: 16px; }
        .task-list { display: flex; flex-direction: column; gap: 8px; }
        .segment-wrap { margin-bottom: 14px; }
        .section-label { font-size: 12px; font-weight: 600; color: var(--color-text2); text-transform: uppercase; letter-spacing: 0.06em; margin: 16px 0 8px; }
      </style>
      <div class="view-heading">전체 할 일</div>
      <div class="segment-wrap">
        <div class="segment" id="filter-segment">
          <button class="segment__btn active" data-filter="all">전체</button>
          <button class="segment__btn" data-filter="active">진행 중</button>
          <button class="segment__btn" data-filter="done">완료</button>
        </div>
      </div>
      <div class="task-list" id="task-list"></div>
    `;

    this.el.querySelector('#filter-segment').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      this.el.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this._filter = btn.dataset.filter;
      this._renderList();
    });

    document.addEventListener('tasks:refresh', this._refreshHandler);
    return this.el;
  }

  async onActivate() {
    await this._loadAndRender();
  }

  async _loadAndRender() {
    this._tasks = await getAllTasks();
    this._tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    this._renderList();
  }

  _renderList() {
    this._items.forEach(i => i.destroy());
    this._items = [];

    const list = this.el.querySelector('#task-list');
    let tasks = this._tasks;

    if (this._filter === 'active') tasks = tasks.filter(t => !t.completed);
    if (this._filter === 'done')   tasks = tasks.filter(t => t.completed);

    if (!tasks.length) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📋</div>
          <div class="empty-state__title">할 일이 없어요</div>
          <div class="empty-state__desc">+ 버튼으로 새 할 일을 추가해보세요</div>
        </div>`;
      return;
    }

    list.innerHTML = '';
    tasks.forEach(task => {
      const item = new TaskItem(task);
      list.appendChild(item.render());
      this._items.push(item);
    });
  }

  destroy() {
    document.removeEventListener('tasks:refresh', this._refreshHandler);
    this._items.forEach(i => i.destroy());
  }
}
