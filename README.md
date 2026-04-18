# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Project Notes

- See `TODO-README.md` for current implementation tasks and follow-ups.
- See `STYLE-ARCHITECTURE-PLAN.md` for the styling refactor roadmap.

## Third-Party Tools and Services

This project currently integrates with:

- `Comcash Open API`
  - Product/auth/category/brand data source.
  - Endpoints include auth + product list/view.
- `Netlify`
  - Hosting/deploy platform.
  - Netlify Functions in `netlify/functions`.
  - Netlify Blobs (`@netlify/blobs`) for CMS preview/live content.
  - Netlify Forms for basic form capture (contact form).
- `Resend` (email API)
  - Used by cart checkout flow to email management and customer confirmations.
- `pdf-lib`
  - Used to generate checkout invoice PDF attachments.
- `Quill`
  - Rich text editor for CMS admin content editing.
- `Contentful` SDK
  - Present in dependencies (legacy/integration support).

## Branch Workflow

- Permanent branches:
  - `main`: production-ready code
  - `develop`: integration branch for ongoing work
- Feature/fix work:
  - branch from `develop` (for example `feat/...`, `fix/...`)
  - merge back into `develop` when complete
- Release flow:
  - merge `develop` into `main` when ready to ship
- Hotfix flow:
  - branch from `main` (`hotfix/...`)
  - merge hotfix into `main`
  - then merge `main` back into `develop` so both stay aligned

## Local Git Safety Hooks

This repo includes hooks in `.githooks/` to enforce safer flow:

- block direct pushes from `main` (`pre-push`)
- block merge commits while checked out on `main` (`pre-merge-commit`)

Enable them in your local clone:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-push .githooks/pre-merge-commit
```

## Animation Policy

- All UI animations must use Svelte animation/transition/motion APIs.
- Do not implement new animations using CSS-only transitions/keyframes or JavaScript-only manual animation loops.

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm init svelte@next

# create a new project in my-app
npm init svelte@next my-app
```

> Note: the `@next` is temporary

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Netlify Environment Variables (Comcash)

Comcash data is loaded on the server from these private vars:

- `CC_OPEN_API_KEY`
- `CC_PIN_B64`
- `CC_PASSWORD`

If `main` works but `develop` branch deploys do not, check Netlify variable scopes.
These values must be available to the branch deploy context (or set to all contexts), not only production.

## Netlify Environment Variables (Cart Checkout)

Cart checkout endpoint (`/data/cart/checkout`) uses:

- `RESEND_API_KEY`
  - Required for transactional emails.
- `ORDER_EMAIL_FROM`
  - Sender address used for checkout emails.
  - Example: `North of the Border <orders@notbfireworks.com>`
- `STORE_TIMEZONE`
  - Optional; defaults to `America/New_York`.
  - Used for pickup date/time validation against store hours.

## Netlify Environment Variables (CMS Admin)

Use `CMS_ADMIN_ENABLED` to control whether `/cms-admin` is accessible:

- `true`: CMS routes/functions enabled
- `false`: CMS routes/functions return not found

Recommended context setup:

- `branch-deploy` (for `dev`): `CMS_ADMIN_ENABLED=true`
- `production` (for `main`): `CMS_ADMIN_ENABLED=false`

Blob storage:

- `CMS_BLOBS_STORE`: optional store name override (default: `cms-content`)
- Runtime keys:
  - `preview/<branch>.json` for preview edits
  - `live.json` for published live content

Optional publish credential:

- `CMS_PUBLISH_PASSWORD`: when set, required for "Commit & Go Live" actions.

## Builds
- 04/10/2026 2:40 pm
