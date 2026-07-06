import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LeaderboardPage } from "@/features/leaderboard/LeaderboardPage";

describe("LeaderboardPage", () => {
  it("renders contract-backed leaderboard rows with win rates", () => {
    render(<LeaderboardPage />);

    expect(screen.getByRole("heading", { name: "Leaderboard" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Leaderboard entries" })).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("Khanh")).toBeInTheDocument();
    expect(screen.getAllByText("Connect 4").length).toBeGreaterThan(0);
    expect(screen.getByText("1240")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("12W 3L 0D")).toBeInTheDocument();
  });
});
