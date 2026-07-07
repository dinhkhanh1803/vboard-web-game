import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { App } from "@/app/App";

function renderApp(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App shell", () => {
  it("uses the approved Kinetic Grid theme contract", () => {
    const { container } = renderApp();

    expect(container.querySelector(".app-frame")).toHaveAttribute("data-theme", "kinetic-grid");
  });

  it("renders the playable game hub on the home route", () => {
    renderApp();

    // Check Header brand
    expect(screen.getByRole("link", { name: "VBoard Arena" })).toBeInTheDocument();

    // Check Connect 4 Hero card
    expect(screen.getByRole("heading", { name: "Connect 4" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /PLAY NOW/i })).toHaveAttribute(
      "href",
      "/matches/demo-match",
    );

    // Check Custom Lobby CTA
    expect(screen.getByRole("link", { name: /GO TO LOBBY/i })).toHaveAttribute("href", "/lobby");

    // Check Active Arenas
    expect(screen.getByText("Active Arenas")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Grandmaster Chess" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pro Checkers" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Battle Poker" })).toBeInTheDocument();
  });

  it("renders header and sidebar navigation for MVP routes", () => {
    renderApp();

    expect(screen.getByRole("navigation", { name: "Sidebar navigation" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main Menu" })).toBeInTheDocument();

    // Sidebar nav links check
    const sidebar = screen.getByRole("navigation", { name: "Sidebar navigation" });
    expect(sidebar.querySelector('a[href="/"]')).toHaveTextContent("Home");
    expect(sidebar.querySelector('a[href="/games"]')).toHaveTextContent("Games");
    expect(sidebar.querySelector('a[href="/lobby"]')).toHaveTextContent("Lobby");
    expect(sidebar.querySelector('a[href="/leaderboard"]')).toHaveTextContent("Leaderboard");
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
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("LOCKED")).toBeInTheDocument();
  });

  it("renders the battle lobby layout with room-code validation", () => {
    renderApp("/lobby");

    expect(screen.getByRole("heading", { name: "Battle Lobby" })).toBeInTheDocument();
    expect(screen.getByText("Find your next opponent or join a squad.")).toBeInTheDocument();
    expect(screen.getByText("Live queue: 1,204 players")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start searching" })).toBeEnabled();
    expect(screen.getByRole("heading", { name: "Join by Code" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter rooms" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Refresh rooms" })).toBeDisabled();
    expect(screen.getByText("Available Rooms")).toBeInTheDocument();
    expect(screen.getByText("248 total")).toBeInTheDocument();
    expect(screen.getByText("CyberViper")).toBeInTheDocument();
    expect(screen.getByText("Rapid Chess")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join room VB-9921" })).toBeDisabled();

    const roomCodeInput = screen.getByLabelText("Room code");
    fireEvent.change(roomCodeInput, { target: { value: "abc" } });
    expect(screen.getByText("Use a code like VB-1042.")).toBeInTheDocument();

    fireEvent.change(roomCodeInput, { target: { value: "VB-1042" } });
    expect(screen.getByText("Code format ready for backend wiring.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enter arena" })).toBeEnabled();
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
    expect(screen.getByText("MATCH HISTORY")).toBeInTheDocument();
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
    expect(screen.getByRole("heading", { name: "Player One" })).toBeInTheDocument();
    expect(screen.getByText("Recent Match History")).toBeInTheDocument();

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
