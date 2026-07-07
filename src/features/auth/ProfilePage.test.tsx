import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { demoPublicProfile } from "@/shared/constants/profileFixtures";

import { ProfilePage } from "./ProfilePage";

describe("ProfilePage auth shell", () => {
  it("renders static auth entry states before Firebase providers are wired", () => {
    render(<ProfilePage />);

    expect(screen.getByRole("heading", { name: "Auth Entry" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue with email" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Continue as guest" })).toBeDisabled();
    expect(screen.getByText("Firebase Auth is not connected yet.")).toBeInTheDocument();
  });

  it("tracks the selected auth mode locally for future provider wiring", () => {
    render(<ProfilePage />);

    fireEvent.click(screen.getByRole("button", { name: "Preview Google" }));

    expect(screen.getByText("Selected mode")).toBeInTheDocument();
    expect(screen.getByText("Google provider")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Preview guest" }));

    expect(screen.getByText("Guest player")).toBeInTheDocument();
  });

  it("renders the profile summary from the shared PublicProfile fixture", () => {
    render(<ProfilePage />);

    expect(
      screen.getByRole("heading", { name: demoPublicProfile.displayName }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Level ${demoPublicProfile.level} - ${demoPublicProfile.xp} XP`),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(String(demoPublicProfile.statsByGame["connect-4"].elo)).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("12W 3L")).toBeInTheDocument();
    expect(screen.getByText("15 games")).toBeInTheDocument();
  });
  it("renders per-game progression stats and recent match history", () => {
    render(<ProfilePage />);

    expect(screen.getByRole("heading", { name: "Game Stats" })).toBeInTheDocument();
    expect(screen.getByText("Connect 4")).toBeInTheDocument();
    expect(screen.getByText("Caro")).toBeInTheDocument();
    expect(screen.getByText("80% win rate")).toBeInTheDocument();
    expect(screen.getByText("62% win rate")).toBeInTheDocument();
    expect(screen.getByText("vs Arena Bot")).toBeInTheDocument();
    expect(screen.getByText("+16 Elo")).toBeInTheDocument();
    expect(screen.getByText("win - Connect 4")).toBeInTheDocument();
  });
  it("renders a report-player safety preview from moderation contracts", () => {
    render(<ProfilePage />);

    expect(screen.getByRole("heading", { name: "Report Player" })).toBeInTheDocument();
    expect(screen.getByLabelText("Report reason")).toBeInTheDocument();
    expect(screen.getByLabelText("Report details")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit report preview" })).toBeDisabled();
    expect(screen.getByText("reports/{reportId}")).toBeInTheDocument();
  });
});
