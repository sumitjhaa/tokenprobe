# Next Phases — TokenProbe

## Phase 11: Documentation Refresh

Update all documentation to accurately reflect the current 219-test, P2-complete state.

### 11a — README.md Refresh
- [ ] Update architecture section to include P2 components (batch, config, JWE)
- [ ] Update badges and metrics to 219 tests
- [ ] Add P2 feature usage examples to quickstart
- [ ] Fix any stale `tokenprobe` branding references to `TokenProbe`
- **Done when:** README accurately describes all current features

### 11b — ARCHITECTURE.md Update
- [ ] Add `batch.py`, `config.py`, `jwe_decoder.py`, `unified_decoder.py` to component diagram
- [ ] Add `jwe.py` to checks layer
- [ ] Add P2 data flow diagrams (batch pipeline, JWE decryption flow)
- [ ] Update file tree to reflect current structure
- **Done when:** Architecture doc covers all P2 modules

### 11c — PRESENTATION.md Bump
- [ ] Update test count: 142 → 219
- [ ] Add P2 feature slides (custom config, batch, JWE, GitHub Action)
- [ ] Update metrics table with P2 stats
- **Done when:** Presentation matches 219-test P2-complete state

### 11d — HOW_TO_RUN.md Enhance
- [ ] Add P2 usage sections with examples:
  - [ ] Custom config with TOML (`--config`)
  - [ ] Batch analysis (`--batch`)
  - [ ] JWE token analysis
- [ ] Add GitHub Action usage section
- **Done when:** Every P2 feature has a documented usage example

### 11e — Other Docs Audit
- [ ] MODULE_REFERENCE.md: Add config, batch, jwe modules
- [ ] CONTRIBUTING.md: Update check-writing guide for P2 patterns
- [ ] SECURITY.md: Verify no gaps
- **Done when:** All 10+ docs consistent with current codebase

---

## Phase 12: Web UI (Interactive Frontend)

Build a React + Bun frontend (hosted on Vercel) with a FastAPI backend for interactive JWT analysis.

### 12a — Backend API (FastAPI)
- [ ] Create `backend/` directory with FastAPI app
- [ ] Implement API endpoints:
  - [ ] `POST /api/analyze` — Single token analysis
  - [ ] `POST /api/analyze/batch` — Batch token analysis
  - [ ] `POST /api/analyze/jwe` — JWE token analysis
  - [ ] `GET /api/config/schema` — TOML config schema
  - [ ] `POST /api/config/validate` — Validate a config
- [ ] Wrap `tokenprobe` core modules (decoder, checks, reports)
- [ ] Add CORS middleware for frontend access
- [ ] Add input validation and safety gates
- [ ] Write tests for all endpoints
- **Done when:** All API endpoints functional, tested, return proper JSON

### 12b — Frontend Scaffold (React + Bun)
- [ ] Initialize React app with Bun (`bun create react`)
- [ ] Set up Tailwind CSS for styling
- [ ] Configure `vercel.json` for static deployment
- [ ] Set up project structure:
  ```
  frontend/
  ├── src/
  │   ├── components/
  │   │   ├── Layout.tsx
  │   │   ├── Navbar.tsx
  │   │   ├── TokenInput.tsx      # Token paste/upload area
  │   │   ├── ResultsPanel.tsx    # Findings display
  │   │   ├── FindingCard.tsx     # Individual finding
  │   │   ├── SeverityBadge.tsx   # Severity indicator
  │   │   ├── ProgressBar.tsx     # Analysis progress
  │   │   └── ThemeToggle.tsx     # Dark/light mode
  │   ├── pages/
  │   │   ├── Home.tsx
  │   │   ├── BatchAnalysis.tsx
  │   │   ├── ConfigEditor.tsx
  │   │   └── About.tsx
  │   ├── api/
  │   │   └── client.ts           # API client
  │   ├── types/
  │   │   └── index.ts            # TypeScript types
  │   ├── hooks/
  │   │   ├── useAnalysis.ts
  │   │   └── useTheme.ts
  │   ├── App.tsx
  │   └── main.tsx
  ├── public/
  ├── package.json
  ├── tsconfig.json
  ├── tailwind.config.js
  └── vercel.json
  ```
- **Done when:** Dev server runs, basic layout renders

### 12c — Core UI Components
- [ ] **TokenInput**: Text area with paste detection, file upload support, sample token button
- [ ] **ResultsPanel**: Tabular/card view of findings grouped by severity
- [ ] **FindingCard**: Severity badge, title, description, remediation, collapsible details
- [ ] **ProgressBar**: Animated progress during analysis
- [ ] **ThemeToggle**: Dark/light mode with persistent preference
- [ ] **Navbar**: Navigation with links to Home, Batch, Config, About
- **Done when:** All components render with mock data

### 12d — Page Implementation
- [ ] **Home**: Token input → analyze → results (core workflow)
- [ ] **BatchAnalysis**: Upload file → list tokens → analyze all → summary table
- [ ] **ConfigEditor**: TOML editor with syntax highlighting, schema validation, sample configs
- [ ] **About**: Project info, GitHub link, usage docs
- **Done when:** All pages functional with real API calls

### 12e — API Integration
- [ ] Connect frontend to FastAPI backend
- [ ] Handle loading states (skeleton loaders)
- [ ] Handle errors (network, invalid token, server errors)
- [ ] Add request cancellation for long-running analyses
- [ ] Show real-time progress for batch analysis (SSE or polling)
- **Done when:** End-to-end analysis flow works from UI to core

### 12f — Polish & Deployment
- [ ] Responsive design (mobile-friendly)
- [ ] Loading skeletons and transitions
- [ ] Error boundaries per page
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Deploy frontend to Vercel
- [ ] Add `vercel.json` with rewrites for SPA routing
- [ ] Add deployment docs to README
- **Done when:** App deployed, accessible, tested on mobile + desktop

---

## Phase 13: Final Polish

### 13a — GitHub Action Enhancement
- [ ] Add workflow for deploying frontend to Vercel
- [ ] Add status badge for Vercel deployment

### 13b — PyPI Preparation
- [ ] Update `pyproject.toml` URLs to `sumitjhaa/tokenprobe`
- [ ] Verify package builds correctly (`hatch build`)
- [ ] Add PyPI publish workflow

### 13c — GitHub Repository Finalization
- [ ] Update repo description and topics
- [ ] Add deployment badges to README
- [ ] Final review of all files

---

## Current Status

**Total Tests:** 219 passing  
**Code Coverage:** >90% on critical paths  
**Documentation:** 10 documents (needs refresh)  
**Web UI:** Not started  
**Backend API:** Not started  
**PyPI:** Not published

## Definition of Done

1. [ ] All documentation updated to 219-test P2-complete state
2. [ ] Web UI deployed on Vercel with all core features
3. [ ] FastAPI backend wraps all tokenprobe features
4. [ ] End-to-end flow: paste token → view findings
5. [ ] Responsive design (mobile + desktop)
6. [ ] All tests passing (core + new API tests)
7. [ ] README includes deployment and usage instructions
