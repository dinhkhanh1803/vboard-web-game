import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { ContentPage } from "./ContentPage";

function renderContent(routeId: "privacy" | "terms" | "contact") {
  render(
    <MemoryRouter>
      <ContentPage routeId={routeId} />
    </MemoryRouter>,
  );
}

describe("ContentPage documentation UI", () => {
  it("renders the high fidelity privacy and terms documentation page", () => {
    renderContent("privacy");

    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Terms of Service" })).toBeInTheDocument();
    expect(screen.getByText("Documentation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "/privacy-policy",
    );
    expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(screen.getByRole("link", { name: "Contact Support" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByRole("button", { name: "Open ticket" })).toBeDisabled();

    const policy = screen.getByRole("region", { name: "Privacy Policy" });
    expect(within(policy).getByText("Data Collection")).toBeInTheDocument();
    expect(within(policy).getByText("Encryption")).toBeInTheDocument();
    expect(
      within(policy).getByRole("heading", { name: /Profile Transparency/ }),
    ).toBeInTheDocument();
    expect(
      within(policy).getByRole("heading", { name: /Third-Party Analytics/ }),
    ).toBeInTheDocument();

    const terms = screen.getByRole("region", { name: "Terms of Service" });
    expect(within(terms).getByText("Fair Play & Anti-Cheat")).toBeInTheDocument();
    expect(within(terms).getByText("Account Responsibility")).toBeInTheDocument();
  });
});
