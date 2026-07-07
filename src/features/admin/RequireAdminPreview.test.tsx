import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RequireAdminPreview } from "./RequireAdminPreview";

describe("RequireAdminPreview", () => {
  it("shows the sign-in boundary before local auth preview is enabled", () => {
    render(
      <RequireAdminPreview>
        <h1>Admin Console</h1>
      </RequireAdminPreview>,
    );

    expect(screen.getByRole("heading", { name: "Sign in required" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Admin Console" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to auth shell" })).toHaveAttribute(
      "href",
      "/profile/me",
    );
  });

  it("blocks signed-in players from admin controls", () => {
    render(
      <RequireAdminPreview signedIn viewerRole="player">
        <h1>Admin Console</h1>
      </RequireAdminPreview>,
    );

    expect(screen.getByRole("heading", { name: "Admin access required" })).toBeInTheDocument();
    expect(screen.getByText("Current role")).toBeInTheDocument();
    expect(screen.getByText("player")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Admin Console" })).not.toBeInTheDocument();
  });

  it("renders admin children for local admin preview role", () => {
    render(
      <RequireAdminPreview signedIn viewerRole="admin">
        <h1>Admin Console</h1>
      </RequireAdminPreview>,
    );

    expect(screen.getByRole("heading", { name: "Admin Console" })).toBeInTheDocument();
  });
});
