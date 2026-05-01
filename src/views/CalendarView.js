import { getAllTasks, createTask } from '../store/taskStore.js';
import { TaskItem } from '../components/TaskItem.js';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export class CalendarView {
  constructor() {
    this.el = null;
    this._tasks = [];
    this._taskMap = {};
    this._selectedDate = null;
    this._year = new Date().getFullYear();
    this._month = new Date().getMonth();
    this._taskItems = [];
    this._gridBound = false;
    this._refreshHandler = () => this._loadAndRender();
  }

  render() {
    this.el = document.createElement('div');
    this.el.className = 'calendar-view';
    this.el.innerHTML = `
      <style>
        .calendar-view { padding: 16px var(--spacing-md) var(--spacing-md); }

        /* ── 월 네비게이션 ── */
        .cal-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .cal-nav__btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          font-size: 18px;
          color: var(--color-text2);
          display: flex; align-items: center; justify-content: center;
          transition: background var(--transition-fast);
        }
        .cal-nav__btn:active { background: var(--color-surface2); }
        .cal-nav__title { font-size: 18px; font-weight: 700; }

        /* ── 그리드 ── */
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          margin-bottom: 20px;
        }
        .cal-dow {
          text-align: center;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text2);
          padding: 6px 0;
          letter-spacing: 0.04em;
        }
        .cal-dow:first-child { color: var(--color-high); }
        .cal-dow:last-child  { color: var(--color-accent2); }

        .cal-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 6px 2px 4px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          position: relative;
          transition: background var(--transition-fast);
          min-height: 42px;
        }
        .cal-cell:active { background: var(--color-surface2); }
        .cal-cell.empty { pointer-events: none; }
        .cal-cell.today .cal-cell__day {
          background: var(--color-accent);
          color: var(--color-bg);
          border-radius: 50%;
          width: 26px; height: 26px;
          display: flex; align-items: center; justify-content: center;
        }
        .cal-cell.selected {
          background: rgba(0,229,195,0.12);
          outline: 1.5px solid var(--color-accent);
        }
        .cal-cell.sun .cal-cell__day { color: var(--color-high); }
        .cal-cell.sat .cal-cell__day { color: var(--color-accent2); }
        .cal-cell__day { font-size: 13px; font-weight: 500; line-height: 26px; }
        .cal-cell__dots {
          display: flex;
          gap: 2px;
          margin-top: 2px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .cal-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .cal-dot--high   { background: var(--color-high); }
        .cal-dot--medium { background: var(--color-medium); }
        .cal-dot--low    { background: var(--color-low); }
        .cal-dot--done   { background: var(--color-border); }

        /* ── 선택된 날짜 패널 ── */
        .cal-panel { animation: panelIn 200ms ease; }
        @keyframes panelIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .cal-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .cal-panel-title { font-size: 15px; font-weight: 700; }
        .cal-panel-add {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--color-accent);
          color: var(--color-bg);
          font-size: 13px;
          font-weight: 700;
          padding: 7px 14px;
          border-radius: 100px;
          min-height: 36px;
          transition: opacity var(--transition-fast);
        }
        .cal-panel-add:active { opacity: 0.8; }
        .cal-task-list { display: flex; flex-direction: column; gap: 8px; }

        /* ── 인라인 빠른 추가 ── */
        .cal-quick-add {
          background: var(--color-surface);
          border-radius: var(--radius-md);
          border: 1.5px solid var(--color-accent);
          padding: 12px;
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 10px;
        }
        .cal-quick-input {
          flex: 1;
          font-size: 14px;
          color: var(--color-text);
          caret-color: var(--color-accent);
        }
        .cal-quick-input::placeholder { color: var(--color-text2); }
        .cal-quick-save {
          background: var(--color-accent);
          color: var(--color-bg);
          font-size: 13px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: var(--radius-sm);
          min-height: 32px;
          white-space: nowrap;
          transition: opacity var(--transition-fast);
        }
        .cal-quick-save:disabled { opacity: 0.3; }
        .cal-quick-cancel {
          font-size: 18px;
          color: var(--color-text2);
          padding: 4px;
        }
      </style>

      <div class="cal-nav">
        <button class="cal-nav__btn" id="cal-prev">‹</button>
        <span class="cal-nav__title" id="cal-title"></span>
        <button class="cal-nav__btn" id="cal-next">›</button>
      </div>

      <div class="cal-grid" id="cal-grid"></div>

      <div id="cal-panel"></div>
    `;

    this._bindNavEvents();
    document.addEventListener('tasks:refresh', this._refreshHandler);
    return this.el;
  }

  async onActivate() {
    await this._loadAndRender();
    if (!this._gridBound) {
      this._bindGridClick();
      this._gridBound = true;
    }
  }

  async _loadAndRender() {
    this._tasks = await getAllTasks();
    this._buildTaskMap();
    this._renderGrid();
    if (this._selectedDate) this._renderPanel(this._selectedDate);
  }

  _buildTaskMap() {
    this._taskMap = {};
    this._tasks.forEach(task => {
      if (!task.dueDate) return;
      if (!this._taskMap[task.dueDate]) this._taskMap[task.dueDate] = [];
      this._taskMap[task.dueDate].push(task);
    });
  }

  _renderGrid() {
    const y = this._year, m = this._month;
    const title = this.el.querySelector('#cal-title');
    title.textContent = `${y}년 ${m + 1}월`;

    const grid = this.el.querySelector('#cal-grid');
    const todayStr = new Date().toISOString().slice(0, 10);

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    let html = DOW.map(d => `<div class="cal-dow">${d}</div>`).join('');

    for (let i = 0; i < firstDay; i++) {
      html += `<div class="cal-cell empty"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateStr(y, m, d);
      const dow = (firstDay + d - 1) % 7;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === this._selectedDate;
      const tasks = this._taskMap[dateStr] || [];

      const dots = tasks.slice(0, 3).map(t =>
        `<span class="cal-dot cal-dot--${t.completed ? 'done' : t.priority}"></span>`
      ).join('');

      const cls = [
        'cal-cell',
        dow === 0 ? 'sun' : dow === 6 ? 'sat' : '',
        isToday ? 'today' : '',
        isSelected ? 'selected' : '',
      ].filter(Boolean).join(' ');

      html += `
        <div class="${cls}" data-date="${dateStr}">
          <span class="cal-cell__day">${d}</span>
          ${tasks.length ? `<div class="cal-cell__dots">${dots}</div>` : ''}
        </div>`;
    }

    grid.innerHTML = html;
  }

  _bindGridClick() {
    const grid = this.el.querySelector('#cal-grid');
    grid.addEventListener('click', (e) => {
      const cell = e.target.closest('[data-date]');
      if (!cell) return;
      const date = cell.dataset.date;
      if (this._selectedDate === date) {
        this._selectedDate = null;
        this._renderPanel(null);
        grid.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
      } else {
        this._selectedDate = date;
        grid.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        cell.classList.add('selected');
        this._renderPanel(date);
      }
    });
  }

  _renderPanel(dateStr) {
    this._taskItems.forEach(i => i.destroy());
    this._taskItems = [];

    const panel = this.el.querySelector('#cal-panel');
    if (!dateStr) { panel.innerHTML = ''; return; }

    const tasks = this._taskMap[dateStr] || [];
    const d = parseDate(dateStr);
    const label = `${d.getMonth() + 1}월 ${d.getDate()}일 ${DOW[d.getDay()]}요일`;

    panel.innerHTML = `
      <div class="cal-panel">
        <div class="cal-panel-header">
          <span class="cal-panel-title">${label}</span>
          <button class="cal-panel-add" id="cal-add-btn">+ 추가</button>
        </div>
        <div id="cal-quick-form" style="display:none">
          <div class="cal-quick-add">
            <input class="cal-quick-input" id="cal-quick-input" placeholder="할 일 입력 후 저장..." autocomplete="off" />
            <button class="cal-quick-save" id="cal-quick-save" disabled>저장</button>
            <button class="cal-quick-cancel" id="cal-quick-cancel">✕</button>
          </div>
        </div>
        <div class="cal-task-list" id="cal-task-list"></div>
      </div>`;

    this._bindPanelEvents(dateStr);
    this._renderPanelTasks(tasks);
  }

  _renderPanelTasks(tasks) {
    const list = this.el.querySelector('#cal-task-list');
    if (!list) return;
    this._taskItems.forEach(i => i.destroy());
    this._taskItems = [];

    if (!tasks.length) {
      list.innerHTML = `
        <div class="empty-state" style="min-height:120px">
          <div class="empty-state__icon">📅</div>
          <div class="empty-state__desc">이 날의 할 일이 없어요</div>
        </div>`;
      return;
    }

    list.innerHTML = '';
    tasks.forEach(task => {
      const item = new TaskItem(task);
      list.appendChild(item.render());
      this._taskItems.push(item);
    });
  }

  _bindPanelEvents(dateStr) {
    const addBtn = this.el.querySelector('#cal-add-btn');
    const form = this.el.querySelector('#cal-quick-form');
    const input = this.el.querySelector('#cal-quick-input');
    const saveBtn = this.el.querySelector('#cal-quick-save');
    const cancelBtn = this.el.querySelector('#cal-quick-cancel');

    addBtn.addEventListener('click', () => {
      form.style.display = '';
      addBtn.style.display = 'none';
      input.focus();
    });

    cancelBtn.addEventListener('click', () => {
      form.style.display = 'none';
      addBtn.style.display = '';
      input.value = '';
      saveBtn.disabled = true;
    });

    input.addEventListener('input', () => {
      saveBtn.disabled = !input.value.trim();
    });

    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && !saveBtn.disabled) {
        e.preventDefault();
        await this._quickSave(dateStr, input.value.trim());
        input.value = '';
        saveBtn.disabled = true;
        form.style.display = 'none';
        addBtn.style.display = '';
      }
    });

    saveBtn.addEventListener('click', async () => {
      const title = input.value.trim();
      if (!title) return;
      await this._quickSave(dateStr, title);
      input.value = '';
      saveBtn.disabled = true;
      form.style.display = 'none';
      addBtn.style.display = '';
    });
  }

  async _quickSave(dateStr, title) {
    const task = await createTask({ title, dueDate: dateStr });
    document.dispatchEvent(new CustomEvent('task:created', { detail: { task } }));
    // 로컬에서 즉시 업데이트
    if (!this._taskMap[dateStr]) this._taskMap[dateStr] = [];
    this._taskMap[dateStr].push(task);
    this._renderGrid();
    this._renderPanel(dateStr);
  }

  _bindNavEvents() {
    this.el.querySelector('#cal-prev').addEventListener('click', () => {
      this._month--;
      if (this._month < 0) { this._month = 11; this._year--; }
      this._selectedDate = null;
      this._renderGrid();
      this.el.querySelector('#cal-panel').innerHTML = '';
    });

    this.el.querySelector('#cal-next').addEventListener('click', () => {
      this._month++;
      if (this._month > 11) { this._month = 0; this._year++; }
      this._selectedDate = null;
      this._renderGrid();
      this.el.querySelector('#cal-panel').innerHTML = '';
    });
  }

  destroy() {
    document.removeEventListener('tasks:refresh', this._refreshHandler);
    this._taskItems.forEach(i => i.destroy());
  }
}
