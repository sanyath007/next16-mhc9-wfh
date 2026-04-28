# GitHub Copilot Instructions for Next.js Consulting Dashboard

## Project Overview
This is a Next.js 16 consulting tracking dashboard for managing school consultation records with OCR upload capabilities. The app tracks consultation requests, completions, and statistics across a province-district-school hierarchy in Thailand.

## Tech Stack
- **Framework**: Next.js 16.1.6 with App Router and TypeScript (strict mode enabled)
- **Database**: Prisma ORM with SQLite, using snake_case fields mapped to PascalCase models
- **Authentication**: NextAuth v5 (Beta) with JWT sessions and role-based access (ADMIN, EDITOR, VIEWER)
- **Styling**: Tailwind CSS v4.2 with custom utilities in `app/globals.css`
- **OCR**: Tesseract.js with Thai+English support for PDF/image processing
- **Charts**: Recharts for data visualization

## Coding Conventions

### TypeScript
- Use strict mode; define interfaces at component/file scope
- PascalCase for types/interfaces (`ConsultRecord`, `ProvinceStats`)
- SCREAMING_SNAKE_CASE for enums (`REQUESTED`, `COMPLETED`)
- Single path alias: `@/*` points to workspace root

### Next.js Structure
- App Router: Feature-based directories with `layout.tsx` and `page.tsx`
- API routes: Always check `const session = await auth()` first; return 401/403/400 with `{ error: string }`
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

### Styling - Modern Glassmorphism Design
- **Design Language**: Glassmorphism with soft backgrounds, backdrop blurs, and subtle borders
- **Glass Effects**: Use `backdrop-blur-xl`, `bg-white/10` for semi-transparent glass panels with `border-white/20`
- **Color Palette**:
  - **Primary (Brand)**: Sky Blue (`#0ea5e9`, `sky-500`) for primary actions and active states
  - **Secondary (Accent)**: Orange (`#f97316`, `orange-500`) for highlights and secondary actions
  - **Background Gradient**: Linear gradient from `#f0f9ff` → `#e0f2fe` → `#fdf4ff` for depth
  - **Semantic Colors**: Emerald (Success/High Rate), Amber (Warning/Medium Rate), Rose (Danger/Low Rate)
- **Custom Tailwind Utilities**: `@utility glass`, `@utility stat-card`, `@utility btn-primary`, etc.
- **Typography**:
  - **Display/Headings**: `Prompt` font for primary UI components
  - **Body Content**: `IBM Plex Sans Thai` for readability
  - **Numbers/Data**: `IBM Plex Mono` for statistics and numerical displays
- **Components**:
  - **Glass Sidebar**: Semi-transparent with `backdrop-blur-xl` and smooth active state transitions
  - **Stat Cards**: Custom glass styling with hover shadow effects and smooth animations
  - **Interactive Tables**: Expandable rows with glass backgrounds and fade animations
  - **Progress Bars**: Glass-themed bars with status-based color-coding
  - **Animations**: Custom `fadeInUp` and `countUp` animations for visual feedback
- **Responsive Design**: Mobile-first approach with `hidden lg:flex` for desktop-only elements
- **Depth & Shadow**: Layered shadows (`shadow-sm`, `shadow-lg`) to create visual depth with glass effect

## Project-Specific Patterns
- **Location Levels**: Computed from ID presence (1=province, 2=district, 3=school)
- **Completion Rates**: `(completed / requested) * 100`, color-coded badges
- **CSV Upload**: Parse → Validate headers → Lookup locations → Create record/statistics
- **Filtering**: Multi-level by upload, province, year
- **Language**: Thai-first UI, `lang="th"`, Thai fonts
- **Error Handling**: Try-catch in APIs, console.error, JSON responses

## Build & Run
- Install: `npm install`
- Database: `npx prisma generate && npx prisma db push`
- Seed: `npx prisma db seed`
- Dev: `npm run dev`
- Build: `npm run build`

## Key Files
- [prisma/schema.prisma](prisma/schema.prisma): Database schema
- [app/dashboard/page.tsx](app/dashboard/page.tsx): Main dashboard with accordion pattern
- [lib/prisma.ts](lib/prisma.ts): Prisma singleton
- [auth.ts](auth.ts): NextAuth configuration
- [app/globals.css](app/globals.css): Tailwind utilities and styles