# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Meeting Time Tracker Application

This is a meeting time tracking application that helps monitor meeting progress and generate retrospectives. The app supports:
- Real-time meeting time tracking with visual progress indicators
- Multi-language support (English/Japanese)
- Light/Dark theme switching
- Meeting history and retrospectives

## Development Commands

**Development server:**
```bash
bun run dev              # Start development server with Vinxi
```

**Build and serve:**
```bash
bun run build            # Build for production
bun run start            # Start production server
bun run serve            # Preview build with Vite
```

**Testing:**
```bash
bun run test             # Run tests with Vitest
```

**Linting and formatting:**
```bash
bun run lint             # Run Biome linter + GitHub Actions linter
bun run lint:fix         # Auto-fix linting issues
bun run format           # Format code with Biome
bun run check            # Run comprehensive Biome check
```

## Architecture Overview

This is a **TanStack Start** application with file-based routing, built with React 19 and TypeScript. Key architectural components:

### Core Stack
- **TanStack Start**: Full-stack React framework with SSR/SSG capabilities
- **TanStack Router**: File-based routing system in `src/routes/`
- **TanStack Query**: Server state management and caching
- **tRPC v11**: Type-safe API layer with end-to-end type safety
- **Tailwind CSS v4**: Utility-first CSS framework with CSS variables for theming
- **Biome**: Fast linting and formatting

### Project Structure
- `src/routes/`: File-based routing - route files auto-generate route tree
- `src/integrations/trpc/`: tRPC setup with router, client, and React integration
- `src/integrations/tanstack-query/`: Query client provider
- `src/env.ts`: Type-safe environment variables with T3 Env
- `src/components/`: Reusable React components
- `src/contexts/`: React contexts for theme and language management
- `routeTree.gen.ts`: Auto-generated route tree (do not edit manually)

### Key Features & Integrations

#### tRPC Router
Defined in `src/integrations/trpc/router.ts` with meeting-related procedures:
- `meeting.create`: Create new meetings with title, duration, and participants
- `meeting.list`: Retrieve meeting history
- `meeting.updateProgress`: Update meeting progress and status

#### Theme System
- **ThemeContext**: Manages light/dark theme switching
- **CSS Variables**: All colors use CSS variables that respond to theme changes
- **Tailwind Classes**: Use theme-aware classes like `bg-background`, `text-foreground`, etc.
- **No hard-coded colors**: All components use theme variables

#### Internationalization
- **LanguageContext**: Manages language switching (EN/JA)
- **Translation Function**: All text uses `t()` function for translations
- **Complete Coverage**: All UI text is translatable

#### Environment Variables
- Managed through `src/env.ts` with client (`VITE_`) and server prefixes
- Type-safe validation with Zod
- Separate client/server schemas

### Styling Guidelines
- **Tailwind CSS v4** with Shadcn/ui components
- **Tab indentation** enforced by Biome
- **CSS Variables** for all colors to support theme switching
- **Path Aliases**: `@/*` maps to `src/*` for clean imports
- **Theme-aware classes**: Always use semantic color classes (e.g., `bg-card`, `text-muted-foreground`)

#### Color System & Contrast Guidelines
- **OKLCH Color Space**: All colors are defined using OKLCH for better perceptual uniformity
- **Dark Mode Contrast**: Optimized for readability with WCAG AA compliance
  - Background: `oklch(0.08 0.005 285.823)` - Deep dark background
  - Foreground: `oklch(0.95 0 0)` - Slightly off-white text for reduced eye strain
  - Cards: `oklch(0.12 0.005 285.823)` - Elevated surfaces with subtle contrast
  - Primary: `oklch(0.70 0.15 220)` - Accessible blue with good contrast
- **Semantic Color Usage**:
  - Success states: Use `text-green-600 dark:text-green-500` for better dark mode visibility
  - Warning states: Use `text-yellow-600 dark:text-yellow-500` 
  - Error states: Use `text-destructive` (automatically adjusts for theme)
  - Muted text: Use `text-muted-foreground` (contrast ratio optimized)
- **Interactive Elements**:
  - Buttons should maintain consistent contrast in both themes
  - Avoid using `-400` variants in dark mode; prefer `-500` or `-600` for better visibility
  - Hover states should be one shade darker (e.g., `bg-green-600 hover:bg-green-700`)
- **Accessibility First**: All color combinations maintain a minimum 4.5:1 contrast ratio for normal text

### Development Notes
- Uses Bun as package manager and runtime
- Route tree regenerates automatically during development
- All demo files have been removed - no default TanStack examples remain
- Biome enforces double quotes and tab indentation
- GitHub Actions linting with `@tktco/node-actionlint`
- React DevTools are available in development but Query DevTools have been removed

### Important Reminders
- Always use theme-aware CSS classes instead of hard-coded colors
- Always use the translation function `t()` for all user-facing text
- Run `bun run lint` before committing to ensure code quality
- The route tree (`routeTree.gen.ts`) is auto-generated - never edit it manually
