import { expect, Page } from "@playwright/test";
import { test } from "./testHelper";

async function openSettings(page: Page) {
  await page.getByTestId("topbar-profile-button").click();
  await page.getByTestId("topbar-settings-button").click();
}

test("settings modal can be opened and closed", async ({ page }) => {
  await openSettings(page);
  await expect(page.getByTestId("settings-modal-title")).toBeVisible();
  await page.click("button[aria-label='close']");
  await expect(page.getByTestId("settings-modal-title")).not.toBeVisible();
});

test("font size changes when slider is adjusted", async ({ page }) => {
  await openSettings(page);
  const slider = page.getByRole("slider");
  await slider.fill("30");
  await expect(page.getByText("Kartan tekstin fonttikoko: 30px")).toBeVisible();

  const fontSizeValue = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--map-font-size")
      .trim(),
  );

  expect(fontSizeValue).toBe("30px");
});

test("font size persists after page reload", async ({ page }) => {
  await openSettings(page);
  const slider = page.getByRole("slider");
  await slider.fill("28");
  await page.reload();

  await openSettings(page);
  await expect(page.getByText("Kartan tekstin fonttikoko: 28px")).toBeVisible();
});
