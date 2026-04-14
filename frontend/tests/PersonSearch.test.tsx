import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PersonSearch from "../src/components/PersonSearch";

// Mock the peopleService
const mockSearchPeople = vi.fn();
vi.mock("../src/services/peopleService", () => ({
  searchPeople: (...args: unknown[]) => mockSearchPeople(...args),
}));

const mockSelectRoom = vi.fn();

vi.mock("../src/hooks/useRoomSelection", () => ({
  useRoomSelection: () => ({
    activeRoomId: null,
    setActiveRoomId: vi.fn(),
    isSidePanelOpen: false,
    setIsSidePanelOpen: vi.fn(),
    room: null,
    setRoom: vi.fn(),
    selectRoom: mockSelectRoom,
    selectedPersonId: null,
  }),
}));

describe("PersonSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the search input", () => {
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");
    expect(searchInput).toBeInTheDocument();
  });

  it("does not show dropdown initially", () => {
    render(<PersonSearch />);

    const dropdown = screen.queryByTestId("person-search-dropdown");
    expect(dropdown).not.toBeInTheDocument();
  });

  it("opens dropdown when typing a search query", async () => {
    const mockResults = [
      {
        id: 1,
        firstName: "Matti",
        lastName: "Virtanen",
        department: { id: 1, name: "H516 MATHSTAT" },
        title: { name: "asiantuntija" },
      },
    ];

    mockSearchPeople.mockResolvedValue(mockResults);

    const user = userEvent.setup();
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");

    await user.type(searchInput, "Matti");

    await waitFor(() => {
      expect(mockSearchPeople).toHaveBeenCalledWith("Matti");
      const dropdown = screen.getByTestId("person-search-dropdown");
      expect(dropdown).toBeInTheDocument();
    });
  });

  it("displays search results in dropdown", async () => {
    const mockResults = [
      {
        id: 1,
        firstName: "Matti",
        lastName: "Virtanen",
        department: { id: 1, name: "H516 MATHSTAT" },
        title: { name: "asiantuntija" },
      },
      {
        id: 2,
        firstName: "Matti",
        lastName: "Meikäläinen",
        department: { id: 2, name: "H523 CS" },
        title: { name: "professori" },
      },
    ];

    mockSearchPeople.mockResolvedValue(mockResults);

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");

    await user.type(searchInput, "Matti");

    await waitFor(() => {
      expect(screen.getByText("2 tulosta")).toBeInTheDocument();
      expect(screen.getByText("Matti Virtanen")).toBeInTheDocument();
      expect(screen.getByText("Matti Meikäläinen")).toBeInTheDocument();
      expect(screen.getByText("asiantuntija")).toBeInTheDocument();
      expect(screen.getByText("professori")).toBeInTheDocument();
      expect(screen.getByText("H516 MATHSTAT")).toBeInTheDocument();
      expect(screen.getByText("H523 CS")).toBeInTheDocument();
    });
  });

  it("displays room number in search results when person has contract", async () => {
    const mockResults = [
      {
        id: 1,
        firstName: "Matti",
        lastName: "Virtanen",
        department: { id: 1, name: "H516 MATHSTAT" },
        title: { name: "asiantuntija" },
        contracts: [
          {
            id: 1,
            personId: 1,
            roomId: 1,
            startDate: "2023-01-01",
            endDate: "2025-12-31",
            room: { id: 1, name: "A210" },
          },
        ],
      },
    ];

    mockSearchPeople.mockResolvedValue(mockResults);

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");

    await user.type(searchInput, "Matti");

    await waitFor(() => {
      expect(screen.getByText("A210")).toBeInTheDocument();
      expect(screen.getByText("asiantuntija")).toBeInTheDocument();
      expect(screen.getByText("H516 MATHSTAT")).toBeInTheDocument();
    });
  });

  it("shows 'Ei tuloksia' message when no results found", async () => {
    mockSearchPeople.mockResolvedValue([]);

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");

    await user.type(searchInput, "Nonexistent");

    await waitFor(() => {
      expect(
        screen.getByText('Ei tuloksia haulle "Nonexistent"'),
      ).toBeInTheDocument();
    });
  });

  it("closes dropdown when clicking outside", async () => {
    const mockResults = [
      {
        id: 1,
        firstName: "Matti",
        lastName: "Virtanen",
        department: { id: 1, name: "H516 MATHSTAT" },
        title: { name: "asiantuntija" },
      },
    ];

    mockSearchPeople.mockResolvedValue(mockResults);

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");

    await user.type(searchInput, "Matti");

    await waitFor(() => {
      expect(screen.getByTestId("person-search-dropdown")).toBeInTheDocument();
    });

    // Click outside the dropdown
    await user.click(document.body);

    await waitFor(() => {
      expect(
        screen.queryByTestId("person-search-dropdown"),
      ).not.toBeInTheDocument();
    });
  });

  it("closes dropdown when clicking X button", async () => {
    const mockResults = [
      {
        id: 1,
        firstName: "Matti",
        lastName: "Virtanen",
        department: { id: 1, name: "H516 MATHSTAT" },
        title: { name: "asiantuntija" },
      },
    ];

    mockSearchPeople.mockResolvedValue(mockResults);

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");

    await user.type(searchInput, "Matti");

    await waitFor(() => {
      expect(screen.getByTestId("person-search-dropdown")).toBeInTheDocument();
    });

    // Find and click the close button
    const closeButton = screen.getByLabelText("Sulje");
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByTestId("person-search-dropdown"),
      ).not.toBeInTheDocument();
    });
  });

  it("reopens dropdown when clicking input after closing", async () => {
    const mockResults = [
      {
        id: 1,
        firstName: "Matti",
        lastName: "Virtanen",
        department: { id: 1, name: "H516 MATHSTAT" },
        title: { name: "asiantuntija" },
      },
    ];

    mockSearchPeople.mockResolvedValue(mockResults);

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");

    // Type to open dropdown
    await user.type(searchInput, "Matti");

    await waitFor(() => {
      expect(screen.getByTestId("person-search-dropdown")).toBeInTheDocument();
    });

    // Close by clicking outside
    await user.click(document.body);

    await waitFor(() => {
      expect(
        screen.queryByTestId("person-search-dropdown"),
      ).not.toBeInTheDocument();
    });

    // Click input to reopen
    await user.click(searchInput);

    await waitFor(() => {
      expect(screen.getByTestId("person-search-dropdown")).toBeInTheDocument();
    });
  });

  it("keeps search input value when dropdown is closed", async () => {
    const mockResults = [
      {
        id: 1,
        firstName: "Matti",
        lastName: "Virtanen",
        department: { id: 1, name: "H516 MATHSTAT" },
        title: { name: "asiantuntija" },
      },
    ];

    mockSearchPeople.mockResolvedValue(mockResults);

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText(
      "Hae henkilöä...",
    ) as HTMLInputElement;

    await user.type(searchInput, "Matti");

    await waitFor(() => {
      expect(searchInput.value).toBe("Matti");
    });

    // Close dropdown
    await user.click(document.body);

    await waitFor(() => {
      expect(
        screen.queryByTestId("person-search-dropdown"),
      ).not.toBeInTheDocument();
    });

    // Check input value is preserved
    expect(searchInput.value).toBe("Matti");
  });

  it("debounces search API calls", async () => {
    mockSearchPeople.mockResolvedValue([]);

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");

    // Type multiple characters quickly
    await user.type(searchInput, "Matti");

    // With 300ms debounce, there should only be 1 or 2 calls, not 5
    // depending on timing
    await waitFor(
      () => {
        expect(mockSearchPeople).toHaveBeenCalled();
        const callCount = mockSearchPeople.mock.calls.length;
        expect(callCount).toBeLessThanOrEqual(2);
      },
      { timeout: 1000 },
    );
  });

  it("handles API errors gracefully", async () => {
    mockSearchPeople.mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");

    await user.type(searchInput, "Matti");

    await waitFor(() => {
      expect(mockSearchPeople).toHaveBeenCalledWith("Matti");
    });

    // Should show error message in dropdown
    const dropdown = screen.getByTestId("person-search-dropdown");
    const errorMessage = screen.getByText("Virhe henkilöiden haussa");
    expect(dropdown).toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
  });

  it("calls selectRoom with correct parameters when clicking person with contract", async () => {
    const mockResults = [
      {
        id: 1,
        firstName: "Matti",
        lastName: "Virtanen",
        department: { id: 1, name: "H516 MATHSTAT" },
        title: { name: "asiantuntija" },
        contracts: [
          {
            id: 1,
            personId: 1,
            roomId: 1,
            startDate: "2023-01-01",
            endDate: "2025-12-31",
            room: { id: 42, name: "A210" },
          },
        ],
      },
    ];

    mockSearchPeople.mockResolvedValue(mockResults);

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");
    await user.type(searchInput, "Matti");

    await waitFor(() => {
      expect(screen.getByText("Matti Virtanen")).toBeInTheDocument();
    });

    const personResult = screen.getByText("Matti Virtanen");
    await user.click(personResult);

    expect(mockSelectRoom).toHaveBeenCalledWith("42", 1);
  });

  it("does not call selectRoom when clicking person without contract", async () => {
    const mockResults = [
      {
        id: 1,
        firstName: "Matti",
        lastName: "Virtanen",
        department: { id: 1, name: "H516 MATHSTAT" },
        title: { name: "asiantuntija" },
        contracts: [],
      },
    ];

    mockSearchPeople.mockResolvedValue(mockResults);

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");
    await user.type(searchInput, "Matti");

    await waitFor(() => {
      expect(screen.getByText("Matti Virtanen")).toBeInTheDocument();
    });

    const personResult = screen.getByText("Matti Virtanen");
    await user.click(personResult);

    expect(mockSelectRoom).not.toHaveBeenCalled();
  });

  it("logs to console when person has no room assignment", async () => {
    const consoleLogSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    const mockResults = [
      {
        id: 1,
        firstName: "Matti",
        lastName: "Virtanen",
        department: { id: 1, name: "H516 MATHSTAT" },
        title: { name: "asiantuntija" },
        contracts: [],
      },
    ];

    mockSearchPeople.mockResolvedValue(mockResults);

    const user = userEvent.setup({ delay: null });
    render(<PersonSearch />);

    const searchInput = screen.getByPlaceholderText("Hae henkilöä...");
    await user.type(searchInput, "Matti");

    await waitFor(() => {
      expect(screen.getByText("Matti Virtanen")).toBeInTheDocument();
    });

    const personResult = screen.getByText("Matti Virtanen");
    await user.click(personResult);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Person has no room assignment",
    );

    consoleLogSpy.mockRestore();
  });
});
