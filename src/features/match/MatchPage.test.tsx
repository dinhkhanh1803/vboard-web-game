import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MatchPage } from "@/features/match/MatchPage";

describe("MatchPage gameplay", () => {
  it("renders a local Connect 4 gameplay state and accepts column moves", () => {
    render(<MatchPage />);

    expect(screen.getByRole("heading", { name: "Connect 4 Match" })).toBeInTheDocument();
    expect(screen.getByLabelText("Interactive Connect 4 PixiJS board")).toBeInTheDocument();
    expect(screen.getAllByText("Turn: Khanh").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Drop disc in column 4" }));

    expect(screen.getAllByText("Turn: Arena Bot").length).toBeGreaterThan(0);
    expect(screen.getByText("Red C4")).toBeInTheDocument();
  });

  it("shows the result panel when the local match completes", () => {
    render(<MatchPage />);

    for (const column of [1, 1, 2, 2, 3, 3, 4]) {
      fireEvent.click(screen.getByRole("button", { name: `Drop disc in column ${column}` }));
    }

    expect(screen.getByText("Khanh wins")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset local match" })).toBeInTheDocument();
  });
});
