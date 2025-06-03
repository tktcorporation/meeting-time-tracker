# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **tRPC**: Type-safe API layer with end-to-end type safety
- **Tailwind CSS v4**: Utility-first CSS framework
- **Biome**: Fast linting and formatting

### Project Structure
- `src/routes/`: File-based routing - route files auto-generate route tree
- `src/integrations/trpc/`: tRPC setup with router, client, and React integration
- `src/integrations/tanstack-query/`: Query client provider and layout
- `src/env.ts`: Type-safe environment variables with T3 Env
- `src/components/`: Reusable React components
- `routeTree.gen.ts`: Auto-generated route tree (do not edit manually)

### Key Integrations
- **tRPC Router**: Defined in `src/integrations/trpc/router.ts` with type-safe procedures
- **Environment Variables**: Managed through `src/env.ts` with client (`VITE_`) and server prefixes
- **Styling**: Tailwind CSS with Shadcn/ui components, configured for tab indentation
- **Path Aliases**: `@/*` maps to `src/*` for clean imports

### Development Notes
- Uses Bun as package manager and runtime
- Route tree regenerates automatically during development
- Demo files (prefixed with `demo`) are safe to delete
- Biome enforced double quotes and tab indentation
- GitHub Actions linting with `@tktco/node-actionlint`
