const TABS = [
  { id: 'today',    icon: '🏠', label: '오늘' },
  { id: 'tasks',    icon: '📋', label: '전체' },
  { id: 'add',      icon: '+',  label: '',     isAdd: true },
  { id: 'calendar', icon: '📅', label: '달력' },
  { id: 'flash',    icon: '💡', label: '메모' },
  { id: 'settings', icon: '⚙️', label: '설정' },
];

export class BottomNav {
  constructor() {
    this.activeTab = 'today';
    this.el = null;
  }

  render() {
    this.el = document.createElement('nav');
    this.el.className = 'bottom-nav safe-bottom';
    this.el.innerHTML = this._html();
    this._bindEvents();
    return this.el;
  }

  _html() {
    return `
      <style>
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          background: rgba(20, 20, 28, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid var(--color-border);
          height: calc(var(--nav-height) + var(--safe-bottom));
          padding-bottom: var(--safe-bottom);
          z-index: 80;
        }
        .bottom-nav__btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          min-height: 44px;
          padding: 6px 0;
          color: var(--color-text2);
          transition: color var(--transition-fast), transform var(--transition-fast);
          position: relative;
        }
        .bottom-nav__btn.active {
          color: var(--color-accent);
        }
        .bottom-nav__btn:active {
          transform: scale(0.92);
        }
        .bottom-nav__icon {
          font-size: 20px;
          line-height: 1;
        }
        .bottom-nav__label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .bottom-nav__btn--add .bottom-nav__icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid var(--color-accent);
          color: var(--color-accent);
          font-size: 26px;
          font-weight: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2px;
        }
        .bottom-nav__btn--add.active .bottom-nav__icon {
          background: var(--color-accent);
          color: var(--color-bg);
        }
      </style>
      ${TABS.map(tab => `
        <button
          class="bottom-nav__btn ${tab.isAdd ? 'bottom-nav__btn--add' : ''} ${tab.id === this.activeTab ? 'active' : ''}"
          data-tab="${tab.id}"
          aria-label="${tab.label || tab.id}"
        >
          <span class="bottom-nav__icon">${tab.icon}</span>
          ${!tab.isAdd ? `<span class="bottom-nav__label">${tab.label}</span>` : ''}
        </button>
      `).join('')}
    `;
  }

  _bindEvents() {
    this.el.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tab]');
      if (!btn) return;
      const tab = btn.dataset.tab;
      if (tab !== 'add') this.setActive(tab);
      document.dispatchEvent(new CustomEvent('nav:change', { detail: { tab } }));
    });
  }

  setActive(tab) {
    this.activeTab = tab;
    this.el?.querySelectorAll('[data-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
  }
}
