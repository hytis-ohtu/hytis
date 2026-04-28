import { expect, Page } from "@playwright/test";
import { test } from "./testHelper";

test("settings modal can be opened and closed", async ({ page }) => {
  await page.getByRole("button", { name: "Asetukset" }).click();
  await expect(page.getByRole("heading", { name: "Asetukset" })).toBeVisible();
  await page.getByRole("button", { name: "Sulje asetukset" }).click();
  await expect(
    page.getByRole("heading", { name: "Asetukset" }),
  ).not.toBeVisible();
});

test("font size changes when slider is adjusted", async ({ page }) => {
  await page.getByRole("button", { name: "Asetukset" }).click();
  const slider = page.getByRole("slider");
  await slider.fill("30");
  await expect(page.getByText("Kartan tekstin fonttikoko: 30px")).toBeVisible();

  const fontSizeValue = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-size-map")
      .trim(),
  );

  expect(fontSizeValue).toBe("30px");
});

test("font size persists after page reload", async ({ page }) => {
  await page.getByRole("button", { name: "Asetukset" }).click();
  const slider = page.getByRole("slider");
  await slider.fill("28");
  await expect(page.getByText("Kartan tekstin fonttikoko: 28px")).toBeVisible();
});
