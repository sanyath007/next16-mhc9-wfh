# Next.js Employee Work Tracking Dashboard

A Next.js 16 application for monitoring employee work status including work-from-home (WFH), office attendance, leaves, and business trips.

## Tech Stack
- **Framework**: Next.js 16.1.6 with App Router and TypeScript
- **Database**: Prisma ORM with MySQL
- **Authentication**: NextAuth v5 with role-based access
- **Styling**: Tailwind CSS v4.2
- **OCR**: Tesseract.js for PDF/image processing
- **Charts**: Recharts for data visualization

## Git Commit Conventions
Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:
- **Format**: `<type>(<scope>): <description>`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **Scope**: Optional; specifies the part of the codebase (e.g., `dashboard`, `api`, `components`)
- **Description**: Brief summary in imperative mood (e.g., "add feature" not "added feature")
- **Examples**:
  - `feat(dashboard): add department filtering`
  - `fix(api/schedule): correct date parsing error`
  - `docs(AGENTS.md): update project documentation to reflect employee work tracking dashboard purpose`

## Build & Run
- Install: `npm install`
- Database: `npm run db:push` (runs `prisma db push`)
- Seed: `npm run db:seed` (runs `tsx prisma/seed.ts`)
- Dev: `npm run dev`
- Build: `npm run build`

For detailed setup, see [AGENTS.md](AGENTS.md).