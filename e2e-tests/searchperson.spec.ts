import { expect, Page } from "@playwright/test";
import { test } from "./testHelper";

test.describe("PersonSearch", () => {
  test("search input is visible in the top bar", async ({ page }) => {
    await expect(page.getByPlaceholder("Hae henkilöä...")).toBeVisible();
  });

  test("dropdown appears and shows correct result data when typing", async ({
    page,
  }) => {
    await page.getByPlaceholder("Hae henkilöä...").fill("Matti");

    const dropdown = page.getByTestId("person-search-dropdown");
    await expect(dropdown).toBeVisible();
    await expect(dropdown.getByText("1 tulos")).toBeVisible();
    await expect(dropdown.getByText("Matti Virtanen")).toBeVisible();
    await expect(dropdown.getByText("A210")).toBeVisible();
    await expect(dropdown.getByText("asiantuntija")).toBeVisible();
    await expect(dropdown.getByText("H516 MATHSTAT")).toBeVisible();
  });

  test("search is case-insensitive and supports partial matching", async ({
    page,
  }) => {
    const input = page.getByPlaceholder("Hae henkilöä...");

    await input.fill("matti");
    await expect(page.getByText("Matti Virtanen")).toBeVisible();

    await input.fill("VIRTA");
    await expect(page.getByText("Matti Virtanen")).toBeVisible();
  });

  test("no results message is shown for unmatched query", async ({ page }) => {
    await page.getByPlaceholder("Hae henkilöä...").fill("NonexistentPersonXYZ");
    await expect(
      page.getByText('Ei tuloksia haulle "NonexistentPersonXYZ"'),
    ).toBeVisible();
  });

  test("dropdown closes when clicking outside", async ({ page }) => {
    await page.getByPlaceholder("Hae henkilöä...").fill("Matti");
    const dropdown = page.getByTestId("person-search-dropdown");
    await expect(dropdown).toBeVisible();

    await page.click("body", { position: { x: 10, y: 10 } });
    await expect(dropdown).not.toBeVisible();
  });

  test("dropdown closes when clicking X button", async ({ page }) => {
    await page.getByPlaceholder("Hae henkilöä...").fill("Matti");
    const dropdown = page.getByTestId("person-search-dropdown");
    await expect(dropdown).toBeVisible();

    await page.getByLabel("Sulje").click();
    await expect(dropdown).not.toBeVisible();
  });
});

test("dropdown reopens when clicking search input", async ({ page }) => {
  const searchInput = page.getByPlaceholder("Hae henkilöä...");
  await searchInput.fill("Matti");

  const dropdown = page.getByTestId("person-search-dropdown");
  await expect(dropdown).toBeVisible();

  await page.click("body", { position: { x: 10, y: 10 } });
  await expect(dropdown).not.toBeVisible();

  await searchInput.click();
  await expect(dropdown).toBeVisible();
});
