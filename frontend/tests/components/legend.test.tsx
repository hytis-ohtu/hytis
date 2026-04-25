import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Legend from "../../src/components/MainView/Legend/Legend";

describe("Legend", () => {
  it("renders without crashing", () => {
    render(<Legend mode="availability" />);
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  describe("availability mode", () => {
    it("renders all three availability entries", () => {
      render(<Legend mode="availability" />);

      expect(screen.getByText("Tyhjä")).toBeInTheDocument();
      expect(screen.getByText("Tilaa")).toBeInTheDocument();
      expect(screen.getByText("Täynnä")).toBeInTheDocument();
    });

    it("does not render department entries", () => {
      render(<Legend mode="availability" />);

      expect(screen.queryByText("H516 MATHSTAT")).not.toBeInTheDocument();
      expect(screen.queryByText("H523 CS")).not.toBeInTheDocument();
    });

    it("renders correct color for available status", () => {
      render(<Legend mode="availability" />);

      const availableLabel = screen.getByText("Tyhjä");
      const colorBox = availableLabel.previousElementSibling;

      expect(colorBox).toHaveStyle({ backgroundColor: "#4ade80" });
    });

    it("renders correct color for limited status", () => {
      render(<Legend mode="availability" />);

      const limitedLabel = screen.getByText("Tilaa");
      const colorBox = limitedLabel.previousElementSibling;

      expect(colorBox).toHaveStyle({ backgroundColor: "#facc15" });
    });

    it("renders correct color for full status", () => {
      render(<Legend mode="availability" />);

      const fullLabel = screen.getByText("Täynnä");
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

      expect(screen.queryByText("Tyhjä")).not.toBeInTheDocument();
      expect(screen.queryByText("Tilaa")).not.toBeInTheDocument();
      expect(screen.queryByText("Täynnä")).not.toBeInTheDocument();
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
