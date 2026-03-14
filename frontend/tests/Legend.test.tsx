import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Legend from "../src/components/Legend";

describe("Legend", () => {
  it("renders without crashing", () => {
    render(<Legend mode="availability" />);
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  describe("availability mode", () => {
    it("renders all three availability entries", () => {
      render(<Legend mode="availability" />);

      expect(screen.getByText("Available")).toBeInTheDocument();
      expect(screen.getByText("Limited")).toBeInTheDocument();
      expect(screen.getByText("Full")).toBeInTheDocument();
    });

    it("does not render department entries", () => {
      render(<Legend mode="availability" />);

      expect(screen.queryByText("H516 MATHSTAT")).not.toBeInTheDocument();
      expect(screen.queryByText("H523 CS")).not.toBeInTheDocument();
    });

    it("renders correct color for available status", () => {
      render(<Legend mode="availability" />);

      const availableLabel = screen.getByText("Available");
      const colorBox = availableLabel.previousElementSibling;

      expect(colorBox).toHaveStyle({ backgroundColor: "#4ade80" });
    });

    it("renders correct color for limited status", () => {
      render(<Legend mode="availability" />);

      const limitedLabel = screen.getByText("Limited");
      const colorBox = limitedLabel.previousElementSibling;

      expect(colorBox).toHaveStyle({ backgroundColor: "#facc15" });
    });

    it("renders correct color for full status", () => {
      render(<Legend mode="availability" />);

      const fullLabel = screen.getByText("Full");
      const colorBox = fullLabel.previousElementSibling;

      expect(colorBox).toHaveStyle({ backgroundColor: "#f87171" });
    });
  });

  describe("department mode", () => {
    it("renders all department entries", () => {
      render(<Legend mode="department" />);

      expect(screen.getByText("H516 MATHSTAT")).toBeInTheDocument();
      expect(screen.getByText("H523 CS")).toBeInTheDocument();
    });

    it("does not render availability entries", () => {
      render(<Legend mode="department" />);

      expect(screen.queryByText("Available")).not.toBeInTheDocument();
      expect(screen.queryByText("Limited")).not.toBeInTheDocument();
      expect(screen.queryByText("Full")).not.toBeInTheDocument();
    });

    it("renders correct color for H516 MATHSTAT department", () => {
      render(<Legend mode="department" />);

      const mathstatLabel = screen.getByText("H516 MATHSTAT");
      const colorBox = mathstatLabel.previousElementSibling;

      expect(colorBox).toHaveStyle({ backgroundColor: "#4ade80" });
    });

    it("renders correct color for H523 CS department", () => {
      render(<Legend mode="department" />);

      const csLabel = screen.getByText("H523 CS");
      const colorBox = csLabel.previousElementSibling;

      expect(colorBox).toHaveStyle({ backgroundColor: "#667eea" });
    });
  });

  it("renders all entries with the legend-item class", () => {
    const { container } = render(<Legend mode="availability" />);

    const items = container.querySelectorAll(".legend-item");
    expect(items.length).toBe(3);
  });
});
