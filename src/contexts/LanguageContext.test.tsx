import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, useLanguage } from "./LanguageContext";

describe("LanguageContext", () => {
  beforeEach(() => {
    // Reset navigator.language
    Object.defineProperty(navigator, "language", {
      value: "en-US",
      configurable: true,
    });
  });

  describe("LanguageProvider", () => {
    it("should provide language context to children", () => {
      const TestComponent = () => {
        const { language } = useLanguage();
        return <div>{language}</div>;
      };

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>,
      );

      expect(screen.getByText("en")).toBeInTheDocument();
    });

    it("should load language from localStorage if available", () => {
      localStorage.setItem("language", "ja");

      const TestComponent = () => {
        const { language } = useLanguage();
        return <div>{language}</div>;
      };

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>,
      );

      expect(screen.getByText("ja")).toBeInTheDocument();
    });

    it("should use navigator language when no saved language", () => {
      Object.defineProperty(navigator, "language", {
        value: "ja-JP",
        configurable: true,
      });

      const TestComponent = () => {
        const { language } = useLanguage();
        return <div>{language}</div>;
      };

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>,
      );

      expect(screen.getByText("ja")).toBeInTheDocument();
    });

    it("should set language correctly", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const { language, setLanguage } = useLanguage();
        return (
          <div>
            <span>{language}</span>
            <button type="button" onClick={() => setLanguage("ja")}>
              Set Japanese
            </button>
          </div>
        );
      };

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>,
      );

      expect(screen.getByText("en")).toBeInTheDocument();

      await user.click(screen.getByText("Set Japanese"));
      expect(screen.getByText("ja")).toBeInTheDocument();
      expect(localStorage.getItem("language")).toBe("ja");
    });

    it("should translate keys correctly", () => {
      const TestComponent = () => {
        const { t } = useLanguage();
        return (
          <div>
            <span>{t("meeting.title")}</span>
          </div>
        );
      };

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>,
      );

      expect(screen.getByText("Meeting Time Tracker")).toBeInTheDocument();
    });

    it("should translate to Japanese when language is set", async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const { t, setLanguage } = useLanguage();
        return (
          <div>
            <span>{t("meeting.title")}</span>
            <button type="button" onClick={() => setLanguage("ja")}>
              Set Japanese
            </button>
          </div>
        );
      };

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>,
      );

      expect(screen.getByText("Meeting Time Tracker")).toBeInTheDocument();

      await user.click(screen.getByText("Set Japanese"));
      expect(screen.getByText("会議時間トラッカー")).toBeInTheDocument();
    });

    it("should return key when translation is not found", () => {
      const TestComponent = () => {
        const { t } = useLanguage();
        return <div>{t("non.existent.key")}</div>;
      };

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>,
      );

      expect(screen.getByText("non.existent.key")).toBeInTheDocument();
    });
  });

  describe("useLanguage", () => {
    it("should throw error when used outside LanguageProvider", () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useLanguage());
      }).toThrow("useLanguage must be used within a LanguageProvider");

      spy.mockRestore();
    });
  });
});
