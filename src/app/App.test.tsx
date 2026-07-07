import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { App } from "@/app/App";
import { techStack } from "@/shared/constants/techStack";

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App shell", () => {
  it("renders the playable game hub on the home route", () => {
    renderApp();

    expect(screen.getByRole("heading", { name: "VBoard Arena" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play Connect 4" })).toHaveAttribute(
      "href",
      "/matches/demo-match",
    );
    expect(screen.getByRole("link", { name: "Open Lobby" })).toHaveAttribute("href", "/lobby");
    expect(screen.getByText("Playable now")).toBeInTheDocument();
    expect(screen.getByText(techStack.renderer)).toHaveTextContent("PixiJS");
  });

  it("renders development navigation for MVP routes", () => {
    renderApp();

    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Games" })).toHaveAttribute("href", "/games");
    expect(screen.getByRole("link", { name: "Lobby" })).toHaveAttribute("href", "/lobby");
    expect(screen.getByRole("link", { name: "Leaderboard" })).toHaveAttribute(
      "href",
      "/leaderboard",
    );
  });

  it("renders the polished games catalog", () => {
    renderApp("/games");

    expect(screen.getByRole("heading", { name: "Games" })).toBeInTheDocument();
    expect(screen.getByText("Connect 4")).toBeInTheDocument();
    expect(screen.getByText("Caro")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play Connect 4 demo" })).toHaveAttribute(
      "href",
      "/matches/demo-match",
    );
    expect(screen.getByText("Playable now")).toBeInTheDocument();
    expect(screen.getByText("Preview locked")).toBeInTheDocument();
  });

  it("renders lobby entry points with local room-code validation", () => {
    renderApp("/lobby");

    expect(screen.getByRole("heading", { name: "Lobby" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find quick match" })).toBeDisabled();
    expect(screen.getByText("Public Rooms")).toBeInTheDocument();
    expect(screen.getAllByText("UI-only preview").length).toBeGreaterThan(0);

    const roomCodeInput = screen.getByLabelText("Room code");
    fireEvent.change(roomCodeInput, { target: { value: "abc" } });
    expect(screen.getByText("Use a code like VB-1042.")).toBeInTheDocument();

    fireEvent.change(roomCodeInput, { target: { value: "VB-1042" } });
    expect(screen.getByText("Code format ready for backend wiring.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join room preview" })).toBeEnabled();
  });

  it("renders the waiting room shell with scan-friendly player states", () => {
    renderApp("/rooms/demo-room");

    expect(screen.getByRole("heading", { name: "Waiting Room" })).toBeInTheDocument();
    expect(screen.getByText("Room Code")).toBeInTheDocument();
    expect(screen.getByText("Local room preview")).toBeInTheDocument();
    expect(screen.getByText("Host ready")).toBeInTheDocument();
    expect(screen.getByText("Opponent slot open")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy invite link" })).toBeDisabled();
  });

  it("renders the playable match shells with PixiJS board controls", () => {
    renderApp("/matches/demo-match");

    expect(screen.getByRole("heading", { name: "Connect 4 Match" })).toBeInTheDocument();
    expect(screen.getByLabelText("Interactive Connect 4 PixiJS board")).toBeInTheDocument();
    expect(screen.getByText("Move Log")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Drop disc in column 4" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Reset local match" })).toBeInTheDocument();

    renderApp("/matches/demo-caro");

    expect(screen.getByRole("heading", { name: "Caro Match" })).toBeInTheDocument();
    expect(screen.getByLabelText("Interactive Caro PixiJS board")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Place stone at row 8 column 8" })).toBeEnabled();
  });

  it("renders leaderboard, profile, protected admin, and content shells", () => {
    renderApp("/leaderboard");
    expect(screen.getByRole("heading", { name: "Leaderboard" })).toBeInTheDocument();
    expect(screen.getByText("Season Rank")).toBeInTheDocument();

    renderApp("/profile/me");
    expect(screen.getByRole("heading", { name: "Player Profile" })).toBeInTheDocument();
    expect(screen.getByText("Recent Matches")).toBeInTheDocument();

    renderApp("/admin");
    expect(screen.getByRole("heading", { name: "Sign in required" })).toBeInTheDocument();
    expect(screen.getByText("Admin Console")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to auth shell" })).toHaveAttribute(
      "href",
      "/profile/me",
    );

    renderApp("/privacy-policy");
    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument();
  });
});
