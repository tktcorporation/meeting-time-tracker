# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Meeting Time Tracker Application

This is a **mobile-first** meeting agenda tracking application that monitors individual agenda items in real-time. The app features:
- Agenda-based time tracking with visual timeline interface
- Persistent state management across browser sessions and tab switches
- Multi-language support (English/Japanese)
- Light/Dark theme switching with accessibility-focused color contrast
- Meeting history with retrospective analysis
- Touch-friendly mobile interface with inline editing

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
bun run test:watch       # Run tests in watch mode
bun run test:ui          # Run tests with Vitest UI
bun run test:coverage    # Run tests with coverage report
```

**Linting and formatting:**
```bash
bun run lint             # Run Biome linter + GitHub Actions linter + Knip
bun run lint:fix         # Auto-fix linting issues
bun run lint:knip        # Check for unused exports/imports with Knip
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
- **Persistent State**: Meeting progress automatically saved and restored across sessions
- **Background Tracking**: Timer continues running when tab is inactive or browser is closed

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

### State Persistence Implementation

#### LocalStorage Keys
- **`active-meeting-session`**: Stores current meeting state including:
  - `agendaItems`: Array of all agenda items with progress data
  - `isRunning`: Whether the timer is currently active
  - `savedAt`: Timestamp when state was last saved
- **`meeting-history`**: Array of completed meetings (max 10 items)

#### Persistence Features
1. **Automatic State Save**: Every state change triggers localStorage update via useEffect
2. **Timestamp-Based Recovery**: On app load, elapsed times are recalculated from saved timestamps
3. **Tab Visibility Handling**: Document visibility API pauses/resumes timers appropriately
4. **Background Time Calculation**: Elapsed time includes time when browser was closed
5. **Session Cleanup**: Active session cleared when meeting is saved or reset

#### Key Implementation Details
- Timer state persists using `startTime` timestamps and accumulated `elapsedTime`
- When restoring state, active items get their elapsed time updated based on time passed
- Visibility change events ensure accurate time tracking across tab switches
- All time calculations use `Date.now()` for consistency

### Testing Framework & Conventions

#### Test Setup
- **Vitest** as the primary testing framework with jsdom environment
- **React Testing Library** for component testing with user-event simulation
- **Global test setup** in `src/test/setup.ts` with:
  - Automatic cleanup after each test
  - localStorage mock with clean state between tests
  - window.matchMedia mock for theme testing
  - @testing-library/jest-dom matchers

#### Test File Organization
- Test files located alongside source files with `.test.ts` or `.test.tsx` extension
- Test coverage for:
  - Utility functions (`src/lib/utils.test.ts`)
  - React contexts (`src/contexts/*.test.tsx`)
  - Key components (`src/components/*.test.tsx`)

#### Testing Best Practices
- **Mock Management**: Reset mocks in test setup, override per-test as needed
- **State Isolation**: localStorage.clear() and DOM cleanup before each test
- **Accessibility**: All test buttons must include `type="button"` attribute
- **User Interactions**: Use `userEvent.setup()` for realistic user interactions
- **Multiple Elements**: Use `getAllByText()` when multiple elements have same text
- **Theme Testing**: Mock window.matchMedia appropriately for light/dark mode tests
- **Translation Testing**: Test both English and Japanese language states
- **Error Handling**: Suppress console.error with vi.spyOn() for error boundary tests

#### Test Structure Pattern
```typescript
describe("ComponentName", () => {
  beforeEach(() => {
    // Component-specific setup
  });

  describe("feature group", () => {
    it("should describe specific behavior", async () => {
      // Arrange
      const user = userEvent.setup();
      
      // Act
      render(<Component />);
      await user.click(screen.getByRole("button"));
      
      // Assert
      expect(screen.getByText("Expected")).toBeInTheDocument();
    });
  });
});
```

#### Critical Test Requirements
- **Run `bun run test` before commits** to ensure all tests pass
- **Test accessibility**: Verify proper ARIA attributes and button types
- **Test persistence**: Verify localStorage operations work correctly
- **Test themes**: Ensure components work in both light and dark modes
- **Test languages**: Verify translations work for both EN/JA languages

### Important Reminders
- Always use theme-aware CSS classes instead of hard-coded colors
- Always use the translation function `t()` for all user-facing text
- Follow mobile-first responsive design patterns with appropriate breakpoints
- Ensure all interactive elements meet touch accessibility standards (44-48px minimum)
- **Run `bun run test` and `bun run lint` before committing** to ensure code quality
- The route tree (`routeTree.gen.ts`) is auto-generated - never edit it manually
- **ALWAYS document functions with JSDoc docstrings** explaining purpose, role, and behavior
- **State persistence** is critical - ensure localStorage operations are wrapped in try-catch
- **Test coverage** is essential - write tests for all new components and utilities
