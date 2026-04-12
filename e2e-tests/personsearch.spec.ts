import { expect, Page } from "@playwright/test";
import { test } from "./testHelper";

test.describe("PersonSearch", () => {
  test("search input is visible in the top bar", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await expect(searchInput).toBeVisible();
  });

  test("search dropdown appears when typing", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("Matti");

    // Wait for dropdown to appear
    const dropdown = page.getByTestId("person-search-dropdown");
    await expect(dropdown).toBeVisible();
  });

  test("search results are displayed", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("Matti");

    const dropdown = page.getByTestId("person-search-dropdown");

    // Check for result count
    await expect(dropdown.getByText("1 tulos")).toBeVisible();

    // Check for person name
    await expect(dropdown.getByText("Matti Virtanen")).toBeVisible();

    // Check for room number
    await expect(dropdown.getByText("A210")).toBeVisible();

    // Check for title
    await expect(dropdown.getByText("asiantuntija")).toBeVisible();

    // Check for department
    await expect(dropdown.getByText("H516 MATHSTAT")).toBeVisible();
  });

  test("search is case-insensitive", async ({ page }) => {
    // Test lowercase
    let searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("matti");
    await expect(page.getByText("Matti Virtanen")).toBeVisible();

    // Clear and test uppercase
    await searchInput.fill("");
    await searchInput.fill("MATTI");
    await expect(page.getByText("Matti Virtanen")).toBeVisible();

    // Clear and test mixed case
    await searchInput.fill("");
    searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("MaTtI");
    await expect(page.getByText("Matti Virtanen")).toBeVisible();
  });

  test("partial matching works correctly", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");

    // Search by partial first name
    await searchInput.fill("Mat");
    await expect(page.getByText("Matti Virtanen")).toBeVisible();

    // Search by partial last name
    await searchInput.fill("");
    await searchInput.fill("Virta");
    await expect(page.getByText("Matti Virtanen")).toBeVisible();
  });

  test("search results count is displayed", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("Mar"); // 3+ chars - matches Maria Silva

    // Wait for results
    const dropdown = page.getByTestId("person-search-dropdown");
    await expect(dropdown).toBeVisible();

    // Should show result count
    const resultText = await page.getByTestId(
      "person-search-results-count",
    ).textContent();
    expect(resultText).toMatch(/\d+ tulosta/);
    const count = parseInt(resultText?.split(" ")[0] || "0");
    expect(count).toBeGreaterThan(0);
  });

  test("no results message is displayed", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("NonexistentPersonXYZ");

    await expect(
      page.getByText('Ei tuloksia haulle "NonexistentPersonXYZ"'),
    ).toBeVisible();
  });

  test("dropdown closes when clicking outside", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("Matti");

    // Wait for dropdown to appear
    const dropdown = page.getByTestId("person-search-dropdown");
    await expect(dropdown).toBeVisible();

    // Click outside the dropdown
    await page.click("body", { position: { x: 10, y: 10 } });

    // Dropdown should close
    await expect(dropdown).not.toBeVisible();
  });

  test("dropdown closes when clicking X button", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("Matti");

    // Wait for dropdown to appear
    const dropdown = page.getByTestId("person-search-dropdown");
    await expect(dropdown).toBeVisible();

    // Click the close button
    await page.getByLabel("Sulje").click();

    // Dropdown should close
    await expect(dropdown).not.toBeVisible();
  });

  test("dropdown reopens when clicking search input", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("Matti");

    // Wait for dropdown to appear
    const dropdown = page.getByTestId("person-search-dropdown");
    await expect(dropdown).toBeVisible();

    // Close by clicking outside
    await page.click("body", { position: { x: 10, y: 10 } });
    await expect(dropdown).not.toBeVisible();

    // Reopen by clicking input
    await searchInput.click();
    await expect(dropdown).toBeVisible();
  });

  test("search input value is preserved when dropdown closes", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("Matti");

    // Wait for dropdown to appear
    await expect(page.getByTestId("person-search-dropdown")).toBeVisible();

    // Close dropdown
    await page.click("body", { position: { x: 10, y: 10 } });

    // Check input value is preserved
    const inputValue = await searchInput.inputValue();
    expect(inputValue).toBe("Matti");
  });

  test("search by last name works", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("Virtanen");

    await expect(page.getByText("Matti Virtanen")).toBeVisible();
    await expect(page.getByText("asiantuntija")).toBeVisible();
    await expect(page.getByText("H516 MATHSTAT")).toBeVisible();
  });

  test("person details are displayed correctly", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("Matti");

    // Check main result card
    const resultCard = page.locator(".person-search-result").first();
    await expect(resultCard).toBeVisible();

    // Check name is displayed
    await expect(
      resultCard.locator(".person-search-result-name"),
    ).toContainText("Matti Virtanen");

    // Check details section
    const details = resultCard.locator(".person-search-result-details");
    await expect(details).toContainText("asiantuntija");
    await expect(details).toContainText("H516 MATHSTAT");
  });

  test("search works with people who have supervisors", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("Jari");

    // Jari Nieminen should have Matti Virtanen as supervisor
    await expect(page.getByText("Jari Nieminen")).toBeVisible();
  });

  test("search results are clickable", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Hae henkilöä...");
    await searchInput.fill("Matti");

    const resultCard = page.locator(".person-search-result").first();
    await expect(resultCard).toBeVisible();
    await resultCard.click();

    // Currently clicking just logs to console, but test verifies it's clickable
    // Future implementation would navigate to person details
  });
});
