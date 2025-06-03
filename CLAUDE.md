# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Meeting Time Tracker Application

This is a **mobile-first** meeting time tracking application that helps monitor meeting progress and generate retrospectives. The app supports:
- Real-time meeting time tracking with visual progress indicators
- Multi-language support (English/Japanese)
- Light/Dark theme switching with accessibility-focused color contrast
- Meeting history and retrospectives
- Touch-friendly mobile interface with responsive design

## Development Commands

**Development server:**
```bash
bun run dev              # Start development server with Vinxi (blocks terminal process)
```

⚠️ **Warning:** `bun run dev` starts a persistent server process that will block the terminal. For quick syntax/build validation, use `bun run build` instead.

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

**Important:** Always run `bun run lint:fix` before starting the development server with `bun run dev` to ensure code quality and prevent syntax errors.

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
- **Mobile-First Design**: All components designed for mobile screens first, then enhanced for larger screens
- **Tailwind CSS v4** with Shadcn/ui components and responsive breakpoints (`sm:`, `lg:`)
- **Tab indentation** enforced by Biome
- **CSS Variables** for all colors to support theme switching
- **Path Aliases**: `@/*` maps to `src/*` for clean imports
- **Theme-aware classes**: Always use semantic color classes (e.g., `bg-card`, `text-muted-foreground`)
- **Touch-Friendly UI**: Minimum 44-48px touch targets for all interactive elements

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

### UI/UX Design Principles

#### Mobile-First Approach
- **Progressive Enhancement**: Start with mobile layout, enhance for larger screens with `sm:` and `lg:` breakpoints
- **Touch-First Interactions**: All buttons and interactive elements sized for finger taps (min 44-48px)
- **Vertical Layout Priority**: Use `flex-col` on mobile, `sm:flex-row` for desktop when needed
- **Responsive Typography**: `text-lg sm:text-xl` pattern for scalable font sizes
- **Adaptive Spacing**: `p-4 sm:p-6` and `mb-4 sm:mb-6` for mobile-optimized spacing

#### Component Guidelines
- **Forms**: Vertical-first layout with larger input fields (`px-4 py-3`) and proper labels
- **Buttons**: Consistent sizing with icons (18px) and adequate padding for touch
- **Cards**: Responsive padding and typography that works on all screen sizes
- **Tables**: Use collapsible `<details>` for detailed views, prioritize card-based layouts
- **Edit States**: Responsive inline editing with mobile-friendly controls

#### User Experience Features
- **Sample Data**: App starts with pre-populated Japanese sample agenda items for immediate usability
- **Inline Editing**: Direct editing of agenda items with touch-friendly save/cancel controls
- **Visual Feedback**: Clear active states, progress indicators, and status visibility
- **Efficient Navigation**: Streamlined interface focusing on core meeting tracking functionality

### Code Documentation Standards
- **Function Documentation**: ALL functions must include JSDoc docstrings explaining:
  - Purpose and intent of the function
  - Role within the component/module
  - Parameters and their types (if not obvious from TypeScript)
  - Return value and its purpose
  - Side effects or state changes
  - Usage examples for complex functions
- **Component Documentation**: React components should include:
  - Component purpose and responsibilities
  - Props interface documentation
  - Key behaviors and interactions
  - Usage patterns and examples
- **Documentation Format**: Use JSDoc standard with `/**` style comments
- **Maintenance**: Update docstrings when function behavior changes

### Important Reminders
- Always use theme-aware CSS classes instead of hard-coded colors
- Always use the translation function `t()` for all user-facing text
- Follow mobile-first responsive design patterns with appropriate breakpoints
- Ensure all interactive elements meet touch accessibility standards (44-48px minimum)
- Run `bun run lint` before committing to ensure code quality
- The route tree (`routeTree.gen.ts`) is auto-generated - never edit it manually
- **ALWAYS document functions with JSDoc docstrings** explaining purpose, role, and behavior
