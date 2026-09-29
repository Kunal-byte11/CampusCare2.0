# The Autonomous AI Agent Constitution & Engineering Guardrails

- **Purpose**: Strict technical invariants, approved stack locks, code style guidelines, security boundaries, and Definition of Done for all AI coding agents working on CampusCare.
- **Status**: Draft v1
- **Last Updated**: 2026-09-29
- **Depends On**: `/docs/00_INDEX.md`, `/docs/02_TRD.md`

---

## 1. The ALWAYS Rules (Mandatory Invariants)

1. **ALWAYS check `/docs/07_RULES.md` and `/docs/09_MASTER_PROMPT.md`** before touching any file.
2. **ALWAYS work on exactly ONE ticket at a time** from `/docs/06_TICKETS.md`, completing it fully before starting another.
3. **ALWAYS verify builds cleanly** (`npm run build`) before declaring any ticket complete.
4. **ALWAYS use existing CSS custom property tokens** (`--brand-blue`, `--surface`, `--page-bg`, etc.) from `/src/styles/tokens.css`.
5. **ALWAYS use parameterized database queries**; never concatenate strings into SQL statements.
6. **ALWAYS clean up WebRTC media tracks and interval timers** in React component `useEffect` return handlers.
7. **ALWAYS preserve student pseudonymity**; never log cleartext emails or passwords in backend console outputs.

---

## 2. The NEVER Rules (Strict Prohibitions)

1. **NEVER edit `.env` or `server/.env` with invented values**; only read variables documented in `/docs/02_TRD.md`.
2. **NEVER manually edit `package-lock.json`** or lockfiles directly.
3. **NEVER mutate applied SQL migration files** in `/database`; create new incremental migrations if schema changes are required.
4. **NEVER add ANY new npm package or third-party dependency** without explicit user permission.
5. **NEVER install Tailwind CSS, Redux, or heavy CSS frameworks** into this codebase; adhere to the native CSS token architecture.
6. **NEVER delete, comment out, or weaken existing automated tests** to make a failing test pass.
7. **NEVER introduce unrelated refactoring, code formatting sweeps, or scope creep** outside the assigned ticket.
8. **NEVER expose raw backend stack traces or database errors** to client API responses.

---

## 3. Technology Stack Lock

### 3.1 Approved Production Libraries

| Package Name | Approved Version | Exact Architectural Purpose |
|---|---|---|
| `react` | `^19.2.4` | Core UI view layer and component hooks. |
| `react-dom` | `^19.2.4` | DOM renderer for React SPA. |
| `react-router-dom` | `^7.13.1` | Declarative client-side routing and route protection. |
| `@supabase/supabase-js` | `^2.116.0` | Supabase cloud database and auth client. |
| `express` | `^5.2.1` | Node.js backend HTTP application gateway. |
| `agora-token` | `^2.0.3` | Server-side Agora RTC token generator. |
| `bcryptjs` | `^3.0.3` | Cryptographic password hashing and salt generation. |
| `jsonwebtoken` | `^9.0.3` | Signed stateless HMAC-SHA256 JWT authorization tokens. |
| `lucide-react` | `^1.48.0` | Accessible tree-shakeable SVG icon collection. |
| `dotenv` | `^18.0.1` | Environment variable loader for backend processes. |
| `cors` | `^2.8.6` | Cross-Origin Resource Sharing middleware. |
| `vite` | `^8.0.0` | Fast dev server and Rollup production bundler. |
| `concurrently` | `^9.2.1` | Monorepo concurrent runner for client and API server. |

### 3.2 Explicitly Banned Libraries
- **Banned**: `tailwindcss`, `styled-components`, `emotion` (Use vanilla CSS with `tokens.css`).
- **Banned**: `redux`, `mobx`, `zustand` (Use React Context API as in `AuthContext.jsx`).
- **Banned**: `axios`, `request` (Use standard native `fetch` API).
- **Banned**: `simple-peer`, `peerjs` (Use official Agora Web SDK v4 via CDN).

---

## 4. Code Style & Architectural Boundaries

1. **Module System**: Strict ES Modules (`import` / `export`) throughout both client (`src/`) and server (`server/`). CommonJS `require()` is forbidden.
2. **File Naming Conventions**:
   - React components and pages: `PascalCase.jsx` (e.g., `VideoCall.jsx`, `EmergencyFooter.jsx`).
   - Backend routes and utilities: `camelCase.js` (e.g., `agora.js`, `supabase.js`).
   - Stylesheets: `kebab-case.css` (e.g., `tokens.css`, `index.css`).
3. **Module Isolation**:
   - `src/` must never import files from `server/`.
   - `server/` must never import client files.
   - All client-server communication must occur via HTTP REST calls to `/api/*`.

---

## 5. Error Handling & Logging Standards

- **Standard API Error Response Schema**:
  ```json
  {
    "error": "Human-friendly explanation of what went wrong.",
    "code": "VALIDATION_FAILED"
  }
  ```
- **Logging Rule**: Server logs must include context (`[AUTH]`, `[AGORA]`, `[FORUM]`) with timestamp and status code. Never log raw passwords or session tokens.
- **Client Error Boundaries**: Wrap critical views (`VideoCall`, `Forum`) so runtime exceptions show a friendly recovery button instead of a blank white screen.

---

## 6. Testing & Quality Assurance Rules

1. Tests must be written inside the **same ticket** as the feature implementation.
2. Every new API endpoint must have a corresponding integration test verifying:
   - Success case (HTTP 200 or 201).
   - Validation failure case (HTTP 400).
   - Unauthorized access case (HTTP 401 or 403).
3. Under no circumstances may an agent disable or delete an existing test.

---

## 7. AI Operating Boundaries & Escalation Triggers

AI agents must **STOP and request human approval** before:
1. Adding any new dependency to `package.json`.
2. Altering existing database schemas or dropping columns.
3. Deleting any source code file.
4. Changing the public interface of any existing `/api/*` route.
5. Taking action on any requirement marked `[OPEN QUESTION]`.

---

## 8. Definition of Done (DoD) Checklist

A ticket is considered **DONE** only when all of the following criteria are satisfied:
- [ ] Code strictly satisfies all Given/When/Then acceptance criteria of the ticket.
- [ ] No approved libraries or versions have been added or mutated.
- [ ] No hardcoded credentials, test passwords, or secrets are left in code.
- [ ] Code conforms to `tokens.css` styling; zero raw hex colors invented.
- [ ] `npm run build` executes with zero compilation errors or bundling warnings.
- [ ] Automated tests pass with 100% success rate.
- [ ] The ticket status in `/docs/06_TICKETS.md` is updated to `Completed`.
- [ ] A concise progress report is presented following the standard reporting template.

---

## 9. Progress Reporting Template

After completing a ticket, the agent must report using this exact markdown format:

```markdown
### 📋 Ticket Completed: [T-xxx] <Title>

- **Linked Requirement**: [FR-xxx / TR-xxx]
- **Changes Summary**:
  - Implemented <component/route> to satisfy <acceptance criterion>.
  - Verified <test case description>.
- **Verification Evidence**:
  - Command: `npm run build` -> Exit code 0
  - Test: <test output summary>
- **Next Ticket in Queue**: [T-yyy] <Next Title>
```
