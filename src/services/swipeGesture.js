const SWIPE_THRESHOLD = 50;
const EDGE_GUARD = 20; // ignore iOS edge swipe zone (px from left)

export class SwipeGesture {
  constructor(target, { onComplete, onDelete, onPostpone } = {}) {
    this.target = target;
    this.onComplete = onComplete;
    this.onDelete = onDelete;
    this.onPostpone = onPostpone;

    this._startX = 0;
    this._startY = 0;
    this._dx = 0;
    this._dragging = false;
    this._actionPanel = null;

    this._attach();
  }

  _attach() {
    const t = this.target;
    t.addEventListener('touchstart', this._onStart.bind(this), { passive: true });
    t.addEventListener('touchmove',  this._onMove.bind(this),  { passive: false });
    t.addEventListener('touchend',   this._onEnd.bind(this),   { passive: true });
  }

  _onStart(e) {
    const touch = e.touches[0];
    if (touch.clientX < EDGE_GUARD) return; // let iOS handle edge swipe
    this._startX = touch.clientX;
    this._startY = touch.clientY;
    this._dx = 0;
    this._dragging = false;
    this._removeActionPanel();
  }

  _onMove(e) {
    if (!e.touches.length) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this._startX;
    const dy = touch.clientY - this._startY;

    if (!this._dragging && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;

    // Require more horizontal than vertical movement to start drag
    if (!this._dragging) {
      if (Math.abs(dx) < Math.abs(dy)) return;
      this._dragging = true;
    }

    e.preventDefault();
    this._dx = dx;
    this._applyTranslate(dx);

    if (dx > 0) {
      this._showCompleteHint(dx);
    } else {
      this._removeCompleteHint();
    }
  }

  _onEnd() {
    if (!this._dragging) return;
    this._dragging = false;

    const dx = this._dx;
    if (dx > SWIPE_THRESHOLD) {
      this._triggerComplete();
    } else if (dx < -SWIPE_THRESHOLD) {
      this._showActionPanel();
      this._applyTranslate(-80);
    } else {
      this._snapBack();
    }
  }

  _applyTranslate(dx) {
    this.target.style.transform = `translateX(${dx}px)`;
  }

  _snapBack() {
    this.target.style.transition = 'transform 300ms cubic-bezier(0.4,0,0.2,1)';
    this.target.style.transform = 'translateX(0)';
    this._removeCompleteHint();
    setTimeout(() => { this.target.style.transition = ''; }, 310);
  }

  _showCompleteHint(dx) {
    const ratio = Math.min(dx / (SWIPE_THRESHOLD * 2), 1);
    this.target.style.background = `rgba(0, 229, 195, ${ratio * 0.25})`;
  }

  _removeCompleteHint() {
    this.target.style.background = '';
  }

  _triggerComplete() {
    if (navigator.vibrate) navigator.vibrate([10]);
    this.target.style.transition = 'transform 200ms ease, opacity 300ms ease';
    this.target.style.transform = 'translateX(100%)';
    this.target.style.opacity = '0';
    setTimeout(() => {
      this._removeCompleteHint();
      this.target.style.transition = '';
      this.onComplete?.();
    }, 300);
  }

  _showActionPanel() {
    this._removeActionPanel();
    const panel = document.createElement('div');
    panel.className = 'swipe-action-panel';
    panel.innerHTML = `
      <style>
        .swipe-action-panel {
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 80px;
          display: flex;
          align-items: stretch;
          overflow: hidden;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }
        .swipe-action-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 600;
        }
        .swipe-action-btn--delete   { background: var(--color-high); color: #fff; }
        .swipe-action-btn--postpone { background: var(--color-medium); color: #fff; }
        .swipe-action-btn span { font-size: 18px; }
      </style>
      <button class="swipe-action-btn swipe-action-btn--postpone" data-action="postpone">
        <span>⏰</span>연기
      </button>
      <button class="swipe-action-btn swipe-action-btn--delete" data-action="delete">
        <span>🗑</span>삭제
      </button>
    `;

    panel.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      this._removeActionPanel();
      this._snapBack();
      if (action === 'delete') this.onDelete?.();
      if (action === 'postpone') this.onPostpone?.();
    });

    this.target.style.position = 'relative';
    this.target.appendChild(panel);
    this._actionPanel = panel;
  }

  _removeActionPanel() {
    this._actionPanel?.remove();
    this._actionPanel = null;
  }

  destroy() {
    this._removeActionPanel();
  }
}
