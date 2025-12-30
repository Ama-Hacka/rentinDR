## MVP Scope
- Upload CSV/JSON exports from Google Admin and Microsoft Entra.
- Parse, normalize, and score user activity; compute per-user monthly cost and potential savings if deactivated, archived, or converted to lower-cost states.
- Filter by role/OU and inactivity thresholds; export recommended actions.

## Supported Inputs
- Google Workspace: Admin console “User reports” → Accounts/Apps usage CSV (last login, suspended, archived status, Drive/Gmail metrics) and Users list CSV (download/export) (https://support.google.com/a/answer/4579578, https://support.google.com/a/answer/4580176, https://support.google.com/a/answer/7348070).
- Microsoft: Entra ID sign-in logs CSV from portal or Graph-derived CSV including `lastSuccessfulSignInDateTime` / `lastSignInDateTime` / `lastNonInteractiveSignInDateTime` (https://learn.microsoft.com/en-us/graph/api/resources/signinactivity?view=graph-rest-1.0).

## Activity & State Model
- Google fields:
  - `accounts:last_login_time`, `accounts:is_disabled`, org unit, Gmail/Drive usage counts.
  - Detect archived users: Admin console reports show archived status; archiving assigns an Archived User (AU) license (https://support.google.com/a/answer/9048836, https://support.google.com/a/answer/9048232).
- Microsoft fields:
  - `lastSuccessfulSignInDateTime` (primary), fall back to `lastSignInDateTime` or non-interactive; note eventual consistency (may lag 24–72h) (signInActivity doc above).
  - Track mailbox state (shared/inactive) via admin-provided flags in upload or a mapping file.

## Cost Model (incl. Archived Users)
- Admin-configured per-seat prices by SKU:
  - Google: Active seat SKUs (Business Starter/Standard/Plus, Enterprise) and Archived User SKUs (AU). AU is lower cost than active seats; exact price configurable (AU licensing details: https://support.google.com/a/answer/9048232).
  - Microsoft: Seat SKUs (Business/E1/E3/E5), optional add-ons (EOA/Archiving). Shared mailbox (≤50GB) typically no license; advanced archive/inactive mailbox tied to E3/E5—model via config.
- Scenario projections per user:
  - Keep active (current monthly cost).
  - Suspend (note: still pays full in Google unless archived).
  - Archive (Google AU monthly cost; frees active license within ~24h) (https://support.google.com/a/answer/9048836).
  - Delete (zero license cost; include retention/backup assumptions).
  - Microsoft: Convert to shared mailbox (no seat, storage limits) or inactive mailbox (requires E3/E5; no ongoing seat cost).
- Savings = `current_cost − projected_cost` × months_remaining.

## Roles & Segmentation
- Optional role mapping table: upload CSV mapping `email → role` or `OU → role`.
- Segment results by role (housekeeping, bartender, front desk, etc.) and OU.

## UI/UX
- Upload page: drag-and-drop multiple files (Google + Microsoft), show parser status.
- Column mapper: auto-detect common headers; allow manual mapping to canonical fields (including license/SKU and archived status).
- Dashboard: filters for role/OU/threshold/state (active/suspended/archived); cards for total seats, archived seats, monthly cost, potential savings by scenario.
- Recommendations list: per-user inactivity, license, current state, suggested action (archive/delete/convert), projected savings; CSV/JSON export.

## Architecture
- Frontend: React/Next.js; client-side CSV preview; server-side processing for larger files.
- Backend: Node.js (NestJS/Express) or Python (FastAPI); CSV ingestion, normalization, scoring.
- Storage: Postgres for uploads, mappings, computed summaries.
- Auth: Email+password or SSO later; MVP single-tenant.

## Implementation Steps
1) File ingestion & schema detection for Google/Microsoft CSVs (incl. archived state/licensing fields).
2) Canonical data model: `users`, `usage_metrics`, `licenses`, `states` (active/suspended/archived), `roles`, `org_units`.
3) Mapping wizard to align columns to canonical fields; flag missing archived/licensing info.
4) Activity scoring + inactivity thresholds; edge-case handling (never signed in, service accounts).
5) Cost configuration UI and scenario calculators (active vs archived vs delete vs convert).
6) Dashboard + export of recommendations and savings.
7) Basic RBAC and audit trail.

## Difficulty & Timeline
- Difficulty: Low–medium; no external API integration.
- Time: 1–2 weeks for MVP (one engineer), depending on polish.

## Data Quality Notes
- Google reports and Users CSV support export and include archived status; AU license is separate and billed (docs linked above).
- Microsoft signInActivity can lag and omit values for never-signed-in users; handle nulls and document caveats (signInActivity doc above).

## Security & Compliance
- Encrypt uploads at rest; minimize PII; purge raw files post-processing.
- Role-based access; signed URL downloads; TLS.

## Future: API Connectors (Post-MVP)
- Google Admin SDK Reports API for automated pulls (https://developers.google.com/admin-sdk/reports/v1/guides/manage-usage-users, https://developers.google.com/admin-sdk/reports/reference/rest/v1/userUsageReport/get).
- Microsoft Graph `users?$select=signInActivity` for scheduled jobs; admin consent.

## Next Steps
- Confirm the Google/Microsoft export formats you’ll use first (Users list, Accounts, Apps usage; Entra sign-in logs).
- I’ll scaffold the upload flow, column mapping (incl. archived/licensing), and the savings scenarios, then iterate with your real exports.