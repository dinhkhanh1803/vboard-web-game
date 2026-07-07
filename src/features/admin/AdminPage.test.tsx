import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminPage } from "./AdminPage";

describe("AdminPage", () => {
  it("renders contract-backed moderation queue and feature flag previews", () => {
    render(<AdminPage />);

    expect(screen.getByRole("heading", { name: "Admin Console" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Moderation Queue" })).toBeInTheDocument();
    expect(screen.getByText("reports/{reportId}")).toBeInTheDocument();
    expect(screen.getByText("Arena Bot")).toBeInTheDocument();
    expect(screen.getByText("cheating")).toBeInTheDocument();
    expect(screen.getByText("open")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Feature Flags" })).toBeInTheDocument();
    expect(screen.getByText("Connect 4")).toBeInTheDocument();
    expect(screen.getByText("Caro")).toBeInTheDocument();
    expect(screen.getByText("Matchmaking enabled")).toBeInTheDocument();
    expect(screen.getByText("Matchmaking disabled")).toBeInTheDocument();
  });
});
