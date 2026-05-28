---
doc_type: brief
version: v0.2 (Draft)
status: Draft
author: woosung.ahn@bespinglobal.com
date: 2026-05-28
gate: A
related:
  R-ID: []
  F-ID: []
  supersedes: null
---

# Conduit Lite — Project Brief

> RFP `RFP.md` (Conduit Lite — 초보자용 미니 블로그 플랫폼)를 1장으로 응축한 의도 정의. NEW_PROJECT Gate A 입력.

## 변경 이력

| Version | Date | Author | Change |
|---|---|---|---|
| v0.2 | 2026-05-28 | jungsoobin96 | §8 Open Q O-01~O-05 ADR-0049 마커 (#25) |
| v0.1 | 2026-05-22 | woosung.ahn@bespinglobal.com | 초안 (flow-init Phase 1, RFP 기반 의도 응축) |

## 1. 한 줄 정의

누구나 글을 쓰고·읽고·댓글을 달 수 있는 태그·페이지네이션 지원 미니 블로그 — "DB ↔ API ↔ 화면" 풀스택 흐름을 입문자가 완주 가능한 범위로 축소한 RealWorld 스펙 변형.

## 2. 배경 / 문제 정의

개발 입문자는 풀스택 흐름을 한 번이라도 끝까지 체험하기 어렵다. RealWorld 원본 스펙은 학습용으로 널리 쓰이지만 JWT 인증·팔로우·개인화 피드 등 난이도가 높은 영역이 약 60%를 차지해 완주율이 낮다. 본 프로젝트는 **인증·관계 모델링을 의도적으로 제거**하고, 게시글·댓글·태그·페이지네이션이라는 "최소 학습 단위"만으로 풀스택 1주기를 닫는다. 학습 동기를 잃지 않고 README만으로 새 환경에서 동작하는 산출까지 도달하는 것이 목표.

## 3. 핵심 사용자 / 이해관계자

- **1차 사용자(학습자)** — 프로그래밍을 시작한 지 0~6개월 사이의 개발 입문자. JS/TS 기본 문법은 알지만 풀스택 통합 경험 없음. SQLite 같은 가벼운 DB와 직관적 구조를 선호.
- **2차 사용자(블로그 방문자)** — 별도 가입 없이 글을 읽고 댓글을 다는 익명/이름-텍스트 사용자. 본 MVP에서 인증 없음.
- **이해관계자** — 학습용 코드베이스 리뷰어, 부트캠프 강사, README를 따라 환경을 재현하려는 평가자.

## 4. 목표 (성공 정의)

| KPI | 측정 방법 | 목표값 | 달성 시점 |
|---|---|---|---|
| README 절차 재현율 | 새 컴퓨터에서 README만으로 로컬 실행 성공 (10명 시도) | 100% | M6 종료 시 |
| 골든 패스 통과 | 글 작성→목록 노출→댓글→태그 필터→삭제까지 무에러 (gstack `/qa` 1회) | 콘솔 에러 0건 | M5 종료 시 |
| 평가 기준 충족 | RFP §10 7개 항목 자동/수동 통과 | 7/7 | M6 종료 시 |
| Phase 2 확장 가능성 | 세션 인증 추가 시 코드 수정 면적 | ≤ 20% | (Phase 2 진입 시) |
| 코드 가독성 (학습 친화) | 핵심 모듈 한국어 주석 커버리지 | ≥ 80% | M6 종료 시 |

## 5. 비목표 (Out of Scope)

- JWT 인증 (Phase 2 세션 인증으로 대체)
- 사용자 팔로우·언팔로우, 개인화 피드, 즐겨찾기
- 프로필 페이지, Markdown 본문 렌더링
- 이미지 업로드, 알림, 검색 등 부가 기능
- 다국어 UI, 다중 DB 지원
- 운영 자동화(CI/CD on GitHub Actions 정밀 구성, k8s, observability stack) — 본 MVP는 로컬 실행이 목적

## 6. 일정 (대략)

| 단계 | 내용 | 예상 기간 |
|---|---|---|
| M1 | 환경 세팅 / DB 스키마 / 게시글 API | 3~4일 |
| M2 | 댓글 API / 태그 API | 2일 |
| M3 | 프론트엔드 글 목록 + 상세 화면 | 3일 |
| M4 | 글 작성/수정/삭제 화면 + 댓글 UI | 3일 |
| M5 | 페이지네이션 + 태그 필터 + 디자인 정리 | 2일 |
| M6 | README 작성 + 버그 수정 | 1일 |
| **총** | | **약 2주** |

## 7. 리스크 (초기 식별)

| ID | 리스크 | 영향 | 초기 대응 |
|---|---|---|---|
| RISK-01 | 인증 없음 — 누구나 글 수정/삭제 가능 | MVP 의도(학습)와 충돌 없음. 단, README에 명시 필요 | README와 04 SRS R-N-XX에 "공개 데모용, 운영 사용 금지" 명시 |
| RISK-02 | SQLite 파일 동시 쓰기 락 | 1인 학습 환경에서는 영향 미미. 다중 데모 시 충돌 | 데모 시 단일 인스턴스만 권장 — Open Question O-04 |
| RISK-03 | tagList 입력 형식(쉼표 구분) 검증 누락 시 빈 태그·중복 | UX 저하 | 04 SRS R-F-XX에 입력 검증 명시 |
| RISK-04 | 댓글 cascade 삭제 누락 시 고아 댓글 | 데이터 정합성 깨짐 | 04 SRS R-F-XX에 ON DELETE CASCADE 명시 |
| RISK-05 | 기술 스택 자유도(React/순수 HTML, JS/TS) 미확정 시 산출 방향 흔들림 | 학습 자료 분산 | 02 Feasibility에서 stack leaning 확정 |

## 8. Open Questions

> [ADR-0049 Sprint 6 #25 일괄 해소] 본 §의 O-01~O-05 5건은 모두 ✅ 해소완료. 결정 trace는 [`docs/planning/adr/0049-open-questions-resolution.md`](../adr/0049-open-questions-resolution.md) + [`docs/features/bug-residual-and-open-questions-resolve/bug-residual-and-open-questions-resolve.openq-resolution.md`](../../features/bug-residual-and-open-questions-resolve/bug-residual-and-open-questions-resolve.openq-resolution.md) §8 참조.

- O-01: 기술 스택 — React+Vite vs 순수 HTML/JS 중 권장 1택을 02 Feasibility에서 확정한다. **✅ 해소완료** (React+Vite 채택, 02 Feasibility §"Decision")
- O-02: 언어 — JavaScript 우선 vs TypeScript 도전 옵션 — 학습 친화성과 타입 안전 사이 균형. **✅ 해소완료** (TypeScript 채택, 11-coding-conventions §1)
- O-03: ORM — Prisma vs better-sqlite3 직접 사용 — 학습 곡선 vs 마법성. **✅ 해소완료** (Prisma 채택, 08-lld-module-spec + backend/prisma)
- O-04: 동시 데모 시나리오 인정 여부 — SQLite WAL 모드 적용 vs 단일 인스턴스 가이드. **🔁 Phase 2 보류** (MVP 단일 인스턴스)
- O-05: 학습 친화성 KPI(주석 커버리지 ≥80%)의 측정 도구 — 수동 vs 자동 grep 룰. **✅ 해소완료** (grep 자동, Sprint 6 #23)
