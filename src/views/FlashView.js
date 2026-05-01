import { createNote, deleteNote, getAllNotes } from '../store/noteStore.js';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export class FlashView {
  constructor() {
    this.el = null;
    this._notes = [];
  }

  render() {
    this.el = document.createElement('div');
    this.el.className = 'flash-view';
    this.el.innerHTML = `
      <style>
        .flash-view { padding: calc(var(--safe-top) + 16px) var(--spacing-md) var(--spacing-md); display: flex; flex-direction: column; height: 100%; }
        .flash-heading { font-size: 26px; font-weight: 700; margin-bottom: 16px; }
        .flash-input-area {
          background: var(--color-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          padding: 14px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: border-color var(--transition-fast);
        }
        .flash-input-area:focus-within { border-color: var(--color-accent); }
        .flash-textarea {
          width: 100%;
          min-height: 80px;
          resize: none;
          font-size: 15px;
          line-height: 1.6;
          color: var(--color-text);
          background: transparent;
          caret-color: var(--color-accent);
        }
        .flash-textarea::placeholder { color: var(--color-text2); }
        .flash-save-btn {
          align-self: flex-end;
          background: var(--color-accent);
          color: var(--color-bg);
          font-size: 14px;
          font-weight: 700;
          padding: 8px 20px;
          border-radius: var(--radius-sm);
          min-height: 36px;
          transition: opacity var(--transition-fast);
        }
        .flash-save-btn:disabled { opacity: 0.3; }
        .flash-notes-list { display: flex; flex-direction: column; gap: 10px; }
        .flash-note {
          background: var(--color-surface);
          border-radius: var(--radius-md);
          padding: 14px;
          position: relative;
        }
        .flash-note__content { font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; margin-bottom: 10px; }
        .flash-note__footer { display: flex; justify-content: space-between; align-items: center; }
        .flash-note__time { font-size: 11px; color: var(--color-text2); }
        .flash-note__actions { display: flex; gap: 8px; }
        .flash-note__btn {
          font-size: 12px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 100px;
          border: 1px solid var(--color-border);
          color: var(--color-text2);
          transition: all var(--transition-fast);
          min-height: 30px;
        }
        .flash-note__btn--convert { color: var(--color-accent); border-color: var(--color-accent); }
        .flash-note__btn--delete  { color: var(--color-high); border-color: var(--color-high); }
        .flash-note--converted { opacity: 0.4; }
        .flash-note--converted::after { content: '✓ 태스크로 전환됨'; font-size: 11px; color: var(--color-accent); display: block; margin-top: 4px; }
      </style>
      <div class="flash-heading">Flash Notes</div>
      <div class="flash-input-area">
        <textarea class="flash-textarea" id="flash-input" placeholder="일하다 떠오른 아이디어를 바로 저장하세요" rows="3"></textarea>
        <button class="flash-save-btn" id="flash-save" disabled>저장</button>
      </div>
      <div class="flash-notes-list" id="notes-list"></div>
    `;

    const input = this.el.querySelector('#flash-input');
    const saveBtn = this.el.querySelector('#flash-save');

    input.addEventListener('input', () => {
      saveBtn.disabled = !input.value.trim();
    });

    input.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!saveBtn.disabled) this._save();
      }
    });

    saveBtn.addEventListener('click', () => this._save());

    return this.el;
  }

  async onActivate() {
    await this._loadAndRender();
    this.el.querySelector('#flash-input').focus();
  }

  async _loadAndRender() {
    this._notes = await getAllNotes();
    this._notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    this._renderNotes();
  }

  _renderNotes() {
    const list = this.el.querySelector('#notes-list');

    if (!this._notes.length) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">💡</div>
          <div class="empty-state__title">메모가 없어요</div>
          <div class="empty-state__desc">일하다 떠오른 아이디어를<br>바로 저장하세요</div>
        </div>`;
      return;
    }

    list.innerHTML = '';
    this._notes.forEach(note => {
      const el = document.createElement('div');
      el.className = `flash-note${note.convertedToTaskId ? ' flash-note--converted' : ''}`;
      el.dataset.noteId = note.id;
      el.innerHTML = `
        <div class="flash-note__content">${this._escape(note.content)}</div>
        <div class="flash-note__footer">
          <span class="flash-note__time">${timeAgo(note.createdAt)}</span>
          <div class="flash-note__actions">
            ${!note.convertedToTaskId ? `<button class="flash-note__btn flash-note__btn--convert" data-action="convert" data-note-id="${note.id}">→ 태스크로</button>` : ''}
            <button class="flash-note__btn flash-note__btn--delete" data-action="delete" data-note-id="${note.id}">삭제</button>
          </div>
        </div>
      `;
      list.appendChild(el);
    });

    list.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, noteId } = btn.dataset;
      if (action === 'delete') {
        await deleteNote(noteId);
        await this._loadAndRender();
      } else if (action === 'convert') {
        const note = this._notes.find(n => n.id === noteId);
        if (note) {
          document.dispatchEvent(new CustomEvent('nav:change', { detail: { tab: 'add' } }));
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('sheet:prefill', { detail: { title: note.content.split('\n')[0].slice(0, 80) } }));
          }, 100);
        }
      }
    });
  }

  _escape(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  async _save() {
    const input = this.el.querySelector('#flash-input');
    const content = input.value.trim();
    if (!content) return;
    await createNote(content);
    input.value = '';
    this.el.querySelector('#flash-save').disabled = true;
    await this._loadAndRender();
  }
}
