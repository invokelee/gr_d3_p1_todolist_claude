import { BottomNav } from './components/BottomNav.js';
import { AppHeader } from './components/AppHeader.js';
import { TodayView } from './views/TodayView.js';
import { AllTasksView } from './views/AllTasksView.js';
import { CalendarView } from './views/CalendarView.js';
import { FlashView } from './views/FlashView.js';
import { SettingsView } from './views/SettingsView.js';
import { QuickAddSheet } from './components/QuickAddSheet.js';
import { InstallBanner } from './components/InstallBanner.js';
import { initDB } from './store/db.js';
import { setLocale, detectLocale } from './i18n/index.js';

const TAB_SUBTITLES = {
  today:    '오늘의 할 일',
  tasks:    '전체 할 일',
  calendar: '캘린더',
  flash:    'Flash Notes',
  settings: '설정',
};

class App {
  constructor() {
    this.mainContent = document.getElementById('main-content');
    this.bottomNavEl = document.getElementById('bottom-nav');
    this.headerEl    = document.getElementById('app-header');
    this.overlay     = document.getElementById('overlay');
    this.sheetContainer = document.getElementById('sheet-container');

    this.currentTab = 'today';
    this.views = {};
    this.quickAddSheet = null;
    this.bottomNav = null;
    this.appHeader = null;
  }

  async init() {
    try {
      await initDB();
    } catch (e) {
      console.warn('IndexedDB init failed, running in memory mode:', e);
    }

    await setLocale(detectLocale());

    this.appHeader = new AppHeader({ subtitle: TAB_SUBTITLES['today'] });
    this.headerEl.appendChild(this.appHeader.render());

    this.bottomNav = new BottomNav();
    this.bottomNavEl.appendChild(this.bottomNav.render());

    this.quickAddSheet = new QuickAddSheet();
    this.sheetContainer.appendChild(this.quickAddSheet.render());

    this.installBanner = new InstallBanner();
    document.body.appendChild(this.installBanner.render());

    this._bindEvents();
    this._navigate('today');

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw/service-worker.js').catch(() => {});
    }
  }

  _bindEvents() {
    document.addEventListener('nav:change', (e) => {
      const { tab } = e.detail;
      if (tab === 'add') {
        this.quickAddSheet.open();
        return;
      }
      this._navigate(tab);
    });

    this.overlay.addEventListener('click', () => {
      this.quickAddSheet.close();
    });

    document.addEventListener('sheet:open',  () => this.overlay.classList.add('visible'));
    document.addEventListener('sheet:close', () => this.overlay.classList.remove('visible'));

    document.addEventListener('task:created', () => document.dispatchEvent(new CustomEvent('tasks:refresh')));
    document.addEventListener('task:updated', () => document.dispatchEvent(new CustomEvent('tasks:refresh')));
    document.addEventListener('task:deleted', () => document.dispatchEvent(new CustomEvent('tasks:refresh')));

    window.addEventListener('popstate', () => {
      if (this.quickAddSheet?.isOpen) this.quickAddSheet.close();
    });
  }

  _navigate(tab) {
    this.currentTab = tab;
    this.bottomNav.setActive(tab);
    this.appHeader?.setSubtitle(TAB_SUBTITLES[tab] || '');

    const ViewClass = {
      today:    TodayView,
      tasks:    AllTasksView,
      calendar: CalendarView,
      flash:    FlashView,
      settings: SettingsView,
    }[tab];

    if (!ViewClass) return;

    if (!this.views[tab]) {
      this.views[tab] = new ViewClass();
    }

    this.mainContent.innerHTML = '';
    this.mainContent.appendChild(this.views[tab].render());
    this.views[tab].onActivate?.();
  }
}

const app = new App();
app.init();
