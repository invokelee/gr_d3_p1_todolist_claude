import { getTodayTasks } from '../store/taskStore.js';
import { TaskItem } from '../components/TaskItem.js';

function todayLabel() {
  const d = new Date();
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}요일`;
}

export class TodayView {
  constructor() {
    this.el = null;
    this._tasks = [];
    this._filter = 'all';
    this._items = [];
    this._refreshHandler = () => this._loadAndRender();
  }

  render() {
    this.el = document.createElement('div');
    this.el.className = 'today-view';
    this.el.innerHTML = `
      <style>
        .today-view { padding: 16px var(--spacing-md) var(--spacing-md); }
        .today-header { margin-bottom: 16px; }
        .today-date { font-size: 13px; color: var(--color-text2); margin-bottom: 2px; }
        .today-heading { font-size: 26px; font-weight: 700; }
        .today-progress { margin-bottom: 16px; }
        .today-progress-text { display: flex; justify-content: space-between; font-size: 12px; color: var(--color-text2); margin-bottom: 6px; }
        .task-list { display: flex; flex-direction: column; gap: 8px; }
        .segment-wrap { margin-bottom: 14px; }
      </style>
      <div class="today-header">
        <div class="today-date">${todayLabel()}</div>
        <div class="today-heading">오늘의 할 일</div>
      </div>
      <div class="today-progress">
        <div class="today-progress-text">
          <span id="progress-label">0 / 0 완료</span>
          <span id="progress-pct">0%</span>
        </div>
        <div class="progress-bar"><div class="progress-bar__fill" id="progress-fill" style="width:0%"></div></div>
      </div>
      <div class="segment-wrap">
        <div class="segment" id="ws-segment">
          <button class="segment__btn active" data-ws="all">전체</button>
          <button class="segment__btn" data-ws="personal">Personal</button>
          <button class="segment__btn" data-ws="work">Work</button>
        </div>
      </div>
      <div class="task-list" id="task-list"></div>
    `;

    this.el.querySelector('#ws-segment').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ws]');
      if (!btn) return;
      this.el.querySelectorAll('[data-ws]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this._filter = btn.dataset.ws;
      this._renderList();
    });

    document.addEventListener('tasks:refresh', this._refreshHandler);
    return this.el;
  }

  async onActivate() {
    await this._loadAndRender();
  }

  async _loadAndRender() {
    this._tasks = await getTodayTasks();
    this._renderProgress();
    this._renderList();
  }

  _renderProgress() {
    const total = this._tasks.length;
    const done = this._tasks.filter(t => t.completed).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    this.el.querySelector('#progress-label').textContent = `${done} / ${total} 완료`;
    this.el.querySelector('#progress-pct').textContent = `${pct}%`;
    this.el.querySelector('#progress-fill').style.width = `${pct}%`;
  }

  _renderList() {
    this._items.forEach(item => item.destroy());
    this._items = [];

    const list = this.el.querySelector('#task-list');
    let tasks = this._tasks;
    if (this._filter !== 'all') {
      tasks = tasks.filter(t => t.workspace === this._filter);
    }

    if (!tasks.length) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">✅</div>
          <div class="empty-state__title">오늘 할 일이 없어요</div>
          <div class="empty-state__desc">+ 버튼을 눌러 새 할 일을 추가해보세요</div>
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
