import { expect } from "@playwright/test";
import { test } from "./testHelper";

test("legend shows correct entries in availability mode", async ({ page }) => {
  const legend = page.getByTestId("legend");

  await expect(legend.getByText("Tyhjä")).toBeVisible();
  await expect(legend.getByText("Tilaa")).toBeVisible();
  await expect(legend.getByText("Täynnä")).toBeVisible();

  const legendItems = legend.locator(".legend-item");
  await expect(legendItems).toHaveCount(3);
});

test("legend shows correct entries in department mode", async ({ page }) => {
  const colorToggle = page.getByRole("button", { name: /vastuualueet/i });
  await colorToggle.click();

  const legend = page.getByTestId("legend");

  await expect(legend.getByText("H516 MATHSTAT")).toBeVisible();
  await expect(legend.getByText("H523 CS")).toBeVisible();

  const legendItems = legend.locator(".legend-item");
  await expect(legendItems).toHaveCount(2);
});
