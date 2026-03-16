import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  await request.post("http://localhost:3000/api/testing/reset");
  await page.goto("");
  await page.waitForSelector(".room-group");
});

test("legend is visible on page load", async ({ page }) => {
  const legend = page.getByTestId("legend");
  await expect(legend).toBeVisible();
});

test("legend shows availability mode entries by default", async ({ page }) => {
  const legend = page.getByTestId("legend");

  // Check that availability mode entries are visible
  await expect(legend.getByText("Available")).toBeVisible();
  await expect(legend.getByText("Limited")).toBeVisible();
  await expect(legend.getByText("Full")).toBeVisible();
});

test("legend shows correct colors for availability mode", async ({ page }) => {
  const legend = page.getByTestId("legend");

  // Check color boxes are present
  const colorBoxes = legend.locator(".legend-color-box");
  await expect(colorBoxes).toHaveCount(3);

  // Check that labels match availability entries
  await expect(legend.locator(".legend-item").nth(0)).toContainText("Available");
  await expect(legend.locator(".legend-item").nth(1)).toContainText("Limited");
  await expect(legend.locator(".legend-item").nth(2)).toContainText("Full");
});

test("legend switches to department mode when button is clicked", async ({
  page,
}) => {
  const colorModeButton = page.getByTestId("switch-color-mode");
  await colorModeButton.click();

  const legend = page.getByTestId("legend");

  // Check that department mode entries are visible
  await expect(legend.getByText("H516 MATHSTAT")).toBeVisible();
  await expect(legend.getByText("H523 CS")).toBeVisible();

  // Availability entries should not be visible
  await expect(legend.getByText("Available")).not.toBeVisible();
  await expect(legend.getByText("Limited")).not.toBeVisible();
  await expect(legend.getByText("Full")).not.toBeVisible();
});

test("legend shows correct number of entries in department mode", async ({
  page,
}) => {
  const colorModeButton = page.getByTestId("switch-color-mode");
  await colorModeButton.click();

  const legend = page.getByTestId("legend");

  // Should have 2 department entries
  const legendItems = legend.locator(".legend-item");
  await expect(legendItems).toHaveCount(2);
});

test("legend switches back to availability mode when button is clicked again", async ({
  page,
}) => {
  const colorModeButton = page.getByTestId("switch-color-mode");

  // Switch to department mode
  await colorModeButton.click();

  // Verify department mode is active
  await expect(page.getByTestId("legend").getByText("H516 MATHSTAT")).toBeVisible();

  // Switch back to availability mode
  await colorModeButton.click();

  const legend = page.getByTestId("legend");

  // Check that availability mode entries are visible again
  await expect(legend.getByText("Available")).toBeVisible();
  await expect(legend.getByText("Limited")).toBeVisible();
  await expect(legend.getByText("Full")).toBeVisible();

  // Department entries should not be visible
  await expect(legend.getByText("H516 MATHSTAT")).not.toBeVisible();
  await expect(legend.getByText("H523 CS")).not.toBeVisible();
});
