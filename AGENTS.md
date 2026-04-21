# AGENTS.md

## Project Overview
- This repository is a mobile app built with Expo, React Native, Expo Router, NativeWind, Better Auth, and Prisma.
- The current product direction follows the Nexum remake guide: most work is front-end redesign and UX polish, not broad backend rewrites.
- Treat this as a section-by-section redesign project. Make focused changes, validate them, and avoid mixing unrelated flows in the same branch or PR.

## Core Stack
- Expo managed workflow with file-based navigation through `expo-router`.
- React Native `0.83` with React `19`.
- NativeWind for utility-first styling.
- Better Auth for authentication flows, including admin and two-factor plugins.
- Prisma with PostgreSQL for persistence.
- i18n is already wired into the app and the default locale is Spanish.

## Repository Map
- `src/app`: app routes and screens. Includes auth flows, dashboard, and admin screens.
- `src/components`: shared UI building blocks such as auth forms, inputs, cards, and loading states.
- `src/lib`: app configuration, auth client/server setup, Prisma client, permissions, email helpers, and i18n setup.
- `src/app/api`: Expo API routes for auth and password-related endpoints.
- `prisma/schema.prisma`: database schema for users, sessions, accounts, verifications, and two-factor data.
- `assets`: static assets used by the mobile app.

## File And Folder Creation Rules
- This project uses a hybrid structure:
- `src/app` is route-driven and should contain screens, route groups, layouts, and API endpoints.
- `src/components` is feature-agnostic and should contain reusable visual building blocks.
- `src/lib` is for shared logic, configuration, integrations, helpers, and non-visual concerns.
- Create new files only in the layer that matches their responsibility. Do not place business logic inside route files if it can live in `src/lib`, and do not place one-off screen markup inside `src/components`.
- Prefer extending the existing structure before adding new top-level folders under `src`.

## How To Create New Screens And Routes
- New user-facing screens should live in `src/app`.
- If the screen belongs to an existing area, place it inside that route folder. Example: admin-related screens belong in `src/app/admin`.
- If a new flow has multiple related screens, create a dedicated folder for that flow inside `src/app` and keep its route files together.
- Use Expo Router conventions for route files such as `index.tsx`, `_layout.tsx`, and named route files like `profile.tsx` or `edit-profile.tsx`.
- Keep route files focused on composition, screen state, and navigation. Extract repeated UI or heavy logic out of them.

## How To Create New Components
- Reusable UI components belong in `src/components`.
- Create a new component only when the same visual block, pattern, or interaction is used in more than one place, or clearly will be reused soon.
- If a component is tightly tied to one section but still reusable within that section, keep the naming descriptive and generic enough to survive reuse.
- Follow the naming convention already defined in the guide:
- File names in `kebab-case`, for example `user-card.tsx` or `loading-skeleton.tsx`.
- Component names in `camelCase` or the repo's existing component style, but always descriptive and consistent.
- If a screen needs a temporary internal sub-block that is not reusable, prefer keeping it local to that screen file unless it starts growing or repeating.

## How To Create New Logic Files
- Shared helpers, config, integrations, auth utilities, and data-access helpers belong in `src/lib`.
- New logic files should be grouped by responsibility, not by screen name, unless the logic is truly screen-specific.
- Avoid putting API-only helpers inside UI components or route files.
- If a new piece of logic supports auth, database, email, permissions, locale, or app configuration, place it near the related existing files in `src/lib`.

## How To Create New API Files
- New API endpoints should live under `src/app/api` and follow Expo Router API naming conventions.
- Group endpoints by domain. For example, password-related endpoints should stay together under `src/app/api/password`.
- Keep route handlers thin when possible and move reusable logic into `src/lib`.

## Folder Structure Guidelines
- Do not create deep folder nesting unless the flow is large enough to justify it.
- A new folder should represent a clear domain, flow, or route area, not a vague bucket like `misc` or `utils2`.
- Prefer grouping by feature or responsibility instead of grouping by file type everywhere.
- Avoid scattering files for the same flow across unrelated folders unless they are intentionally shared.

## Structure Decision Rules
- Ask this before creating a file: is it a route, a reusable UI block, or shared logic?
- If it is a route or screen, place it in `src/app`.
- If it is reusable presentation, place it in `src/components`.
- If it is shared non-UI logic, place it in `src/lib`.
- If it only exists to support one screen and is very small, it can stay local first and be extracted later if reuse appears.

## Working Model For This Project
- Work one section or flow at a time. Do not mix multiple redesign areas in one implementation pass.
- Before editing code, analyze the target flow and understand the current behavior.
- Define the intended UI and UX direction before implementing it.
- Do not move to the next section until the current one has been reviewed and explicitly approved.
- Validate changes in the real app, not only by reading code.

## Design Rules From The Nexum Guide
- Prioritize visual consistency across colors, spacing, typography, cards, inputs, buttons, toasts, and loading states.
- Use reusable components instead of screen-specific one-off UI when a pattern appears more than once.
- Keep spacing consistent and based on a clear system such as multiples of 4 or 8.
- Preserve strong hierarchy and readability: each screen should communicate its purpose immediately.
- Every interactive element should have clear states such as default, pressed, disabled, loading, and error.
- Prefer meaningful loading skeletons over blank or spinner-only loading screens when possible.
- Use semantic design tokens instead of hardcoded values whenever a shared style is involved.
- Avoid direct style overrides of third-party libraries; customize through theme or token layers instead.
- Use copyright-safe assets and approved visual resources only.

## Development Commands
- Install dependencies with `bun install`.
- Start the app with `bun run start`.
- Run on Android with `bun run android`.
- Run on iOS with `bun run ios`.
- Run on web with `bun run web`.
- Generate the Prisma client with `bun run db:generate`.
- Create or apply a local Prisma migration with `bun run db:migrate`.
- Open Prisma Studio with `bun run db:studio`.
- Run TypeScript checks with `bun run typecheck`.

## Environment Notes
- Auth and app URLs are configured through `.env` and consumed from `src/lib/app-config.ts`.
- The app scheme defaults to `better-auth-dashboard` unless overridden by environment variables.
- If auth, verification, or reset-password flows are changed, verify both the API route behavior and the deep link/app URL behavior.

## Implementation Guardrails
- Prefer extending existing shared components in `src/components` before creating new ones.
- Keep component names descriptive and in `camelCase`; keep file names in `kebab-case`.
- Keep code strongly typed. Do not introduce `any` unless there is a clear and documented reason.
- Avoid vibe coding. Do not generate code without understanding the flow, data, and UI impact.
- Do not refactor unrelated files just because you are nearby. Redesign only what is needed for the current section.
- Keep backend and schema changes minimal unless the task explicitly requires them.
- Respect existing i18n behavior. New user-facing copy should be added thoughtfully and stay consistent with the app language strategy.

## Testing And Validation
- There is currently no dedicated `test` or `lint` script in `package.json`, so the minimum required validation is `bun run typecheck`.
- After UI changes, run the app in Expo and visually verify the affected flow on the real screen or simulator.
- After auth-related changes, verify sign-in, sign-up, email verification, password reset, and two-factor behavior as applicable.
- After schema changes, regenerate Prisma artifacts and confirm migrations are coherent.
- If you add a new validation script such as linting or automated tests, update this file so future agents run it too.

## Branching Rules
- Always branch from `development`, never from `main`.
- Branch format must be `feature/<descriptive-name>`.
- One branch should represent one concrete section or feature only.
- Do not bundle separate sections or redesign phases into the same branch.

## Commit Rules
- Use Conventional Commits.
- Valid prefixes include `feat`, `fix`, `chore`, `style`, `refactor`, and `docs`.
- `feat`: new functionality or screen.
- `fix`: bug fix.
- `chore`: maintenance work without direct product impact.
- `style`: visual-only changes with no logic impact.
- `refactor`: internal improvement without behavior changes.
- `docs`: documentation changes.
- Keep each commit focused on one coherent change. Do not mix multiple purposes in a single commit.

## Pull Request Rules
- Every PR must target `development`, never `main`.
- PRs pointing to `main` are invalid for this project.
- Open one PR per section or feature.
- Do not open a PR until the section has been validated visually in the real app.
- When multiple people collaborate, use the PR title format `[Name] - short description of the change`.
- Example: `Carlos - feat: redesign onboarding flow and splash experience`

## GitHub Workflow To Follow
- Start every new task from the latest `development` branch, never from `main`.
- Create one branch per section or functionality using the format `feature/<descriptive-name>`.
- Keep the branch focused on a single flow, section, or redesign objective.
- Commit incrementally using Conventional Commits, but keep each commit coherent and scoped.
- Before opening a PR, run `bun run typecheck` and validate the result visually in the real app, simulator, or emulator.
- Push the feature branch and open a Pull Request from `feature/<name>` into `development`.
- Never open a PR into `main`, even temporarily.
- Do not merge your own PR unless the workflow explicitly allows it and the section has already been reviewed and approved.
- After merge confirmation, start the next section again from `development`.
- Repeat the same cycle for every new section: analyze, design, implement, validate, PR to `development`, wait for approval, then continue.

## Git And GitHub Commands
- Update the local base branch before starting work:
- `git checkout development`
- `git pull origin development`
- Create a new branch from `development`:
- `git checkout -b feature/<descriptive-name>`
- Review local changes before committing:
- `git status`
- Stage the scoped changes only:
- `git add <files>`
- Create a Conventional Commit:
- `git commit -m "feat: short description"`
- Validate the branch before pushing:
- `bun run typecheck`
- Push the branch to GitHub:
- `git push -u origin feature/<descriptive-name>`
- Open the Pull Request to `development` with GitHub CLI if available:
- `gh pr create --base development --head feature/<descriptive-name> --title "[Name] - short description" --body "Summary of the section changes"`
- If `gh` is not available, push the branch and open the PR manually in GitHub, always targeting `development`.
- Check the PR status if needed:
- `gh pr status`
- After approval and merge, sync local branches again before the next section:
- `git checkout development`
- `git pull origin development`

## What To Avoid
- Do not start implementation before analysis.
- Do not advance to the next phase without explicit confirmation.
- Do not merge without review and approval.
- Do not rewrite the app from scratch when the task is a redesign of an existing section.
- Do not mix unrelated visual systems, component libraries, or competing UI patterns.
- Do not use arbitrary hardcoded tokens, colors, spacing values, or ad-hoc components when a shared solution is more appropriate.

## Recommended Agent Workflow
1. Identify the exact section or flow being changed.
2. Review the relevant screen files, shared components, and supporting lib files before editing.
3. Define the intended UX and visual direction for that section.
4. Implement only the scoped changes for that section.
5. Run `bun run typecheck`.
6. Validate the flow in Expo on a real app build, simulator, or emulator.
7. Prepare focused commits with Conventional Commit messages.
8. Open a PR from `feature/<name>` to `development`.
