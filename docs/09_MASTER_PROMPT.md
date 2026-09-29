# Autonomous Agent Session Master Prompt

- **Purpose**: Paste-ready orchestration prompt driving autonomous AI coding agents across all development, testing, and phase-gate review sessions for CampusCare.
- **Status**: Draft v1
- **Last Updated**: 2026-09-29
- **Depends On**: `/docs/00_INDEX.md` through `/docs/08_PHASES.md`

---

## Copy-Paste Prompt Template for AI Coding Sessions

```markdown
### 🚀 CampusCare Engineering Session Directive

#### CURRENT PROJECT STATUS
- **Project Name**: CampusCare (Student Mental Wellness & Support Platform)
- **Current Phase**: Phase 3 (Production MVP Completion)
- **Last Completed Ticket**: T-014 (Self-Care Psychoeducational Media Library)
- **Next Ticket in Queue**: T-002 (CI/CD Pipeline & Automated Quality Gate Setup)
- **Active Blockers**: None.

---

#### 1. MANDATORY READING ORDER
Before inspecting code or executing commands, you must read the following documentation files in exact sequence:
1. `/docs/07_RULES.md` — The AI Agent Constitution (Stack locks, strict prohibitions, Definition of Done).
2. `/docs/01_PRD.md` — Product requirements, user personas, and acceptance criteria.
3. `/docs/02_TRD.md` — Technical stack justifications, performance budgets, and environment configs.
4. `/docs/03_UIUX.md` — Design tokens, component states, and screen specifications.
5. `/docs/04_ARCHITECTURE.md` — System topology, ERD schemas, and REST API contracts.
6. `/docs/05_SECURITY.md` — STRIDE threat mitigations, RBAC rules, and privacy compliance.
7. `/docs/06_TICKETS.md` — Engineering ticket backlog and traceability matrix.
8. `/docs/08_PHASES.md` — Phase delivery milestones and exit criteria.

---

#### 2. WORKING PROTOCOL (ONE TICKET PER CYCLE)
For every development iteration, you must strictly adhere to this five-step cycle:
1. **Identify**: Select the next uncompleted ticket (`TODO` status) in the active phase from `/docs/06_TICKETS.md`.
2. **Restate Plan**: Output a brief implementation plan in **5 bullets or fewer** citing specific file paths and acceptance criteria.
3. **Implement**: Write or modify ONLY the code required for that specific ticket. Do not touch unrelated files or refactor adjacent logic.
4. **Verify**:
   - Run linting and automated tests.
   - Run `npm run build` and ensure exit code 0 with zero bundling warnings.
5. **Update & Report**:
   - Update the ticket status in `/docs/06_TICKETS.md` to `Completed`.
   - Output the standard progress report defined in `/docs/07_RULES.md` Section 9.
   - Stop and wait for my instruction before proceeding to the next ticket.

---

#### 3. PHASE GATE PROTOCOL
When all tickets within the active phase reach `Completed`:
1. Do not start the next phase automatically.
2. Execute the phase exit criteria and demo script defined in `/docs/08_PHASES.md`.
3. Report the exit verification results in a concise summary table.
4. Stop and request explicit approval: *"Phase N exit criteria verified. Please approve to unlock Phase N+1."*

---

#### 4. CONFLICT & UNCERTAINTY RULE
If you encounter any contradiction between documentation files, an underspecified requirement, or an open question:
- **STOP immediately**. Do not guess or make assumptions.
- State the exact conflict (citing document paths and line ranges).
- Propose a concrete documentation resolution.
- Wait for my written confirmation before touching any code.

---

#### 5. SESSION RESUME INSTRUCTIONS
If starting in a new conversation context:
1. Inspect `git status` and `git log -n 3` to verify repository cleanliness.
2. Read the STATUS block above and review `/docs/06_TICKETS.md` to confirm the next ticket in queue.
3. Verify that background servers (`npm run dev:all`) are active or launch them if stopped.
4. Begin the next ticket following the Working Protocol.
```
