import { expect } from "@playwright/test";
import { test } from "./testHelper";

test("legend is visible on page load with availability entries", async ({
  page,
}) => {
  const legend = page.getByTestId("legend");
  await expect(legend).toBeVisible();
  await expect(legend.getByText("Tyhjä")).toBeVisible();
  await expect(legend.getByText("Tilaa")).toBeVisible();
  await expect(legend.getByText("Täynnä")).toBeVisible();
});

test("legend shows correct number of entries in department mode", async ({
  page,
}) => {
  const colorModeButton = page.getByTestId("switch-color-mode");
  await colorModeButton.click();

  const legend = page.getByTestId("legend");

  const legendItems = legend.locator(".legend-item");
  await expect(legendItems).toHaveCount(2);
});

test("legend switches to department mode and back", async ({ page }) => {
  const colorModeButton = page.getByTestId("switch-color-mode");
  const legend = page.getByTestId("legend");

  await colorModeButton.click();
  await expect(legend.getByText("H516 MATHSTAT")).toBeVisible();
  await expect(legend.getByText("H523 CS")).toBeVisible();
  await expect(legend.getByText("Tyhjä")).not.toBeVisible();

  await colorModeButton.click();
  await expect(legend.getByText("Tyhjä")).toBeVisible();
  await expect(legend.getByText("H516 MATHSTAT")).not.toBeVisible();
});
