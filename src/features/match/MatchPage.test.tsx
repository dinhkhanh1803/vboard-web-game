import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MatchPage } from "@/features/match/MatchPage";

describe("MatchPage gameplay", () => {
  it("renders a local Connect 4 gameplay state and accepts column moves", () => {
    render(<MatchPage />);

    expect(screen.getByRole("heading", { name: "Connect 4 Match" })).toBeInTheDocument();
    expect(screen.getByLabelText("Interactive Connect 4 PixiJS board")).toBeInTheDocument();
    expect(screen.getAllByText("YOUR TURN").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Drop disc in column 4" }));

    expect(screen.getAllByText("OPPONENT'S TURN").length).toBeGreaterThan(0);
    expect(screen.getByText("P1 dropped in Column 4")).toBeInTheDocument();
  });

  it("shows the result panel when the local match completes", () => {
    render(<MatchPage />);

    for (const column of [1, 1, 2, 2, 3, 3, 4]) {
      fireEvent.click(screen.getByRole("button", { name: `Drop disc in column ${column}` }));
    }

    expect(screen.getByText("KHANH WINS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset local match" })).toBeInTheDocument();
  });

  it("renders a local Caro gameplay state and accepts cell moves", () => {
    render(<MatchPage initialGameId="caro" />);

    expect(screen.getByRole("heading", { name: "Caro Match" })).toBeInTheDocument();
    expect(screen.getByLabelText("Interactive Caro PixiJS board")).toBeInTheDocument();
    expect(screen.getAllByText("YOUR TURN").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Place stone at row 8 column 8" }));

    expect(screen.getAllByText("OPPONENT'S TURN").length).toBeGreaterThan(0);
    expect(screen.getByText("P1 placed stone at R8 C8")).toBeInTheDocument();
  });

  it("shows the Caro result panel when the local match completes", () => {
    render(<MatchPage initialGameId="caro" />);

    for (const [row, column] of [
      [8, 8],
      [9, 8],
      [8, 9],
      [9, 9],
      [8, 10],
      [9, 10],
      [8, 11],
      [9, 11],
      [8, 12],
    ]) {
      fireEvent.click(
        screen.getByRole("button", { name: `Place stone at row ${row} column ${column}` }),
      );
    }

    expect(screen.getByText("KHANH WINS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset local match" })).toBeInTheDocument();
  });
});
