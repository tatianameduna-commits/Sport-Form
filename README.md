# SSAC Sports Analytics Media: Startup Participation Form

A participation form for startups in the **Sports Analytics Media** section of the
MIT Sloan Sports Analytics Conference. It saves every submission to a database and
includes an admin dashboard.

## What's included

- **Form** (`/`): company info, primary contact, media focus, funding (including
  **total money raised** and stage), and conference participation preferences.
- **Database:** SQLite, built into Node, so there's nothing extra to install.
  Data lives in `data/submissions.db`.
- **Admin dashboard** (`/admin`, password-protected): totals (applications,
  total raised, average raised), search, stage filter, sortable columns,
  expandable details, delete, and **CSV export**.

## Run it

Requires Node.js 22.13 or later.

```bash
npm install
ADMIN_PASSWORD=choose-a-strong-password npm start
```

- Form: http://localhost:3000
- Admin: http://localhost:3000/admin (any username, password = `ADMIN_PASSWORD`)

| Env var          | Default                  | Purpose                     |
|------------------|--------------------------|-----------------------------|
| `PORT`           | `3000`                   | Server port                 |
| `ADMIN_PASSWORD` | `ssac-admin`             | Admin login. **Change it.** |
| `DB_PATH`        | `data/submissions.db`    | SQLite file location        |

## Deploying

The app needs a host with persistent disk so the SQLite file survives restarts,
for example Render (with a disk), Railway (with a volume), Fly.io (with a volume), or a VPS.
Point `DB_PATH` at the mounted disk.

## Customizing the look

All colors and fonts are CSS variables at the top of `public/styles.css`
(`--accent`, `--bg`, `--display`, and so on). Change those to match the conference site exactly.
