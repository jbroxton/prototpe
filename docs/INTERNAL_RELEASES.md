User Story

- As a PM, I can group user stories into named releases within a project (e.g., Auth → Release 1: Initial login; Release 2: OAuth) so I can iterate without changing the project and view progress per release.

Acceptance Criteria

- [x] Each project can have multiple releases with unique sequential numbers (R1, R2, …).
- [x] A release has name, status, optional notes/dates; status values reuse existing statuses.
- [x] User stories can be assigned to a release or left in Backlog (unassigned).
- [x] UI shows a Release filter (All, Backlog, per-release) on the project unified view.
- [x] UI adds a Release column where each story can be moved between releases or Backlog.
- [x] A simple “+ Release” action creates the next numbered release for the project.
- [x] API provides endpoints to list and manage releases and to assign stories.
- [x] Jest tests cover creating a release, assigning a story, and verifying API responses.

Implementation Notes

- DB: Added `Release` model (Prisma) with relation to `Project`, and optional `releaseId` on `UserStory`.
- API: New `GET/POST /api/internal-projects/releases` to list/manage releases; story API updated to accept `releaseId` on add/update.
- UI: Project unified view (`/internal-projects/[projectId]/unified`) now includes Release filter, Release column, and “+ Release” button.

Migration

- Run Prisma migrate to apply schema changes for the new `Release` model and `UserStory.releaseId`.

