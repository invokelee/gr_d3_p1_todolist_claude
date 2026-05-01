import { createTask } from '../store/taskStore.js';

function dateStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function nextMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export class QuickAddSheet {
  constructor() {
    this.el = null;
    this.isOpen = false;
    this._selectedDate = null;
    this._selectedPriority = 'medium';
    this._selectedWorkspace = 'personal';
    this._startY = 0;
    this._currentY = 0;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <style>
        .quick-add-sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-surface);
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          border-top: 1px solid var(--color-border);
          padding: 12px var(--spacing-md) var(--spacing-md);
          padding-bottom: calc(var(--spacing-md) + var(--safe-bottom));
          z-index: 100;
          transform: translateY(100%);
          transition: transform var(--transition-slow);
          will-change: transform;
        }
        .quick-add-sheet.open {
          transform: translateY(0);
        }
        .sheet-handle {
          width: 36px;
          height: 4px;
          background: var(--color-border);
          border-radius: 2px;
          margin: 0 auto 16px;
        }
        .sheet-title-input {
          width: 100%;
          font-size: 18px;
          font-weight: 500;
          color: var(--color-text);
          background: transparent;
          border: none;
          outline: none;
          padding: 0 0 12px;
          border-bottom: 1px solid var(--color-border);
          margin-bottom: 14px;
          caret-color: var(--color-accent);
        }
        .sheet-title-input::placeholder { color: var(--color-text2); }

        .sheet-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .chip {
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid var(--color-border);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text2);
          background: var(--color-surface2);
          transition: all var(--transition-fast);
          min-height: 36px;
          display: flex;
          align-items: center;
        }
        .chip.active {
          border-color: var(--color-accent);
          color: var(--color-accent);
          background: rgba(0,229,195,0.1);
        }
        .chip--high.active   { border-color: var(--color-high);   color: var(--color-high);   background: rgba(255,107,107,0.1); }
        .chip--medium.active { border-color: var(--color-medium); color: var(--color-medium); background: rgba(255,171,0,0.1); }
        .chip--low.active    { border-color: var(--color-low);    color: var(--color-low);    background: rgba(136,136,164,0.1); }
        .chip--work.active   { border-color: var(--color-accent2); color: var(--color-accent2); background: rgba(124,110,255,0.1); }

        .sheet-save-btn {
          width: 100%;
          background: var(--color-accent);
          color: var(--color-bg);
          font-size: 16px;
          font-weight: 700;
          padding: 14px;
          border-radius: var(--radius-md);
          margin-top: 8px;
          min-height: 50px;
          transition: opacity var(--transition-fast), transform var(--transition-fast);
        }
        .sheet-save-btn:active { opacity: 0.8; transform: scale(0.98); }
        .sheet-save-btn:disabled { opacity: 0.35; }
        .sheet-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-text2);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
      </style>
      <div class="quick-add-sheet" id="quick-add-sheet">
        <div class="sheet-handle"></div>
        <input class="sheet-title-input" id="sheet-title" placeholder="할 일을 입력하세요..." autocomplete="off" />
        <div class="sheet-label">마감일</div>
        <div class="sheet-row" id="date-chips">
          <button class="chip" data-date="today">오늘</button>
          <button class="chip" data-date="tomorrow">내일</button>
          <button class="chip" data-date="nextweek">다음 주</button>
        </div>
        <div class="sheet-label">우선순위</div>
        <div class="sheet-row" id="priority-chips">
          <button class="chip chip--high"   data-priority="high">H 높음</button>
          <button class="chip chip--medium active" data-priority="medium">M 보통</button>
          <button class="chip chip--low"    data-priority="low">L 낮음</button>
        </div>
        <div class="sheet-label">워크스페이스</div>
        <div class="sheet-row" id="workspace-chips">
          <button class="chip active" data-workspace="personal">Personal</button>
          <button class="chip chip--work" data-workspace="work">Work</button>
        </div>
        <button class="sheet-save-btn" id="sheet-save" disabled>저장</button>
      </div>
    `;

    this.el = wrapper.querySelector('#quick-add-sheet');
    this._titleInput = wrapper.querySelector('#sheet-title');
    this._saveBtn = wrapper.querySelector('#sheet-save');

    this._bindEvents();
    this._setupKeyboardAdjust();
    this._setupSwipeDown();

    return wrapper;
  }

  _bindEvents() {
    this._titleInput.addEventListener('input', () => {
      this._saveBtn.disabled = !this._titleInput.value.trim();
    });

    this._saveBtn.addEventListener('click', () => this._save());

    this.el.querySelectorAll('[data-date]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.el.querySelectorAll('[data-date]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const v = btn.dataset.date;
        this._selectedDate = v === 'today' ? dateStr(0) : v === 'tomorrow' ? dateStr(1) : nextMonday();
      });
    });

    this.el.querySelectorAll('[data-priority]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.el.querySelectorAll('[data-priority]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._selectedPriority = btn.dataset.priority;
      });
    });

    this.el.querySelectorAll('[data-workspace]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.el.querySelectorAll('[data-workspace]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._selectedWorkspace = btn.dataset.workspace;
      });
    });
  }

  _setupKeyboardAdjust() {
    if (!window.visualViewport) return;
    window.visualViewport.addEventListener('resize', () => {
      if (!this.isOpen) return;
      const vv = window.visualViewport;
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      this.el.style.transform = `translateY(-${Math.max(0, offset)}px)`;
    });
  }

  _setupSwipeDown() {
    let startY = 0;
    const handle = this.el.querySelector('.sheet-handle');

    const onTouchStart = (e) => { startY = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      const dy = e.changedTouches[0].clientY - startY;
      if (dy > 60) this.close();
    };

    handle.addEventListener('touchstart', onTouchStart, { passive: true });
    handle.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  open(prefill = {}) {
    this.isOpen = true;
    if (prefill.title) this._titleInput.value = prefill.title;
    this._saveBtn.disabled = !this._titleInput.value.trim();
    this.el.classList.add('open');
    document.dispatchEvent(new CustomEvent('sheet:open'));
    requestAnimationFrame(() => {
      setTimeout(() => this._titleInput.focus(), 50);
    });
  }

  close() {
    this.isOpen = false;
    this.el.style.transform = '';
    this.el.classList.remove('open');
    this._titleInput.value = '';
    this._saveBtn.disabled = true;
    this._selectedDate = null;
    this._titleInput.blur();
    document.dispatchEvent(new CustomEvent('sheet:close'));
  }

  async _save() {
    const title = this._titleInput.value.trim();
    if (!title) return;
    try {
      const task = await createTask({
        title,
        priority: this._selectedPriority,
        workspace: this._selectedWorkspace,
        dueDate: this._selectedDate,
      });
      document.dispatchEvent(new CustomEvent('task:created', { detail: { task } }));
      this.close();
    } catch (e) {
      console.error('Failed to create task:', e);
    }
  }
}
