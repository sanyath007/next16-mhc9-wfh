# GEMINI.md - Consulting Tracking System (ระบบติดตามการให้คำปรึกษา)

## Project Overview
This project is a comprehensive **Consulting Tracking System Dashboard** designed to monitor and visualize student consulting statistics across Thailand. It provides a multi-level drill-down interface (National → Province → District → School) to track the progress of consulting sessions, from initial requests to completion.

The application features a modern **Glassmorphism** aesthetic, emphasizing clarity, depth, and interactive data visualization.

### Main Technologies
- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router, TypeScript)
- **Authentication:** [Auth.js (NextAuth v5)](https://authjs.dev/)
- **Database:** [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with `@theme` and `@utility` directives.
- **Charts:** [Recharts](https://recharts.org/) (customized with glass-themed tooltips).
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data Processing:** 
  - [Papa Parse](https://www.papaparse.com/) (CSV parsing with support for TIS-620/UTF-8)
  - [Tesseract.js](https://tesseract.projectnaptha.com/) & [PDF.js](https://mozilla.github.io/pdf.js/) (OCR for images and PDFs)

## Design System & Theme
The application follows a **Modern Glassmorphism** design language:

### Visual Identity
- **Theme:** Glassmorphism (Soft backgrounds, backdrop blurs, and subtle borders).
- **Colors:**
    - **Primary (Brand):** Sky Blue (`#0ea5e9`) used for primary actions and active states.
    - **Secondary (Accent):** Orange (`#f97316`) for highlights.
    - **Background:** Dynamic linear gradient (`#f0f9ff` → `#e0f2fe` → `#fdf4ff`).
    - **Semantic Colors:** Emerald (Success/High Rate), Amber (Warning/Medium Rate), Rose (Danger/Low Rate).
- **Typography:**
    - **Display/Sans:** `Prompt` (Primary for headings and UI components).
    - **Secondary Sans:** `IBM Plex Sans Thai` (Fallback and content).
    - **Monospace:** `IBM Plex Mono` (Used for numerical data and statistics).

### Key UI Components
- **Glass Sidebar:** Semi-transparent with `backdrop-blur-xl` and active state highlighting.
- **Stat Cards:** Custom `@utility stat-card` with hover transitions and shadow effects.
- **Interactive Tables:** Expandable rows for drill-down (District → School) with smooth animations.
- **Progress Bars:** Context-aware color-coding based on completion percentages.
- **Animations:** Custom `fadeInUp` and `countUp` for an "alive" feel.

## Key Features
- **Interactive Dashboard:** High-level summary cards and detailed charts (Bar, Pie) with drill-down capabilities.
- **Data Management:** Secure CSV upload for updating consulting records, with validation for required columns.
- **Role-Based Access Control:** Three user roles (`ADMIN`, `EDITOR`, `VIEWER`) to manage permissions.
- **OCR Utility:** Capability to extract Thai and English text from scanned images and PDF documents.
- **Location Hierarchy:** Comprehensive database of Thai Provinces, Districts, and Schools.

## Building and Running

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Database Setup
1. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
2. Push schema to SQLite database:
   ```bash
   npm run db:push
   ```
3. Seed the database (Provinces, Districts, Schools, and initial User):
   ```bash
   npm run db:seed
   ```
   *Note: Specific seeding scripts are available for individual datasets (e.g., `npm run db:seed:provinces`).*

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production
```bash
npm run build
npm run start
```

## Project Architecture
- `app/`: Next.js pages and API routes.
- `components/`: Reusable UI components and specialized features like `OCRComponent`.
- `lib/`: Shared utilities, Prisma client, React contexts, and custom hooks.
- `prisma/`: Database schema and seeding logic.
- `data/`: Raw SQL and data files for location seeding.

## Development Conventions
- **Language:** The UI and data are primarily in **Thai**.
- **Commits:** Follow the **Conventional Commits** format: `<type>(<scope>): <description>`.
- **Typing:** Strict TypeScript usage for all components and utilities.
- **Styling:** Adhere to the established Tailwind CSS 4 patterns, custom utilities (`glass`, `stat-card`), and font families.
- **Authentication:** All routes under `/dashboard` and `/upload` are protected by default via `auth.ts`.
