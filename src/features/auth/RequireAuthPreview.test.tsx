import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RequireAuthPreview } from "./RequireAuthPreview";

describe("RequireAuthPreview", () => {
  it("shows a local auth-required state before real Firebase auth exists", () => {
    render(
      <RequireAuthPreview routeName="Admin Console">
        <h1>Hidden Admin</h1>
      </RequireAuthPreview>,
    );

    expect(screen.getByRole("heading", { name: "Sign in required" })).toBeInTheDocument();
    expect(screen.getByText("Admin Console")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to auth shell" })).toHaveAttribute(
      "href",
      "/profile/me",
    );
    expect(screen.queryByRole("heading", { name: "Hidden Admin" })).not.toBeInTheDocument();
  });

  it("renders protected content when the local preview says the user is signed in", () => {
    render(
      <RequireAuthPreview routeName="Admin Console" signedIn>
        <h1>Visible Admin</h1>
      </RequireAuthPreview>,
    );

    expect(screen.getByRole("heading", { name: "Visible Admin" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Sign in required" })).not.toBeInTheDocument();
  });
});
