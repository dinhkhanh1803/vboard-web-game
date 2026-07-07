import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfilePage } from "./ProfilePage";

describe("ProfilePage high fidelity profile UI", () => {
  it("renders the hero profile card and headline stats from local fixtures", () => {
    render(<ProfilePage />);

    expect(screen.getByRole("heading", { name: "Player One" })).toBeInTheDocument();
    expect(screen.getByText("Rank: Grandmaster")).toBeInTheDocument();
    expect(screen.getByText("EST. JUNE 2023")).toBeInTheDocument();
    expect(screen.getByText("Global Rank")).toBeInTheDocument();
    expect(screen.getByText("#422")).toBeInTheDocument();
    expect(screen.getByText("Total Wins")).toBeInTheDocument();
    expect(screen.getByText("1,248")).toBeInTheDocument();
    expect(screen.getByText("Total Losses")).toBeInTheDocument();
    expect(screen.getByText("314")).toBeInTheDocument();
    expect(screen.getByText("Win Rate")).toBeInTheDocument();
    expect(screen.getByText("79.8%")).toBeInTheDocument();
  });

  it("renders skill distribution, weekly activity, and match history table", () => {
    render(<ProfilePage />);

    expect(screen.getByRole("heading", { name: "Skill Distribution" })).toBeInTheDocument();
    expect(screen.getByText("Tactics")).toBeInTheDocument();
    expect(screen.getByText("94%")).toBeInTheDocument();
    expect(screen.getByText("Economy")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("Weekly Activity")).toBeInTheDocument();

    const history = screen.getByRole("table", { name: "Recent match history" });
    expect(within(history).getAllByText("Neon Chess").length).toBeGreaterThan(0);
    expect(within(history).getAllByText("Victory")).toHaveLength(4);
    expect(within(history).getByText("CyberKnight_99")).toBeInTheDocument();
    expect(within(history).getAllByText("Deck Masters").length).toBeGreaterThan(0);
    expect(within(history).getByText("Defeat")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View full history" })).toBeDisabled();
  });
});
