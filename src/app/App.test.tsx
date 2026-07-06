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

  it("renders route stubs for product areas", () => {
    renderApp("/matches/demo-match");

    expect(screen.getByRole("heading", { name: "Match" })).toBeInTheDocument();
    expect(screen.getByText("Realtime match screen stub")).toBeInTheDocument();
  });
});
