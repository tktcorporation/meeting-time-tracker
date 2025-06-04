import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

describe("ThemeContext", () => {
  describe("ThemeProvider", () => {
    it("should provide theme context to children", () => {
      // Reset matchMedia to default (light mode)
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const TestComponent = () => {
        const { theme } = useTheme();
        return <div>{theme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(screen.getByText("light")).toBeInTheDocument();
    });

    it("should load theme from localStorage if available", () => {
      localStorage.setItem("theme", "dark");

      const TestComponent = () => {
        const { theme } = useTheme();
        return <div>{theme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(screen.getByText("dark")).toBeInTheDocument();
    });

    it("should use system preference when no saved theme", () => {
      // Mock matchMedia to return dark preference
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const TestComponent = () => {
        const { theme } = useTheme();
        return <div>{theme}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(screen.getByText("dark")).toBeInTheDocument();
    });

    it("should toggle theme correctly", async () => {
      // Reset matchMedia to default (light mode)
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const user = userEvent.setup();

      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme();
        return (
          <div>
            <span>{theme}</span>
            <button type="button" onClick={toggleTheme}>
              Toggle
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(screen.getByText("light")).toBeInTheDocument();

      await user.click(screen.getByText("Toggle"));
      expect(screen.getByText("dark")).toBeInTheDocument();
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      await user.click(screen.getByText("Toggle"));
      expect(screen.getByText("light")).toBeInTheDocument();
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("should set theme directly", async () => {
      // Reset matchMedia to default (light mode)
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const user = userEvent.setup();

      const TestComponent = () => {
        const { theme, setTheme } = useTheme();
        return (
          <div>
            <span>{theme}</span>
            <button type="button" onClick={() => setTheme("dark")}>
              Set Dark
            </button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      expect(screen.getByText("light")).toBeInTheDocument();

      await user.click(screen.getByText("Set Dark"));
      expect(screen.getByText("dark")).toBeInTheDocument();
    });

    it("should persist theme to localStorage", async () => {
      // Reset matchMedia to default (light mode)
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme("dark");
      });

      expect(localStorage.getItem("theme")).toBe("dark");
    });
  });

  describe("useTheme", () => {
    it("should throw error when used outside ThemeProvider", () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow("useTheme must be used within a ThemeProvider");

      spy.mockRestore();
    });
  });
});
