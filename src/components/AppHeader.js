export class AppHeader {
  constructor({ title = 'Flowo', subtitle = '' } = {}) {
    this.title = title;
    this.subtitle = subtitle;
    this.el = null;
  }

  render() {
    this.el = document.createElement('header');
    this.el.className = 'app-header safe-top';
    this.el.innerHTML = `
      <style>
        .app-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(9,9,14,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-border);
          padding: calc(var(--safe-top) + 10px) var(--spacing-md) 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 52px;
        }
        .app-header__logo {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--color-accent);
          line-height: 1;
        }
        .app-header__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-accent);
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .app-header__subtitle {
          font-size: 13px;
          color: var(--color-text2);
          flex: 1;
        }
      </style>
      <span class="app-header__logo">Flowo</span>
      <span class="app-header__dot"></span>
      ${this.subtitle ? `<span class="app-header__subtitle">${this.subtitle}</span>` : ''}
    `;
    return this.el;
  }

  setSubtitle(text) {
    const sub = this.el?.querySelector('.app-header__subtitle');
    if (sub) sub.textContent = text;
  }
}
