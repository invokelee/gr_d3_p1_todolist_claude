import { setLocale, getLocale } from '../i18n/index.js';

const APP_VERSION = '0.1.0';
const BUILD_DATE = '2026-05-01';
const DEVELOPER = { name: 'Sanghoon Lee', email: 'invokelee@gmail.com' };
const TECH_STACK = ['Vanilla JS (ES2024)', 'IndexedDB', 'PWA / Service Worker', 'Web Push API', 'Cloudflare Pages'];

export class SettingsView {
  constructor() {
    this.el = null;
  }

  render() {
    this.el = document.createElement('div');
    this.el.className = 'settings-view';
    this.el.innerHTML = `
      <style>
        .settings-view { padding: 16px var(--spacing-md) var(--spacing-md); }
        .settings-heading { font-size: 26px; font-weight: 700; margin-bottom: 24px; }
        .settings-section { margin-bottom: 28px; }
        .settings-section-title { font-size: 11px; font-weight: 700; color: var(--color-text2); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
        .settings-card { background: var(--color-surface); border-radius: var(--radius-md); overflow: hidden; }
        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--color-border);
          min-height: 52px;
        }
        .settings-row:last-child { border-bottom: none; }
        .settings-row-label { font-size: 15px; }
        .settings-row-value { font-size: 14px; color: var(--color-text2); }
        .lang-select {
          background: var(--color-surface2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text);
          font-size: 14px;
          padding: 6px 10px;
          outline: none;
          min-height: 36px;
        }
        .ws-input {
          background: var(--color-surface2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text);
          font-size: 14px;
          padding: 6px 10px;
          width: 120px;
          min-height: 36px;
        }
        .danger-btn {
          width: 100%;
          padding: 14px;
          background: rgba(255,107,107,0.12);
          color: var(--color-high);
          font-size: 15px;
          font-weight: 600;
          border-radius: var(--radius-md);
          min-height: 50px;
          border: 1px solid rgba(255,107,107,0.25);
          text-align: center;
          transition: background var(--transition-fast);
        }
        .danger-btn:active { background: rgba(255,107,107,0.22); }
        .app-footer {
          margin-top: 8px;
          padding: 24px 0 8px;
          border-top: 1px solid var(--color-border);
          text-align: center;
        }
        .app-footer__brand {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-accent);
          letter-spacing: -0.03em;
          margin-bottom: 12px;
        }
        .app-footer__info {
          font-size: 12px;
          color: var(--color-text2);
          line-height: 2;
        }
        .app-footer__info a {
          color: var(--color-accent);
          text-decoration: none;
        }
        .app-footer__stack {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          margin-top: 14px;
        }
        .app-footer__chip {
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 100px;
          background: var(--color-surface2);
          border: 1px solid var(--color-border);
          color: var(--color-text2);
        }
      </style>
      <div class="settings-heading">설정</div>

      <div class="settings-section">
        <div class="settings-section-title">일반</div>
        <div class="settings-card">
          <div class="settings-row">
            <span class="settings-row-label">언어</span>
            <select class="lang-select" id="lang-select">
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">워크스페이스</div>
        <div class="settings-card">
          <div class="settings-row">
            <span class="settings-row-label">Personal 이름</span>
            <input class="ws-input" id="ws-personal" type="text" />
          </div>
          <div class="settings-row">
            <span class="settings-row-label">Work 이름</span>
            <input class="ws-input" id="ws-work" type="text" />
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">데이터</div>
        <button class="danger-btn" id="reset-btn">🗑 데이터 초기화</button>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">앱 정보</div>
        <div class="settings-card">
          <div class="settings-row">
            <span class="settings-row-label">버전</span>
            <span class="settings-row-value">v${APP_VERSION}</span>
          </div>
          <div class="settings-row">
            <span class="settings-row-label">빌드 일시</span>
            <span class="settings-row-value">${BUILD_DATE}</span>
          </div>
        </div>
      </div>

      <footer class="app-footer">
        <div class="app-footer__brand">Flowo</div>
        <div class="app-footer__info">
          <div>개발자 &nbsp;${DEVELOPER.name}</div>
          <div><a href="mailto:${DEVELOPER.email}">${DEVELOPER.email}</a></div>
          <div style="margin-top:4px;color:var(--color-border)">Built with Claude Code · ${BUILD_DATE}</div>
        </div>
        <div class="app-footer__stack">
          ${TECH_STACK.map(t => `<span class="app-footer__chip">${t}</span>`).join('')}
        </div>
      </footer>
    `;

    this._bindEvents();
    return this.el;
  }

  onActivate() {
    const locale = getLocale();
    this.el.querySelector('#lang-select').value = locale;

    const personal = localStorage.getItem('flowo_ws_personal') || 'Personal';
    const work = localStorage.getItem('flowo_ws_work') || 'Work';
    this.el.querySelector('#ws-personal').value = personal;
    this.el.querySelector('#ws-work').value = work;
  }

  _bindEvents() {
    this.el.querySelector('#lang-select').addEventListener('change', async (e) => {
      await setLocale(e.target.value);
    });

    this.el.querySelector('#ws-personal').addEventListener('change', (e) => {
      localStorage.setItem('flowo_ws_personal', e.target.value.trim() || 'Personal');
    });

    this.el.querySelector('#ws-work').addEventListener('change', (e) => {
      localStorage.setItem('flowo_ws_work', e.target.value.trim() || 'Work');
    });

    this.el.querySelector('#reset-btn').addEventListener('click', () => {
      if (confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        indexedDB.deleteDatabase('flowo-db');
        localStorage.clear();
        location.reload();
      }
    });
  }
}
