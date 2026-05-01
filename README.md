# Flowo

> **빠른 할 일 관리 PWA** — 2초 입력, 스마트 캘린더, 오프라인 완전 동작

🔗 **Live Demo:** https://invokelee.github.io/gr_d3_p1_todolist_claude/

---

## 소개

Flowo는 iOS / Android 모바일 환경에 최적화된 **Progressive Web App(PWA)** 할 일 관리 앱입니다.  
프레임워크 없이 **Vanilla JS(ES2024)** 로 구현되었으며, 모든 데이터는 기기 내 IndexedDB에 저장됩니다.

---

## 주요 기능

### 📋 오늘의 할 일 (Today)
- 오늘 마감인 태스크를 한눈에 확인
- 완료율 진행 바 표시
- Personal / Work 워크스페이스 필터
- 우선순위별 컬러 바(빨강 높음 / 노랑 보통 / 회색 낮음)

### ➕ 빠른 추가 (Quick Add)
- 하단 **+** 버튼으로 하단 시트(Bottom Sheet) 즉시 열기
- 마감일 단축 버튼: **오늘 / 내일 / 다음 주**
- 우선순위 선택: H(높음) / M(보통) / L(낮음)
- 워크스페이스 선택: Personal / Work
- 키보드가 올라올 때 시트 자동 위로 이동 (visualViewport API)

### 📅 캘린더 (Calendar)
- 월간 그리드로 태스크 일정 한눈에 파악
- 날짜에 우선순위 컬러 **dot**으로 태스크 존재 표시
- 날짜 클릭 → 해당 날짜의 태스크 목록 즉시 조회
- 날짜 선택 상태에서 **인라인 빠른 추가** 가능
- ‹ › 버튼으로 이전 / 다음 달 이동

### 📋 전체 할 일 (Tasks)
- 모든 태스크 목록 (전체 / 진행 중 / 완료 필터)
- 생성일 역순 정렬

### 💡 Flash Notes
- 아이디어를 즉시 텍스트로 캡처
- **→ 태스크로 전환** 버튼으로 Quick Add 시트에 내용 자동 입력
- Cmd+Enter(Mac) / Ctrl+Enter(Windows)로 빠른 저장

### ⚙️ 설정 (Settings)
- 언어 전환: 한국어 / English
- 워크스페이스 이름 커스텀
- 전체 데이터 초기화
- 개발자 정보 및 기술 스택 표시

---

## 제스처 인터랙션

| 제스처 | 동작 |
|--------|------|
| 태스크 **우측 스와이프** | ✅ 완료 처리 (진동 피드백) |
| 태스크 **좌측 스와이프** | 🗑 삭제 / ⏰ 하루 연기 패널 열기 |
| Bottom Sheet **아래로 스와이프** | 시트 닫기 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| UI | Vanilla JS (ES2024), CSS Custom Properties |
| 데이터 | IndexedDB ([idb](https://github.com/jakearchibald/idb) v8) |
| PWA | Service Worker (Stale-While-Revalidate), Web App Manifest |
| 알림 | Web Push API (예정) |
| 호스팅 | GitHub Pages |
| 빌드 도구 | 없음 (No bundler) |

---

## 디렉토리 구조

```
flowo/
├── index.html                  # 앱 진입점
├── manifest.json               # PWA 매니페스트
├── src/
│   ├── app.js                  # 라우터 & 앱 초기화
│   ├── styles.css              # 전역 CSS 토큰 & 리셋
│   ├── components/
│   │   ├── AppHeader.js        # 상단 고정 헤더
│   │   ├── BottomNav.js        # 하단 탭 네비게이션
│   │   ├── QuickAddSheet.js    # 태스크 빠른 추가 시트
│   │   ├── TaskItem.js         # 태스크 아이템 (스와이프 포함)
│   │   └── InstallBanner.js    # PWA 설치 유도 배너
│   ├── views/
│   │   ├── TodayView.js        # 오늘 탭
│   │   ├── AllTasksView.js     # 전체 탭
│   │   ├── CalendarView.js     # 캘린더 탭
│   │   ├── FlashView.js        # Flash Notes 탭
│   │   └── SettingsView.js     # 설정 탭
│   ├── store/
│   │   ├── db.js               # IndexedDB 초기화
│   │   ├── taskStore.js        # 태스크 CRUD
│   │   └── noteStore.js        # 메모 CRUD
│   ├── services/
│   │   └── swipeGesture.js     # 스와이프 제스처 엔진
│   └── i18n/
│       ├── index.js            # 다국어 로더 (t() 함수)
│       ├── ko.json             # 한국어
│       └── en.json             # 영어
├── sw/
│   └── service-worker.js       # 오프라인 캐싱 & Push 수신
└── public/
    ├── favicon.svg
    └── icons/
        ├── icon-192.svg
        └── icon-512.svg
```

---

## 로컬 실행

```bash
# 의존성 설치 (개발 서버용 serve 패키지)
npm install

# 로컬 개발 서버 실행 (http://localhost:3000)
npm start
```

> **참고:** ES Modules를 직접 사용하므로 파일 프로토콜(`file://`)이 아닌 HTTP 서버에서 실행해야 합니다.

---

## PWA 설치

### iOS Safari
1. Safari 하단 **공유 버튼(⬆️)** 탭
2. **홈 화면에 추가** 선택
3. 이름 확인 후 **추가** 탭

### Android Chrome
1. 앱 접속 시 하단에 **설치 배너** 자동 표시
2. **설치하기** 버튼 탭

---

## 데이터 저장 방식

모든 데이터는 기기 내 **IndexedDB**에 저장됩니다. 서버 전송 없이 완전 오프라인 동작합니다.

| 저장소 | 내용 |
|--------|------|
| `tasks` | 태스크 (제목, 마감일, 우선순위, 워크스페이스, 완료 여부) |
| `flashNotes` | Flash 메모 (내용, 태스크 전환 여부) |

---

## 개발 정보

| 항목 | 내용 |
|------|------|
| 개발자 | Sanghoon Lee |
| 이메일 | invokelee@gmail.com |
| 빌드 일시 | 2026-05-01 |
| 개발 도구 | Claude Code (Anthropic) |
| 버전 | v0.1.0 |
