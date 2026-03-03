import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RoomDetails from "../src/components/RoomDetails.tsx";

const mockHandleClose = () => vi.fn();

describe("RoomDetails", () => {
  it("renders nothing if there is no room data", () => {
    const { container } = render(
      <RoomDetails room={null} handleClose={mockHandleClose} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
