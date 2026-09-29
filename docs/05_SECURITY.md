# Security & Data Access Governance

- **Purpose**: Defines threat modeling, role-based access control (RBAC), cryptographic standards, PII protection, privacy compliance, and phase-by-phase security acceptance criteria for CampusCare.
- **Status**: Draft v1
- **Last Updated**: 2026-09-29
- **Depends On**: `/docs/01_PRD.md`, `/docs/02_TRD.md`, `/docs/04_ARCHITECTURE.md`

---

## 1. Assets, Threat Actors & STRIDE Threat Model

### 1.1 Critical Assets
1. **Student Pseudonymity Barrier**: The cryptographic boundary mapping student real institutional emails to Anonymous IDs (`anon_xxxx`).
2. **Clinical Notes Database**: Highly sensitive mental health intake records, psychiatric observations, and diagnostic severity flags in `public.clinical_notes`.
3. **WebRTC Video/Audio Streams**: Real-time therapy consultations between counselors and vulnerable students.
4. **Backend Cryptographic Secrets**: `JWT_SECRET`, `AGORA_APP_CERTIFICATE`, `SUPABASE_SERVICE_ROLE_KEY`.

### 1.2 Threat Actors
- **External Internet Attacker**: Attempts unauthorized data extraction, credential stuffing, or WebRTC room eavesdropping.
- **Curious Campus Peer**: Attempts to de-anonymize classmates participating in the community forum or counseling queue.
- **Unauthorized Faculty Member**: Tries to access student psychological records to influence academic evaluations.

### 1.3 STRIDE Threat Modeling & Mitigations

| STRIDE Category | Threat Description | Inherent Risk | Implemented Engineering Mitigation |
|---|---|---|---|
| **Spoofing** | Attacker impersonates an official campus counselor or another student's Anonymous ID. | Critical | Bcrypt password verification + signed JWT tokens carrying verified role and user ID claims. |
| **Tampering** | Malicious client alters appointment status, severity levels, or forum upvote counts directly in transit. | High | Parameter validation on all mutation endpoints; PostgreSQL Row-Level Security and unique relational constraints. |
| **Repudiation** | Counselor or student denies attending a scheduled counseling session. | Medium | Immutable session timestamps in `public.video_calls` and `appointments` recording room lifecycle events. |
| **Information Disclosure** | Student cleartext email or name leaked on public forum feed or chat endpoints. | Critical | Complete isolation: API serializers explicitly strip `email` and `password_hash` from public endpoints. |
| **Denial of Service** | Bot floods Agora token generation endpoint or forum post creation. | High | Rate limiting middleware limiting requests per IP, strict payload length caps (e.g. 5,000 char forum bodies). |
| **Elevation of Privilege** | Student sends API payload attempting to write to `/api/bookings/:id/notes` or read other students' case files. | Critical | Strict role middleware verifying `req.user.role === 'counselor'` before processing clinical note endpoints. |

---

## 2. Role-Based Access Control Matrix (RBAC)

| Resource | Action | Unauthenticated Visitor | Authenticated Student | Verified Counselor | Welfare Admin |
|---|---|---|---|---|---|
| **Public Landing & Hotlines** | Read | Allow | Allow | Allow | Allow |
| **Student Own Profile** | Read / Write | Deny | Allow (Self Only) | Allow (Read Only) | Deny |
| **Counseling Appointments** | Create | Deny | Allow (Self Only) | Deny | Deny |
| **Counseling Appointments** | Update Status | Deny | Allow (Cancel Self) | Allow (All Statuses) | Deny |
| **Clinical Notes** | Read / Write | Deny | **Deny (Strict)** | **Allow (Full Access)** | Deny |
| **WebRTC Agora Token** | Generate | Deny | Allow (Assigned Slot) | Allow | Deny |
| **Forum Posts & Comments** | Create / Read | Read Only | Allow | Allow | Allow (Moderate) |
| **Forum Likes** | Toggle | Deny | Allow (Self ID) | Allow (Self ID) | Deny |
| **Institutional Analytics** | Aggregate Read | Deny | Deny | Allow (Departmental) | Allow (Full) |

---

## 3. Session & Token Handling

- **JWT Signing**: HMAC-SHA256 signature using a dedicated minimum 256-bit cryptographically random secret (`JWT_SECRET`).
- **Token Lifespan**: Access tokens configured with a strict expiration window of `7 days`.
- **Payload Sanitization**: JWT claims carry exclusively `{ id, anonId, email, role }`; passwords and sensitive clinical markers are strictly excluded.
- **Client Storage**: Tokens persisted in browser `localStorage` under `campuscare_auth_token`, transmitted via the HTTP `Authorization: Bearer <token>` header.

---

## 4. Input Validation & Output Encoding

- **Email Whitelisting**: Registration strictly validates Google Mail (`@gmail.com`) or institutional (`@ltce.in`) domains, rejecting disposable email addresses.
- **SQL Injection Prevention**: All database operations execute through Supabase client parameterized queries; zero concatenated raw SQL strings.
- **Cross-Site Scripting (XSS)**: React JSX automatically performs HTML entity encoding before rendering dynamic text; forum post bodies are sanitized before DOM insertion.
- **Payload Caps**: Max body limit enforced at `100 kB` for JSON payloads on Express gateway.

---

## 5. PII Classification & Data Privacy Governance

| Data Element | Classification | Storage Location | Retention / Masking Policy |
|---|---|---|---|
| **Student Institutional Email** | Confidential PII | `public.users` | Isolated; never returned in public community endpoints. |
| **Password** | Restricted Auth Secret | `public.users` | One-way Bcrypt salt + hash (work factor 10); cleartext never written to logs or disk. |
| **Anonymous ID (`anon_xxxx`)** | Pseudonymous Identifier | All tables | Publicly visible in forum; decoupled from university roll registers. |
| **Clinical Observations & Severity** | Sensitive Health Data | `public.clinical_notes` | Restricted to counselor role; encrypted at rest via AES-256 in Supabase. |
| **WebRTC Video/Audio Payload** | Ephemeral Transit | Volatile Memory | **Zero retention**: Media packets stream peer-to-peer over Agora SD-RTN without recording. |

---

## 6. Privacy Law Compliance (India DPDP Act 2023 & GDPR)

> **Notice**: *The following analysis represents technical design best practices and must be verified with a qualified institutional legal professional.*

1. **Digital Personal Data Protection (DPDP) Act 2023 (India)**:
   - **Consent Architecture**: Students provide explicit digital consent before scheduling their first clinical session.
   - **Purpose Limitation**: Student emails are collected solely to prevent duplicate accounts and are never shared with academic grading faculties.
   - **Right to Erasure (Grievance Redressal)**: Students may request deletion of their account profile; upon confirmation, all relational records in `profiles` and `users` are purged via `ON DELETE CASCADE`.
2. **GDPR Alignment**:
   - Built-in data pseudonymization by design satisfies GDPR Article 32 (Security of processing).

---

## 7. OWASP Top 10 Mitigation Matrix

| OWASP Vulnerability | Vulnerability Context in CampusCare | Engineering Mitigation |
|---|---|---|
| **A01: Broken Access Control** | Student manipulating appointment ID to read another's intake notes. | Server verifies appointment `student_anon_id === req.user.anonId` or counselor role. |
| **A02: Cryptographic Failures** | Storing cleartext passwords or using weak fallback JWT keys. | Enforced Bcrypt work factor 10; CI flags any deployment using insecure fallback secret. |
| **A03: Injection** | SQL injection in forum search filters. | Parameterized queries in Supabase; regex validation on search keywords. |
| **A04: Insecure Design** | Eavesdropper entering an active counseling video call. | WebRTC rooms require short-lived HMAC signed tokens issued exclusively to verified participants. |
| **A05: Security Misconfiguration** | Exposed Supabase Service Role key in frontend bundle. | Strict environment separation: `VITE_*` keys contain exclusively the public anon key. |
| **A07: Identification & Auth Failures** | Brute forcing counselor password. | Rate limiting on `/api/auth/login` (maximum 5 failed attempts per 15-minute window). |

---

## 8. Security Acceptance Checklist per Phase

### Phase 0 - Foundation
- [ ] No secrets or credentials committed to Git history (`.gitignore` verifies `.env` exclusion).
- [ ] Automated security linting with `npm audit` integrated into CI pipeline.

### Phase 1 - Authentication & Scheduling
- [ ] Passwords stored strictly as Bcrypt hashes (verified work factor 10).
- [ ] Protected routes (`/counselor-notes`, `/counselor/dashboard`) reject unauthenticated and non-counselor tokens with HTTP 401/403.
- [ ] Student Anonymous ID generation produces high-entropy non-deterministic strings.

### Phase 2 - WebRTC Video Consulting
- [ ] Agora token generation requires valid authenticated user session.
- [ ] Tokens enforce channel name and numeric UID binding with max 3600s TTL.
- [ ] Camera hardware stream terminates completely when call ends or unmounts.

### Phase 3 - Community & Clinical Notes
- [ ] Clinical notes endpoint strictly restricted to `role === 'counselor'`.
- [ ] Forum posts sanitize all user markup to prevent stored XSS attacks.
- [ ] Like counter updates enforce unique composite constraint `(user_anon_id, post_id)`.
