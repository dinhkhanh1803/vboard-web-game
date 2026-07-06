import { render, screen } from "@testing-library/react";
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
  it("renders the selected project stack on the home route", () => {
    renderApp();

    expect(screen.getByRole("heading", { name: "VBoard Arena" })).toBeInTheDocument();
    expect(screen.getByText(techStack.app)).toBeInTheDocument();
    expect(screen.getByText(techStack.renderer)).toHaveTextContent("PixiJS");
    expect(screen.getByText(techStack.backend)).toBeInTheDocument();
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

  it("renders the static games catalog", () => {
    renderApp("/games");

    expect(screen.getByRole("heading", { name: "Games" })).toBeInTheDocument();
    expect(screen.getByText("Connect 4")).toBeInTheDocument();
    expect(screen.getByText("Caro")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Connect 4 lobby" })).toBeDisabled();
  });

  it("renders the lobby entry points", () => {
    renderApp("/lobby");

    expect(screen.getByRole("heading", { name: "Lobby" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find quick match" })).toBeDisabled();
    expect(screen.getByLabelText("Room code")).toBeInTheDocument();
    expect(screen.getByText("Public Rooms")).toBeInTheDocument();
    expect(screen.getAllByText("UI-only preview").length).toBeGreaterThan(0);
  });

  it("renders the waiting room shell", () => {
    renderApp("/rooms/demo-room");

    expect(screen.getByRole("heading", { name: "Waiting Room" })).toBeInTheDocument();
    expect(screen.getByText("Room Code")).toBeInTheDocument();
    expect(screen.getByText("Ready Check")).toBeInTheDocument();
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
