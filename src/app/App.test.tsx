import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "@/app/App";
import { techStack } from "@/shared/constants/techStack";

describe("App", () => {
  it("renders the selected project stack", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "VBoard Arena" })).toBeInTheDocument();
    expect(screen.getByText(techStack.app)).toBeInTheDocument();
    expect(screen.getByText(techStack.renderer)).toHaveTextContent("PixiJS");
    expect(screen.getByText(techStack.backend)).toBeInTheDocument();
  });
});
