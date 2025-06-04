# Meeting Time Tracker

A mobile-first meeting agenda tracking application with real-time progress monitoring. Track individual agenda items, visualize progress, and maintain meeting history with persistent state across browser sessions.

![Meeting Time Tracker](https://img.shields.io/badge/TanStack-Start-ff4154?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square)

## Features

### Core Functionality
- 📋 **Agenda-Based Time Tracking** - Track time for individual agenda items
- ⏱️ **Real-time Progress Monitoring** - Visual timeline shows active item and progress
- 💾 **Persistent State** - Meeting progress continues even after closing browser
- 📊 **Meeting History** - Save completed meetings for future reference
- 🔄 **Flexible Controls** - Start, pause, skip items, and reset as needed

### User Experience
- 🌍 **Multi-language Support** - Switch between English and Japanese
- 🌓 **Dark/Light Theme** - Optimized for readability in any lighting
- 📱 **Mobile-First Design** - Touch-friendly interface with responsive layout
- ✏️ **Inline Editing** - Edit agenda items directly without modal dialogs
- 🎯 **Sample Data** - Pre-populated Japanese agenda items for quick start

### Technical Features
- 🔄 **Background Timer** - Time continues tracking when tab is inactive
- 💾 **LocalStorage Persistence** - Automatic save/restore of active sessions
- ⚡ **Optimized Performance** - Efficient state updates and rendering
- 🎨 **WCAG AA Compliant** - Accessible color contrast in all themes

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/meeting-time-tracker.git
cd meeting-time-tracker
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

## Usage Guide

### Managing Agenda Items

1. **Adding Items**: Click "アジェンダを追加" (Add Agenda) button
   - Enter topic name
   - Set estimated time (in minutes)
   - Click save (✓) to add

2. **Editing Items**: Click edit icon (✏️) on any item
   - Modify name or estimated time
   - Save changes or cancel
   - Note: Cannot edit while timer is running

3. **Deleting Items**: Click trash icon (🗑️) to remove items

### Running a Meeting

1. **Start Meeting**: Click "会議を開始" (Start Meeting)
   - First agenda item becomes active automatically
   - Timer begins counting

2. **During Meeting**:
   - Active item shows pulsing indicator and countdown
   - Click "次のアジェンダ" (Next Agenda) to move to next item
   - Current item is marked complete with actual time recorded
   - Use "一時停止" (Pause) to pause all timers

3. **Visual Indicators**:
   - ⚪ Gray circle: Pending item
   - 🔵 Blue pulsing: Currently active
   - ✅ Green check: Completed item
   - Progress bar shows overall meeting completion

4. **Overtime Handling**:
   - Timer shows remaining time in format "X:XX left"
   - When overtime, displays "+X:XX" in red
   - Completed items show difference from estimate

### Meeting Completion

1. **Save Meeting**: When all items complete, click "会議を保存"
   - Meeting is saved to history (last 10 meetings kept)
   - Active session is cleared

2. **View Retrospective**: Click "振り返りを見る" to analyze:
   - Time usage per agenda item
   - Overall meeting efficiency
   - Improvement suggestions

3. **Reset Meeting**: Click "リセット" to clear all progress

### Persistence Features

- **Tab Switching**: Timer continues running in background
- **Browser Restart**: Meeting state restored with accurate elapsed time
- **Automatic Saving**: State saved to localStorage on every change
- **Session Recovery**: Reopening app shows meeting in exact same state

### Customization

- **Theme**: Toggle between light/dark mode for comfort
- **Language**: Switch between English (EN) and Japanese (JP)
- **Sample Data**: Use pre-populated agenda for testing

## Building for Production

Create an optimized production build:

```bash
bun run build
```

Preview the production build:

```bash
bun run start
```

## Development

### Available Scripts

```bash
bun run dev        # Start development server
bun run build      # Build for production
bun run start      # Start production server
bun run test       # Run tests with Vitest
bun run lint       # Check code quality
bun run lint:fix   # Auto-fix linting issues
bun run format     # Format code with Biome
bun run check      # Run comprehensive checks
```

### Project Structure

```
meeting-time-tracker/
├── src/
│   ├── routes/          # File-based routing
│   │   ├── index.tsx    # Main meeting tracker
│   │   ├── history.tsx  # Meeting history view
│   │   └── retrospective.tsx # Meeting analysis
│   ├── components/      # Reusable components
│   │   ├── MeetingTimer.tsx    # Countdown display
│   │   ├── MeetingProgress.tsx # Agenda timeline
│   │   ├── TimeInput.tsx       # Time input control
│   │   └── EmptyState.tsx      # No agenda display
│   ├── contexts/        # Global state
│   │   ├── ThemeContext.tsx    # Theme management
│   │   └── LanguageContext.tsx # i18n support
│   ├── integrations/    # External integrations
│   └── styles.css       # Global styles
├── public/              # Static assets
└── app.config.ts        # App configuration
```

### Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) - Full-stack React
- **Routing**: [TanStack Router](https://tanstack.com/router) - Type-safe routing
- **API**: [tRPC](https://trpc.io/) - End-to-end type safety
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom theme system
- **State**: Component state + LocalStorage persistence
- **Language**: TypeScript 5.7 with strict mode
- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Linting**: [Biome](https://biomejs.dev/) - Fast formatter/linter

## Data Storage

### LocalStorage Keys

- `active-meeting-session`: Current meeting state
  - Agenda items with progress
  - Timer running state
  - Timestamps for elapsed time calculation
- `meeting-history`: Array of completed meetings (max 10)

### Data Structures

```typescript
interface AgendaItem {
  id: string;
  name: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  isActive: boolean;
  startTime?: number;
  elapsedTime: number;
}

interface Meeting {
  id: string;
  date: string;
  agendaItems: AgendaItem[];
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Use tab indentation (enforced by Biome)
- Use double quotes for strings
- Run `bun run lint:fix` before committing
- Document functions with JSDoc comments
- Use translation function `t()` for all text
- Use theme-aware CSS classes only
- Maintain 44-48px touch targets

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [TanStack](https://tanstack.com/) libraries
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Color system using OKLCH color space

---

Made with ❤️ using TanStack Start and Bun