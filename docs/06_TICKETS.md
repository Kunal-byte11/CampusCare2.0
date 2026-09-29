# Engineering Ticket Backlog & Traceability Matrix

- **Purpose**: Defines granular, atomic engineering tickets with Given/When/Then acceptance criteria, technical dependencies, and requirements traceability for CampusCare.
- **Status**: Draft v1
- **Last Updated**: 2026-09-29
- **Depends On**: `/docs/01_PRD.md`, `/docs/02_TRD.md`, `/docs/04_ARCHITECTURE.md`, `/docs/05_SECURITY.md`

---

## 1. Ticket Backlog

### T-001: Repository Scaffold, Tooling, & Walking Skeleton
- **Type**: Chore / Setup
- **Phase**: Phase 0
- **Linked IDs**: `TR-001`, `NFR-001`
- **User Story**: As a developer, I want an initialized repository with Vite, React 19, Express 5, and design tokens so that feature tickets can be developed on a stable foundation.
- **Description**: Configure root workspace, Vite compiler, Express server skeleton with `/api/health` probe, and verify concurrent execution (`npm run dev:all`).
- **Acceptance Criteria**:
  - *Given* a fresh clone of the repository.
  - *When* `npm run dev:all` is executed.
  - *Then* Vite serves on `http://localhost:5173` and Express responds with HTTP 200 on `http://localhost:5000/api/health`.
- **Dependencies**: None.
- **Out of Scope**: Database migrations, live authentication logic.
- **Likely Files**: `package.json`, `vite.config.js`, `server/index.js`, `src/styles/tokens.css`.
- **Test Plan**: Execute `curl -s http://localhost:5000/api/health` and verify HTTP 200 JSON payload.
- **Size**: Small (S)
- **Status**: Completed

---

### T-002: CI/CD Pipeline & Automated Quality Gate Setup
- **Type**: Chore / CI
- **Phase**: Phase 0
- **Linked IDs**: `NFR-001`, `TR-001`
- **User Story**: As a software architect, I want an automated GitHub Actions CI pipeline so that broken builds or failing tests cannot be merged into `main`.
- **Description**: Create `.github/workflows/ci.yml` running linting, unit tests, and production build on every pull request.
- **Acceptance Criteria**:
  - *Given* a pull request opened against `main`.
  - *When* GitHub Actions runs.
  - *Then* the build matrix executes `eslint .`, `npm run build`, and asserts zero critical security audit failures.
- **Dependencies**: `T-001`.
- **Out of Scope**: Production cloud deployment dispatch.
- **Likely Files**: `.github/workflows/ci.yml`, `eslint.config.js`.
- **Test Plan**: Trigger CI run and verify green status checks.
- **Size**: Small (S)
- **Status**: TODO

---

### T-003: Emergency Crisis Hotline Footer Bar
- **Type**: Feature
- **Phase**: Phase 0
- **Linked IDs**: `FR-014`, `NFR-004`
- **User Story**: As a distressed student, I want instant one-tap access to national suicide prevention and campus security helplines from any screen.
- **Description**: Implement `EmergencyFooter.jsx` as a persistent, high-contrast, accessible bottom bar linking to Tele-MANAS (14416), KIRAN (1800-599-0019), and campus security.
- **Acceptance Criteria**:
  - *Given* any visitor on any page route.
  - *When* the user views the bottom of the viewport.
  - *Then* the Emergency Footer is visible with direct `tel:` action links, compliant with WCAG 2.2 contrast.
- **Dependencies**: `T-001`.
- **Out of Scope**: Geolocation emergency dispatching.
- **Likely Files**: `src/components/EmergencyFooter.jsx`, `src/App.jsx`, `src/index.css`.
- **Test Plan**: Validate `tel:14416` URI scheme and axe-core contrast check.
- **Size**: Small (S)
- **Status**: Completed

---

### T-004: Supabase DDL Migrations & Seed Configuration
- **Type**: Chore / Database
- **Phase**: Phase 1
- **Linked IDs**: `TR-001`, `TR-006`, `SEC-002`
- **User Story**: As an architect, I want the canonical database schema and seed data applied to Supabase so that all relational tables exist with RLS policies.
- **Description**: Apply `database/supabase_schema.sql` creating `users`, `profiles`, `appointments`, `clinical_notes`, `forum_posts`, `forum_comments`, `forum_likes`, `video_calls`, and `gamification_progress` tables with indexes.
- **Acceptance Criteria**:
  - *Given* an active Supabase project.
  - *When* the migration query is executed.
  - *Then* 9 relational tables are created with RLS enabled, indexes active, and initial counselor (`Ms. Shahista Kazi`) seeded.
- **Dependencies**: `T-001`.
- **Out of Scope**: Application-layer API routes.
- **Likely Files**: `database/supabase_schema.sql`, `server/config/supabase.js`.
- **Test Plan**: Run SQL query verifying `table_name` count equals 9 in `information_schema.tables`.
- **Size**: Medium (M)
- **Status**: Completed

---

### T-005: Pseudonymous Authentication & Counselor Login Engine
- **Type**: Feature / Security
- **Phase**: Phase 1
- **Linked IDs**: `FR-001`, `FR-002`, `FR-003`, `TR-002`, `US-001`
- **User Story**: As a student, I want to register with my Gmail and receive an Anonymous ID so that my identity is decoupled from counseling logs.
- **Description**: Build `server/routes/auth.js` (`/register`, `/login`, `/google-sync`, `/me`), implement password hashing with Bcrypt, generate JWT tokens, and link to accessible UI modals (`Modals.jsx`).
- **Acceptance Criteria**:
  - *Given* a student submits email `student@gmail.com` and password `password123`.
  - *When* `POST /api/auth/register` executes.
  - *Then* a unique Anonymous ID is returned, password is saved as Bcrypt hash, and a signed JWT is issued with 7-day expiry.
- **Dependencies**: `T-004`.
- **Out of Scope**: Third-party SMS OTP authentication.
- **Likely Files**: `server/routes/auth.js`, `src/components/Modals.jsx`, `src/context/AuthContext.jsx`.
- **Test Plan**: Unit test register/login endpoints with valid/invalid passwords via Supertest.
- **Size**: Large (L)
- **Status**: Completed

---

### T-006: Counselor Appointment Scheduling & Roster Management
- **Type**: Feature
- **Phase**: Phase 1
- **Linked IDs**: `FR-004`, `FR-005`, `US-002`
- **User Story**: As a student, I want to reserve a counseling slot, and as a counselor, I want to view my appointments roster and update statuses.
- **Description**: Build `server/routes/bookings.js` (`POST /api/bookings`, `GET /api/bookings`, `PATCH /api/bookings/:id/status`) and the dual-persona UI page in `src/pages/Booking.jsx`.
- **Acceptance Criteria**:
  - *Given* an authenticated student on `/booking`.
  - *When* a slot is selected and submitted.
  - *Then* a row is inserted in `appointments` with status `'confirmed'`; counselor logging in sees the row and can update status to `'completed'`.
- **Dependencies**: `T-005`.
- **Out of Scope**: Google Calendar bidirectional sync.
- **Likely Files**: `server/routes/bookings.js`, `src/pages/Booking.jsx`.
- **Test Plan**: Create appointment via API, verify presence in counselor roster query.
- **Size**: Large (L)
- **Status**: Completed

---

### T-007: Agora WebRTC Video Call Room Interface & Single-Laptop Testing
- **Type**: Feature
- **Phase**: Phase 2
- **Linked IDs**: `FR-006`, `FR-007`, `FR-008`, `TR-004`, `TR-005`, `US-003`
- **User Story**: As a student and counselor, I want a 1-on-1 video call room with local preview, screen sharing, and automatic single-laptop virtual camera fallback so that we can hold sessions reliably.
- **Description**: Implement `src/pages/VideoCall.jsx` using Agora Web SDK, dedicated `RemoteVideoPlayer` and `LocalVideoPlayer` ref components, and synthetic canvas video fallback when camera hardware is in use.
- **Acceptance Criteria**:
  - *Given* an authenticated user on `/video-call?channel=test-room`.
  - *When* the user clicks "Enter Video Call".
  - *Then* client connects to Agora, publishes audio/video, renders remote video in primary canvas, and displays local video in PiP. If physical webcam is locked by another tab, the animated synthetic video track is streamed automatically.
- **Dependencies**: `T-001`, `T-005`.
- **Out of Scope**: Multi-party group video grids (> 2 participants).
- **Likely Files**: `src/pages/VideoCall.jsx`, `index.html`.
- **Test Plan**: Open Tab 1 and Tab 2 with identical room name; assert two-way WebRTC stream delivery without hardware lock crash.
- **Size**: Large (L)
- **Status**: Completed

---

### T-008: Server-Side Agora RTC Token Generation Gateway
- **Type**: Feature / Security
- **Phase**: Phase 2
- **Linked IDs**: `FR-006`, `TR-003`, `SEC-004`
- **User Story**: As a platform architect, I want video rooms secured by server-generated HMAC tokens so that unauthorized participants cannot eavesdrop.
- **Description**: Create `server/routes/agora.js` importing `agora-token`, building tokens via `RtcTokenBuilder.buildTokenWithUid` with 3600s TTL.
- **Acceptance Criteria**:
  - *Given* a request to `GET /api/agora/token?channelName=room1&uid=123`.
  - *When* the endpoint executes.
  - *Then* it returns HTTP 200 with signed token string, valid expiration timestamp, and matching channel/uid.
- **Dependencies**: `T-001`.
- **Out of Scope**: Agora Cloud Recording API.
- **Likely Files**: `server/routes/agora.js`, `server/index.js`.
- **Test Plan**: Unit test verifying token signature verification against Agora App Certificate.
- **Size**: Medium (M)
- **Status**: Completed

---

### T-009: Counselor Clinical Case Files & Diagnostic Notes
- **Type**: Feature
- **Phase**: Phase 2
- **Linked IDs**: `FR-009`, `US-004`
- **User Story**: As a campus counselor, I want to file diagnostic session notes linked to a student's Anonymous ID so that longitudinal care is documented securely.
- **Description**: Implement clinical notes endpoints and the UI in `src/pages/CounselorNotes.jsx`, persisting severity, observations, and action plan to `public.clinical_notes`.
- **Acceptance Criteria**:
  - *Given* an authenticated user with `role = 'counselor'`.
  - *When* clinical observations are saved for student `anon_9x1b2c`.
  - *Then* the record is saved to `clinical_notes`, accessible strictly by counselors.
- **Dependencies**: `T-005`.
- **Out of Scope**: Automated ICD-10 medical billing code generation.
- **Likely Files**: `server/routes/bookings.js`, `src/pages/CounselorNotes.jsx`.
- **Test Plan**: Supertest asserting student token receives HTTP 403 on clinical notes route.
- **Size**: Medium (M)
- **Status**: Completed

---

### T-010: Community Forum API & Database Persistence
- **Type**: Feature
- **Phase**: Phase 3
- **Linked IDs**: `FR-010`, `FR-011`, `FR-012`, `TR-006`, `US-005`
- **User Story**: As a student, I want a REST API to create posts, write threaded comments, and toggle upvotes safely.
- **Description**: Implement `server/routes/forum.js` connecting to `forum_posts`, `forum_comments`, and `forum_likes` with sorting (`recent`, `popular`) and tag filtering.
- **Acceptance Criteria**:
  - *Given* an authenticated student post request.
  - *When* `POST /api/forum/posts` and `POST /api/forum/posts/:id/like` are called.
  - *Then* records are created and like counters increment/decrement idempotently.
- **Dependencies**: `T-004`, `T-005`.
- **Out of Scope**: Rich-text WYSIWYG video embed editor.
- **Likely Files**: `server/routes/forum.js`, `server/index.js`.
- **Test Plan**: Integration test for post creation, commenting, and duplicate upvote prevention.
- **Size**: Medium (M)
- **Status**: Completed

---

### T-011: Enhanced Forum UI & Interactive Discussion Threading
- **Type**: Feature
- **Phase**: Phase 3
- **Linked IDs**: `FR-010`, `FR-011`, `FR-012`, `US-005`
- **User Story**: As a student, I want an intuitive discussion feed with tag filtering, search, and threaded comment views.
- **Description**: Build the enhanced forum interface in `src/pages/Forum.jsx` with Reddit-style upvote cards, color-coded tag badges, search bar, and slide-open post creator.
- **Acceptance Criteria**:
  - *Given* a student on `/forum`.
  - *When* filtering by tag `Anxiety` or typing a search term.
  - *Then* the feed dynamically updates; clicking a post opens detailed view with comment submission form.
- **Dependencies**: `T-010`.
- **Out of Scope**: Direct peer-to-peer private direct messaging (DMs).
- **Likely Files**: `src/pages/Forum.jsx`.
- **Test Plan**: Component test verifying tag filtering and comment rendering.
- **Size**: Large (L)
- **Status**: Completed

---

### T-012: 24/7 AI Mental Health Chatbot & De-escalation Pacing
- **Type**: Feature
- **Phase**: Phase 3
- **Linked IDs**: `FR-013`, `NFR-004`
- **User Story**: As a distressed student, I want an AI conversational partner that validates my feelings and guides me through calming exercises.
- **Description**: Implement `src/pages/Chatbot.jsx` featuring empathetic active listening responses, grounding techniques, and de-escalation protocol recommendations.
- **Acceptance Criteria**:
  - *Given* an authenticated student on `/chatbot`.
  - *When* the student sends a message expressing exam panic.
  - *Then* the chatbot responds empathetically within 1 second and suggests a 4-7-8 breathing exercise.
- **Dependencies**: `T-001`, `T-005`.
- **Out of Scope**: Fine-tuning proprietary LLM model weights.
- **Likely Files**: `src/pages/Chatbot.jsx`.
- **Test Plan**: Verify message stream append and autoscroll functionality.
- **Size**: Medium (M)
- **Status**: Completed

---

### T-013: Wellness Gamification Engine & Interactive 4-7-8 Breathing Pacer
- **Type**: Feature
- **Phase**: Phase 3
- **Linked IDs**: `FR-015`, `FR-016`
- **User Story**: As a student, I want to track daily wellness habits and follow an animated breathing pacer so that I build resilience against stress.
- **Description**: Implement `server/routes/gamification.js` and `src/pages/Gamification.jsx` with XP levels, check-in streaks, milestone badges, and an animated breathing pacer circle.
- **Acceptance Criteria**:
  - *Given* a student on `/gamification`.
  - *When* the user logs an exercise or completes a breathing session.
  - *Then* XP increases, streak count updates, and unlocked badges render with celebratory feedback.
- **Dependencies**: `T-004`, `T-005`.
- **Out of Scope**: Leaderboards (explicitly avoided to prevent unhealthy competition).
- **Likely Files**: `server/routes/gamification.js`, `src/pages/Gamification.jsx`.
- **Test Plan**: Unit test XP level threshold calculations and badge trigger logic.
- **Size**: Medium (M)
- **Status**: Completed

---

### T-014: Self-Care Psychoeducational Media Library
- **Type**: Feature
- **Phase**: Phase 3
- **Linked IDs**: `FR-017`
- **User Story**: As a student, I want to access guided meditation audios and reading guides categorized by topic so that I can practice self-care independently.
- **Description**: Build `src/pages/Resources.jsx` with category filters (Videos, Audios, Exercises, Reading), search filter, and responsive media preview panel.
- **Acceptance Criteria**:
  - *Given* a student on `/resources`.
  - *When* selecting format filter "Audio".
  - *Then* the grid updates to display audio relaxation resources with duration tags.
- **Dependencies**: `T-001`.
- **Out of Scope**: Native in-app video encoding pipeline.
- **Likely Files**: `src/pages/Resources.jsx`.
- **Test Plan**: Verify media selection updates preview panel state.
- **Size**: Small (S)
- **Status**: Completed

---

### T-015: Institutional Welfare Analytics & Administrative Metrics
- **Type**: Feature / Analytics
- **Phase**: Phase 4 (Post-MVP)
- **Linked IDs**: `FR-018`
- **User Story**: As the Dean of Student Welfare, I want aggregated monthly consultation volume and stress categories so that institutional counseling budgets can be justified.
- **Description**: Create administrative endpoint and dashboard aggregating appointment counts and stress categories without student identifiers.
- **Acceptance Criteria**:
  - *Given* an authenticated administrator.
  - *When* requesting monthly analytics.
  - *Then* aggregated statistics are returned with 0 student PII or Anonymous IDs exposed.
- **Dependencies**: `T-006`, `T-009`.
- **Out of Scope**: Predictive machine learning dropout forecasting.
- **Likely Files**: `server/routes/bookings.js`.
- **Test Plan**: Assert zero student records or email addresses present in output payload.
- **Size**: Medium (M)
- **Status**: TODO (Post-MVP)

---

## 2. Requirements Traceability Matrix

Every single Must and Should requirement from `01_PRD.md` is strictly traced to one or more engineering tickets:

| Requirement ID | Priority | Description Summary | Linked Engineering Ticket(s) | Status |
|---|---|---|---|---|
| **FR-001** | Must | Pseudonymous student registration & Anonymous ID generation | `T-004`, `T-005` | Completed |
| **FR-002** | Must | Student authentication via Anonymous ID / Email + Bcrypt | `T-004`, `T-005` | Completed |
| **FR-003** | Must | Verified campus counselor credential login & role gate | `T-004`, `T-005` | Completed |
| **FR-004** | Must | Counselor appointment reservation & intake reason entry | `T-006` | Completed |
| **FR-005** | Must | Counselor appointment roster management & status updates | `T-006` | Completed |
| **FR-006** | Must | Agora WebRTC 1-on-1 virtual counseling session establishment | `T-007`, `T-008` | Completed |
| **FR-007** | Must | Video call media controls (mic, camera, screenshare, timer) | `T-007` | Completed |
| **FR-008** | Must | Automatic synthetic video fallback for 1-laptop tab testing | `T-007` | Completed |
| **FR-009** | Must | Counselor clinical case notes & severity logging | `T-009` | Completed |
| **FR-010** | Must | Community forum post creation with category tagging | `T-010`, `T-011` | Completed |
| **FR-011** | Must | Threaded forum comments & unique upvote enforcement | `T-010`, `T-011` | Completed |
| **FR-012** | Must | Real-time forum search, category filter, and sorting | `T-010`, `T-011` | Completed |
| **FR-013** | Must | AI Mental Health Chatbot conversational de-escalation | `T-012` | Completed |
| **FR-014** | Must | Persistent Emergency Crisis Hotline footer bar | `T-003` | Completed |
| **FR-015** | Should | Wellness gamification XP, levels, badges, and streaks | `T-013` | Completed |
| **FR-016** | Should | Interactive 4-7-8 breathing pacer with animation cycles | `T-013` | Completed |
| **FR-017** | Should | Multimedia psychoeducational self-care resource library | `T-014` | Completed |
| **FR-018** | Could | Aggregated de-identified institutional welfare analytics | `T-015` | Post-MVP |
