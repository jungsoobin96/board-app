# RFP: Conduit Lite — 초보자용 미니 블로그 플랫폼

> 본 문서는 자율개발 툴킷(`/install-toolkit`)이 자동 인식할 수 있도록 작성된 제안 요청서(Request For Proposal)입니다.
> 참조 스펙: https://realworld-docs.netlify.app/introduction/
> **참고:** 본 RFP는 RealWorld 원본 스펙을 **개발 입문자가 끝까지 완주할 수 있는 범위**로 축소한 버전입니다.
> 인증/팔로우/피드 같은 난이도 높은 기능은 의도적으로 제외했고, 완성 후 단계적으로 확장하는 것을 권장합니다.

---

## 1. 프로젝트 개요

### 1.1 프로젝트명
**Conduit Lite** — Medium 스타일의 미니 블로그 (RealWorld 스펙의 핵심 기능만 발췌)

### 1.2 배경 및 목적
개발을 처음 시작하는 학습자가 "DB ↔ API ↔ 화면"이라는 풀스택의 기본 흐름을 끝까지 체험하는 것이 목표.
실서비스 수준의 인증, 사용자 간 관계, 개인화 피드 등은 본 단계에서 제외하고,
**게시글과 댓글 중심의 단순한 블로그**를 완전히 동작하는 형태로 제작한다.

### 1.3 산출물 한 줄 요약
"누구나 글을 쓰고, 읽고, 댓글을 달 수 있는 태그·페이지네이션 지원 미니 블로그 웹 애플리케이션"

---

## 2. 범위 (Scope)

### 2.1 In-Scope (포함) — MVP
- 게시글 목록 조회 (최신순)
- 게시글 상세 조회
- 게시글 작성
- 게시글 수정 / 삭제 (작성자 이름 표시, 인증 없음)
- 댓글 작성 / 조회 / 삭제
- 태그 표시 (게시글에 태그 부착, 태그별 필터)
- 페이지네이션 (한 페이지당 10개)

### 2.2 Phase 2 (선택 확장 — 1차 완료 후 도전)
- 매우 단순한 회원가입/로그인 (세션 기반, bcrypt 해싱)
- 본인 글만 수정/삭제 가능하도록 권한 체크

### 2.3 Out-of-Scope (이번 프로젝트 제외)
- ❌ JWT 인증 (Phase 2의 세션 인증으로 대체)
- ❌ 사용자 팔로우 / 언팔로우
- ❌ 개인화 피드(Feed)
- ❌ 게시글 즐겨찾기(Favorite)
- ❌ 프로필 페이지
- ❌ Markdown 렌더링 (일반 텍스트만 표시)
- ❌ 이미지 업로드
- ❌ 알림, 검색 등 부가 기능

> 💡 **왜 빼는가**: 위 항목들은 RealWorld 원본의 약 60%를 차지하지만, 인증·관계 모델링·복합 쿼리 등 난이도가 급격히 올라가는 영역. 입문자가 학습 동기를 잃지 않도록 의도적으로 제외함.

---

## 3. 기능 요구사항 (Functional Requirements)

### 3.1 게시글 (Article)
- **목록 조회**: 최신순 정렬, 페이지네이션 지원.
- **태그 필터**: `?tag=javascript` 같은 쿼리로 특정 태그의 글만 조회.
- **상세 조회**: 글 본문 + 작성자명 + 작성일 + 댓글 목록 표시.
- **작성**: `title`, `body`, `author`(이름 텍스트), `tagList`(쉼표 구분) 입력.
- **수정**: 모든 필드 수정 가능. (Phase 2에서 권한 체크 추가)
- **삭제**: 삭제 시 해당 글의 댓글도 함께 제거.

### 3.2 댓글 (Comment)
- 게시글 상세 페이지에서 댓글 작성·조회·삭제.
- 작성 시 입력: `body`, `author`(이름 텍스트).
- 수정 기능은 없음.

### 3.3 태그 (Tag)
- 게시글 작성 시 태그를 쉼표로 구분해서 입력.
- 글 목록 페이지 우측에 "인기 태그" 영역으로 전체 태그 표시.
- 태그 클릭 시 해당 태그로 필터링된 목록으로 이동.

---

## 4. 페이지(라우팅) 요구사항 — Frontend

| 페이지 | URL | 설명 |
|---|---|---|
| 홈 | `/` | 글 목록 + 태그 사이드바 + 페이지네이션 |
| 태그별 글 목록 | `/?tag=:tagname` | 특정 태그 글만 |
| 글 상세 | `/article/:id` | 본문 + 댓글 + (수정/삭제 버튼) |
| 글 작성 | `/editor` | 새 글 작성 폼 |
| 글 수정 | `/editor/:id` | 기존 글 수정 폼 |

> 라우팅은 SPA의 hash 라우팅(`/#/...`)이 아닌 일반 path 라우팅을 사용한다 (학습 난이도 낮음).

---

## 5. API 명세 — Backend

> Base URL: `/api`
> 응답 포맷은 JSON. RealWorld 원본의 복잡한 응답 구조 대신 평탄한(flat) 형태를 사용한다.

### 5.1 게시글
| Method | Path | 설명 |
|---|---|---|
| GET | `/articles` | 글 목록 (`?tag=`, `?page=`, `?limit=` 지원) |
| GET | `/articles/:id` | 글 상세 |
| POST | `/articles` | 글 작성 |
| PUT | `/articles/:id` | 글 수정 |
| DELETE | `/articles/:id` | 글 삭제 |

### 5.2 댓글
| Method | Path | 설명 |
|---|---|---|
| GET | `/articles/:id/comments` | 댓글 목록 |
| POST | `/articles/:id/comments` | 댓글 작성 |
| DELETE | `/articles/:id/comments/:commentId` | 댓글 삭제 |

### 5.3 태그
| Method | Path | 설명 |
|---|---|---|
| GET | `/tags` | 전체 태그 목록 (사용 빈도순) |

### 5.4 데이터 모델 (참고용)
```
Article { id, title, body, author, createdAt, updatedAt, tags[] }
Comment { id, articleId, body, author, createdAt }
Tag     { name, count }
```

---

## 6. 비기능 요구사항 (Non-Functional Requirements)

### 6.1 디자인 / UI
- 깔끔하고 읽기 좋은 기본 스타일 (CSS 프레임워크 자유, Bootstrap/Tailwind 권장).
- 모바일에서도 깨지지 않는 반응형 레이아웃.

### 6.2 데이터베이스
- **SQLite 권장** (별도 설치 없이 파일 하나로 동작).
- ORM 사용 권장 (학습용으로 적합).

### 6.3 에러 처리
- 존재하지 않는 글/댓글 요청 시 404.
- 검증 실패(빈 제목 등) 시 400 + 에러 메시지.
- 서버 오류 시 500 + 일반 메시지 (스택 트레이스 노출 금지).

### 6.4 문서화
- `README.md`에 다음을 명시:
  - 프로젝트 개요
  - 설치 방법 (단계별 명령어)
  - 실행 방법
  - 폴더 구조 설명
- 초보자가 처음 보더라도 따라할 수 있게 친절하게 작성.

### 6.5 학습 친화성
- 코드에 핵심 부분 한국어 주석 포함.
- 복잡한 추상화/디자인 패턴 자제, 직관적인 구조 우선.

---

## 7. 기술 스택 (권장)

> 입문자가 자료를 찾기 쉬운 인기 스택 기준.

- **Frontend**: React + Vite (또는 순수 HTML/JS도 가능)
- **Backend**: Node.js + Express
- **DB**: SQLite + Prisma ORM
- **언어**: JavaScript (또는 TypeScript 도전)

---

## 8. 산출물 (Deliverables)

1. 동작하는 백엔드 서버 코드
2. 동작하는 프론트엔드 코드
3. SQLite DB 파일 (초기 시드 데이터 포함)
4. `README.md` (초보자 친화적 설명)
5. `.env.example` (필요 시)

---

## 9. 일정 (Milestones)

| 단계 | 내용 | 예상 기간 |
|---|---|---|
| M1 | 환경 세팅 / DB 스키마 / 게시글 API | 3~4일 |
| M2 | 댓글 API / 태그 API | 2일 |
| M3 | 프론트엔드 글 목록 + 상세 화면 | 3일 |
| M4 | 글 작성/수정/삭제 화면 + 댓글 UI | 3일 |
| M5 | 페이지네이션 + 태그 필터 + 디자인 정리 | 2일 |
| M6 | README 작성 + 버그 수정 | 1일 |
| **총** | | **약 2주** |

---

## 10. 평가 기준 (Acceptance Criteria)

- [ ] 글을 작성하면 목록에 즉시 나타난다.
- [ ] 글 상세 페이지에서 댓글을 달 수 있다.
- [ ] 태그를 클릭하면 해당 태그의 글만 보인다.
- [ ] 페이지네이션이 동작한다 (1페이지 → 2페이지 이동 가능).
- [ ] 글 수정 후 다시 들어가면 수정된 내용이 보인다.
- [ ] 글 삭제 시 목록에서 사라지고, 댓글도 함께 제거된다.
- [ ] README의 절차만으로 새 컴퓨터에서 로컬 실행이 가능하다.

---

## 11. 향후 확장 로드맵 (학습 단계별)

이 프로젝트를 완성한 후 단계적으로 추가하면 좋은 기능들:

1. **세션 기반 간단 로그인** (bcrypt + express-session)
2. **본인 글만 수정/삭제** (권한 체크)
3. **프로필 페이지** (사용자별 작성 글 모아 보기)
4. **JWT 인증으로 전환** (현대적 인증 방식 학습)
5. **팔로우 / 언팔로우 + 개인화 피드**
6. **즐겨찾기(Favorite)**
7. **Markdown 본문 렌더링**

각 단계는 이전 단계가 완성된 후 한 번에 하나씩 추가하는 것을 권장.

---

## 12. 참고 문서 (원본 스펙)

- RealWorld Introduction: https://realworld-docs.netlify.app/introduction/
- Features: https://realworld-docs.netlify.app/implementation-creation/features
- Frontend Routing: https://realworld-docs.netlify.app/specifications/frontend/routing
- Backend Endpoints: https://realworld-docs.netlify.app/specifications/backend/endpoints
- 공식 GitHub: https://github.com/gothinkster/realworld
