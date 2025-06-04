import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MeetingTimer } from "./MeetingTimer";

describe("MeetingTimer", () => {
  it("should display remaining time correctly", () => {
    // 10 minutes total, 3 minutes elapsed = 7 minutes remaining
    const totalEstimated = 10; // minutes
    const totalElapsed = 3 * 60 * 1000; // 3 minutes in ms

    render(
      <MeetingTimer
        totalElapsed={totalElapsed}
        totalEstimated={totalEstimated}
        isRunning={false}
      />,
    );

    // Should show 00:07:00 (hours:minutes:seconds)
    const timeElements = screen.getAllByText("00");
    expect(timeElements).toHaveLength(2); // hours and seconds both show "00"
    expect(screen.getByText("07")).toBeInTheDocument(); // minutes
    expect(screen.getByText("Time Remaining")).toBeInTheDocument();
  });

  it("should display overtime correctly", () => {
    // 10 minutes total, 12 minutes elapsed = 2 minutes overtime
    const totalEstimated = 10; // minutes
    const totalElapsed = 12 * 60 * 1000; // 12 minutes in ms

    render(
      <MeetingTimer
        totalElapsed={totalElapsed}
        totalEstimated={totalEstimated}
        isRunning={false}
      />,
    );

    // Should show +00:02:00
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument(); // minutes
    expect(screen.getByText("OVERTIME")).toBeInTheDocument();
    expect(screen.getByText("Time Over")).toBeInTheDocument();
  });

  it("should display running indicator when timer is running", () => {
    render(
      <MeetingTimer totalElapsed={0} totalEstimated={10} isRunning={true} />,
    );

    // Should have animated pulse indicators
    const pulsingElements = document.querySelectorAll(".animate-pulse");
    expect(pulsingElements.length).toBeGreaterThan(0);
  });

  it("should handle edge case of exactly matching time", () => {
    // 10 minutes total, 10 minutes elapsed = 0 remaining
    const totalEstimated = 10; // minutes
    const totalElapsed = 10 * 60 * 1000; // 10 minutes in ms

    render(
      <MeetingTimer
        totalElapsed={totalElapsed}
        totalEstimated={totalEstimated}
        isRunning={false}
      />,
    );

    // Should show 00:00:00
    expect(screen.getAllByText("00").length).toBe(3); // hours, minutes, seconds
  });

  it("should format time with hours correctly", () => {
    // 90 minutes total, 5 minutes elapsed = 85 minutes (1:25:00) remaining
    const totalEstimated = 90; // minutes
    const totalElapsed = 5 * 60 * 1000; // 5 minutes in ms

    render(
      <MeetingTimer
        totalElapsed={totalElapsed}
        totalEstimated={totalEstimated}
        isRunning={false}
      />,
    );

    // Should show 01:25:00
    expect(screen.getByText("01")).toBeInTheDocument(); // hours
    expect(screen.getByText("25")).toBeInTheDocument(); // minutes
  });

  it("should show seconds correctly", () => {
    // 10 minutes total, 3 minutes 45 seconds elapsed
    const totalEstimated = 10; // minutes
    const totalElapsed = (3 * 60 + 45) * 1000; // 3:45 in ms

    render(
      <MeetingTimer
        totalElapsed={totalElapsed}
        totalEstimated={totalEstimated}
        isRunning={false}
      />,
    );

    // Should show 00:06:15
    expect(screen.getByText("06")).toBeInTheDocument(); // minutes
    expect(screen.getByText("15")).toBeInTheDocument(); // seconds
  });

  it("should apply correct styling for overtime state", () => {
    const { container } = render(
      <MeetingTimer
        totalElapsed={15 * 60 * 1000}
        totalEstimated={10}
        isRunning={true}
      />,
    );

    // Check for destructive color classes
    const destructiveElements = container.querySelectorAll(".text-destructive");
    expect(destructiveElements.length).toBeGreaterThan(0);

    // Check for overtime-specific classes
    const overtimeBorder = container.querySelector(".border-destructive\\/50");
    expect(overtimeBorder).toBeInTheDocument();
  });

  it("should apply correct styling for normal state", () => {
    const { container } = render(
      <MeetingTimer
        totalElapsed={5 * 60 * 1000}
        totalEstimated={10}
        isRunning={true}
      />,
    );

    // Check for primary color classes
    const primaryElements = container.querySelectorAll(".text-primary");
    expect(primaryElements.length).toBeGreaterThan(0);

    // Check for normal border
    const normalBorder = container.querySelector(".border-border");
    expect(normalBorder).toBeInTheDocument();
  });
});
