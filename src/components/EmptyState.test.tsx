import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../contexts/LanguageContext";
import { EmptyState } from "./EmptyState";

// Wrapper component to provide required context
const EmptyStateWithProvider = ({
  onAddSample,
}: { onAddSample?: () => void }) => (
  <LanguageProvider>
    <EmptyState onAddSample={onAddSample} />
  </LanguageProvider>
);

describe("EmptyState", () => {
  it("should render all three onboarding steps", () => {
    render(<EmptyStateWithProvider />);

    expect(screen.getByText("Add Topics")).toBeInTheDocument();
    expect(screen.getByText("Track Time")).toBeInTheDocument();
    expect(screen.getByText("Review Results")).toBeInTheDocument();
  });

  it("should render the demo button", () => {
    render(<EmptyStateWithProvider />);

    const demoButton = screen.getByRole("button", {
      name: /Try Demo Meeting/i,
    });
    expect(demoButton).toBeInTheDocument();
  });

  it("should disable demo button when onAddSample is not provided", () => {
    render(<EmptyStateWithProvider />);

    const demoButton = screen.getByRole("button", {
      name: /Try Demo Meeting/i,
    });
    expect(demoButton).toBeDisabled();
  });

  it("should enable demo button when onAddSample is provided", () => {
    const mockAddSample = vi.fn();
    render(<EmptyStateWithProvider onAddSample={mockAddSample} />);

    const demoButton = screen.getByRole("button", {
      name: /Try Demo Meeting/i,
    });
    expect(demoButton).not.toBeDisabled();
  });

  it("should call onAddSample when demo button is clicked", async () => {
    const user = userEvent.setup();
    const mockAddSample = vi.fn();

    render(<EmptyStateWithProvider onAddSample={mockAddSample} />);

    const demoButton = screen.getByRole("button", {
      name: /Try Demo Meeting/i,
    });
    await user.click(demoButton);

    expect(mockAddSample).toHaveBeenCalledTimes(1);
  });

  it("should render with Japanese text when language is set to Japanese", () => {
    // Set language to Japanese
    localStorage.setItem("language", "ja");

    render(<EmptyStateWithProvider />);

    expect(screen.getByText("トピック追加")).toBeInTheDocument();
    expect(screen.getByText("時間計測")).toBeInTheDocument();
    expect(screen.getByText("結果確認")).toBeInTheDocument();
    expect(screen.getByText("デモ会議を試す")).toBeInTheDocument();
  });

  it("should render visual elements", () => {
    const { container } = render(<EmptyStateWithProvider />);

    // Check for Clock icon (main visual)
    const clockIcon = container.querySelector("svg.w-32.h-32");
    expect(clockIcon).toBeInTheDocument();

    // Check for step icons
    const stepIcons = container.querySelectorAll(".w-16.h-16");
    expect(stepIcons).toHaveLength(3);

    // Check for connecting lines between steps
    const connectorLines = container.querySelectorAll(".w-12.h-0\\.5");
    expect(connectorLines).toHaveLength(2);
  });

  it("should have proper hover effects on demo button", () => {
    const mockAddSample = vi.fn();
    const { container } = render(
      <EmptyStateWithProvider onAddSample={mockAddSample} />,
    );

    const button = screen.getByRole("button", { name: /Try Demo Meeting/i });

    // Check for hover transform class
    expect(button).toHaveClass("hover:scale-105");

    // Check for hover background effect
    expect(button).toHaveClass("hover:bg-primary/90");

    // Check for blur effect element
    const blurEffect = container.querySelector(".group-hover\\:opacity-100");
    expect(blurEffect).toBeInTheDocument();
  });
});
