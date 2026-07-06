import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
});
