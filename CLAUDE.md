# Flowo — Claude Code 지시 파일

## 프로젝트 개요
Flowo는 iOS 우선 모바일 PWA To-Do 앱입니다.
- 타겟: iOS Safari (1순위), Android Chrome (2순위)
- 스택: Vanilla JS (ES2024), CSS Custom Properties, No Framework
- 데이터: IndexedDB (idb 라이브러리), 로컬 저장 only (MVP)
- 알림: Web Push API + Cloudflare Workers

## 핵심 규칙
1. 프레임워크 금지 — React/Vue/Angular 사용하지 않음
2. 빌드 도구 금지 — Webpack/Vite 없음, ES Modules 직접 사용
3. 모든 CSS는 styles.css의 CSS 변수 사용 (직접 컬러값 하드코딩 금지)
4. 터치 타겟 최소 44×44px 보장
5. iOS Safe Area: env(safe-area-inset-*) 항상 적용
6. 애니메이션: transform, opacity만 사용 (layout reflow 방지)
7. 한국어(ko), 영어(en) 두 언어 지원 — i18n/ 파일 참조

## CSS 변수 (styles.css에서 정의됨)
--color-accent: #00e5c3      # 완료, 액션
--color-accent2: #7c6eff     # Work 워크스페이스
--color-high: #ff6b6b        # 높은 우선순위
--color-medium: #ffab00      # 중간 우선순위
--color-low: #8888a4         # 낮은 우선순위
--color-bg: #09090e
--color-surface: #14141c
--color-text: #eeeef6
--color-text2: #8888a4

## 컴포넌트 작성 규칙
- 각 컴포넌트는 클래스로 작성, render() 메서드 반환값은 HTMLElement
- 이벤트는 CustomEvent로 상위에 전파 (컴포넌트 간 직접 참조 금지)
- 상태 변경은 항상 Store를 통해 (직접 DOM 상태 저장 금지)

## 파일 수정 시 주의
- db.js 스키마 변경 시 반드시 마이그레이션 버전 올릴 것
- service-worker.js 캐시 버전은 파일 변경 시마다 올릴 것
- manifest.json의 icons 배열은 수정하지 말 것
