const DISMISSED_KEY = 'flowo_install_dismissed';
const DISMISS_DAYS = 7;

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
}

function isStandalone() {
  return window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
}

function isDismissed() {
  const ts = localStorage.getItem(DISMISSED_KEY);
  if (!ts) return false;
  return Date.now() - Number(ts) < DISMISS_DAYS * 86400 * 1000;
}

export class InstallBanner {
  constructor() {
    this.el = null;
    this._deferredPrompt = null;
    this._listening = false;
  }

  render() {
    this.el = document.createElement('div');
    this.el.style.display = 'none';
    this.el.innerHTML = `
      <style>
        .install-banner {
          position: fixed;
          bottom: calc(var(--nav-height) + var(--safe-bottom) + 12px);
          left: var(--spacing-md);
          right: var(--spacing-md);
          background: var(--color-surface2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          z-index: 70;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          animation: slideUp 300ms cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .install-banner__icon { font-size: 28px; flex-shrink: 0; }
        .install-banner__body { flex: 1; }
        .install-banner__title { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
        .install-banner__desc { font-size: 12px; color: var(--color-text2); line-height: 1.5; }
        .install-banner__close {
          font-size: 18px;
          color: var(--color-text2);
          line-height: 1;
          min-width: 24px;
          text-align: center;
        }
        .install-banner__btn {
          display: block;
          margin-top: 10px;
          background: var(--color-accent);
          color: var(--color-bg);
          font-size: 13px;
          font-weight: 700;
          padding: 8px 18px;
          border-radius: var(--radius-sm);
          width: 100%;
          text-align: center;
        }
      </style>
      <div class="install-banner" id="install-banner">
        <div class="install-banner__icon">📱</div>
        <div class="install-banner__body">
          <div class="install-banner__title">홈 화면에 추가하기</div>
          <div class="install-banner__desc" id="install-desc"></div>
          <div id="install-action"></div>
        </div>
        <button class="install-banner__close" id="install-close">✕</button>
      </div>
    `;

    this.el.querySelector('#install-close').addEventListener('click', () => {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
      this.el.style.display = 'none';
    });

    if (!isDismissed() && !isStandalone()) {
      if (isIOS()) {
        this._showIOS();
      } else {
        this._listenAndroid();
      }
    }

    return this.el;
  }

  _showIOS() {
    this.el.querySelector('#install-desc').textContent = '홈 화면에 추가하면 더 편리하게 사용할 수 있어요';
    this.el.querySelector('#install-action').innerHTML = '<div style="font-size:12px;color:var(--color-text2);margin-top:6px;">Safari 하단 공유 버튼(⬆️) → 홈 화면에 추가</div>';
    this.el.style.display = '';
  }

  _listenAndroid() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this._deferredPrompt = e;
      this.el.querySelector('#install-desc').textContent = '홈 화면에 추가하면 더 편리하게 사용할 수 있어요';
      const btn = document.createElement('button');
      btn.className = 'install-banner__btn';
      btn.textContent = '설치하기';
      btn.addEventListener('click', () => {
        this._deferredPrompt.prompt();
        this._deferredPrompt.userChoice.then(() => {
          this.el.style.display = 'none';
        });
      });
      this.el.querySelector('#install-action').appendChild(btn);
      this.el.style.display = '';
    });
  }
}
