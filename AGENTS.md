# AGENTS.md - AI Agent Instructions for MHC9 WFH (รายงานผลงานการ Work From Home)

## Project Overview
MHC9 WFH is a comprehensive **Employee Work Tracking Dashboard** for monitoring work-from-home (WFH), office attendance, leaves, and business trips. The app tracks employee work status across departments with real-time data visualization and filtering capabilities.

## Tech Stack
- **Framework**: Next.js 15+ with App Router and TypeScript (strict mode enabled)
- **Database**: Prisma ORM with MySQL/SQLite, using snake_case fields mapped to PascalCase models
- **Authentication**: NextAuth v5 (Beta) with JWT sessions and role-based access:
    - **`ADMIN` / `EDITOR` (HR Officer):** Full management of all employee schedules.
    - **`VIEWER` (Employee):** Restricted to adding their own schedules and managing only future/current records.
- **Styling**: Tailwind CSS v4.2 with custom utilities in `app/globals.css`
- **OCR**: Tesseract.js with Thai+English support for PDF/image processing
- **Charts**: Recharts for data visualization

## Coding Conventions

### TypeScript
- Use strict mode; define interfaces at component/file scope
- PascalCase for types/interfaces (`Employee`, `Schedule`)
- SCREAMING_SNAKE_CASE for enums (`REQUESTED`, `COMPLETED`)
- Single path alias: `@/*` points to workspace root

### Next.js Structure
- App Router: Feature-based directories with `layout.tsx` and `page.tsx`
- API routes: Always check `const session = await auth()` first; return 401/403/400 with `{ error: string }`. Implement role and ownership checks (e.g., `user.role !== 'ADMIN' && employee_id !== user.employee_id`).
- Root layout: Sets Thai metadata, Google Fonts, wraps with `<Providers>`
- Protected routes: Dashboard layout redirects unauthenticated users to `/login`

### React Components
- Start interactive components with `"use client"`
- Structure: Types → Constants → Helpers → Main component
- Use section comments: `// ─── Types ────────────`
- PascalCase for components, camelCase for functions
- Destructure props in function parameters

### State Management
- `useState` for UI state, `useEffect` + `fetch` for server data
- `useMemo` for expensive computations
- Custom context with error throwing if used outside provider
- `useSession` from next-auth/react for auth state

### Database & Prisma
- Schema: Comments divide sections (`// ===== AUTH =====`)
- Table names: snake_case with `@@map()` for model names
- Location hierarchy: Province (Int ID) → District (Int ID) → School (String CUID)
- Statistics: Separate model with enums for type/status
- Cascading deletes: `onDelete: Cascade`
- Relationships: `<entity>_id` foreign keys, unique constraints per parent

### Styling
- Custom Tailwind utilities: `@utility card`, `@utility btn-primary`, etc.
- Color system: Brand (sky blue), accent (orange), status (emerald/amber/rose)
- Typography: Prompt for headings, IBM Plex Sans Thai for body, IBM Plex Mono for numbers
- Responsive: Mobile-first, `hidden lg:flex` for desktop-only

## Project-Specific Patterns
- **Work Status Tracking**: Tracks employee work status as WFH, office, leave, or business trip.
- **Role-Based Schedule Management**: 
    - Employees can add their own schedules; Admin/HR can add for anyone.
    - **Future-Only Cancellation**: Regular users can only cancel or edit schedules for **today or future dates**. Past schedules are locked.
- **Department Filtering**: Filter by departments (อำนวยการ, วิชาการสุขภาพจิต, บริการสุขภาพจิต).
- **Date Filtering**: Single date selection for daily work status tracking.
- **CSV Upload**: Parse PDF → Extract employee data → Validate → Create data upload records.
- **Statistics Calculation**: Calculate percentages for WFH, office, leave, and trip statuses.
- **Language**: Thai-first UI, `lang="th"`, Thai fonts.
- **Error Handling**: Try-catch in APIs, console.error, JSON responses.

## Build & Run
- Install: `npm install`
- Database: `npm run db:push` (runs `prisma db push`)
- Seed: `npm run db:seed` (runs `tsx prisma/seed.ts`)
- Dev: `npm run dev`
- Build: `npm run build`

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

## Key Files
- [prisma/schema.prisma](prisma/schema.prisma): Database schema
- [app/dashboard/page.tsx](app/dashboard/page.tsx): Main dashboard with accordion pattern
- [lib/prisma.ts](lib/prisma.ts): Prisma singleton
- [auth.ts](auth.ts): NextAuth configuration
- [app/globals.css](app/globals.css): Tailwind utilities and styles

For detailed setup, see [README.md](README.md).</content>
<parameter name="filePath">d:\NextJSProjects\next15-mhc9-wfh\AGENTS.md