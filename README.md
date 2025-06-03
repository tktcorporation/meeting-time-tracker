# Meeting Time Tracker

A real-time meeting progress tracking application built with modern web technologies. Track your meeting time, visualize progress, and generate retrospectives to improve future meetings.

![Meeting Time Tracker](https://img.shields.io/badge/TanStack-Start-ff4154?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square)

## Features

- 📊 **Real-time Progress Tracking** - Visual progress bars show meeting time usage
- 🌍 **Multi-language Support** - Switch between English and Japanese
- 🌓 **Dark/Light Theme** - Comfortable viewing in any lighting condition
- 📝 **Meeting History** - Track past meetings and their outcomes
- 🔄 **Live Updates** - See elapsed time update in real-time
- 📈 **Retrospectives** - Generate insights from completed meetings

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

## Usage

### Creating a Meeting

1. Enter the meeting title
2. Set the duration (in minutes)
3. Add participant names (comma-separated)
4. Click "Start Meeting" to begin tracking

### During the Meeting

- The progress bar shows time usage in real-time
- Color indicators:
  - 🟩 Green: Under 50% time used
  - 🟨 Yellow: 50-80% time used
  - 🟧 Orange: 80-90% time used
  - 🟥 Red: Over 90% time used
- Use pause/resume buttons to control the timer
- Click "End Meeting" when finished

### Meeting History

- View all past meetings in the history section
- See duration, participants, and efficiency metrics
- Access retrospectives for completed meetings

### Customization

- **Theme**: Click the sun/moon icon to toggle dark mode
- **Language**: Click the language icon to switch between EN/JP

## Building for Production

To create an optimized production build:

```bash
bun run build
```

To preview the production build locally:

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
bun run format     # Format code
bun run check      # Run all checks
```

### Project Structure

```
meeting-time-tracker/
├── src/
│   ├── routes/          # File-based routing
│   ├── components/      # React components
│   ├── contexts/        # Theme & language contexts
│   ├── integrations/    # tRPC & TanStack Query setup
│   └── styles.css       # Global styles & Tailwind
├── public/              # Static assets
└── app.config.ts        # App configuration
```

### Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) - Full-stack React framework
- **Routing**: [TanStack Router](https://tanstack.com/router) - Type-safe file-based routing
- **API**: [tRPC](https://trpc.io/) - End-to-end type-safe APIs
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State**: [TanStack Query](https://tanstack.com/query) - Server state management
- **Language**: TypeScript with strict mode
- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use tab indentation
- Use double quotes for strings
- Run `bun run lint` before committing
- All text must use the translation function
- All colors must use theme-aware CSS variables

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [TanStack](https://tanstack.com/) libraries
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

Made with ❤️ using TanStack Start and Bun