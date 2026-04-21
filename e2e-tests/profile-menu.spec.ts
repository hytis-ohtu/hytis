import { expect, Page } from "@playwright/test";
import { test } from "./testHelper";

async function openProfileMenu(page: Page) {
  await page.getByTestId("topbar-profile-button").click();
}

async function openSettingsMenu(page: Page) {
  await page.getByTestId("topbar-settings-button").click();
}

test("topbar menu can be opened and closed by the profile button", async ({
  page,
}) => {
  await openProfileMenu(page);
  await expect(page.getByText("Log Out")).toBeVisible();

  await openProfileMenu(page);
  await expect(page.getByText("Log Out")).not.toBeVisible();
});

test("topbar menu can be closed by clicking outside", async ({ page }) => {
  await openProfileMenu(page);
  await expect(page.getByText("Log Out")).toBeVisible();

  await page.click("body", { position: { x: 0, y: 0 } });
  await expect(page.getByText("Log Out")).not.toBeVisible();
});

test("topbar menu can be closed by the close button", async ({ page }) => {
  await openProfileMenu(page);
  await expect(page.getByText("Log Out")).toBeVisible();

  await page.getByTestId("profile-menu-close-button").click();
  await expect(page.getByText("Log Out")).not.toBeVisible();
});

test("logout shows redirect message", async ({ page }) => {
  await openProfileMenu(page);
  await page.getByText("Log Out").click();

  await expect(page.getByText("Redirecting to login page...")).toBeVisible();
});

test("topbar settings menu can be opened and closed", async ({ page }) => {
  await page.getByTestId("topbar-settings-button").click();
  await expect(page.getByTestId("settings-modal-title")).toBeVisible();

  await page.locator("button[aria-label='close']").click();
  await expect(page.getByTestId("settings-modal-title")).not.toBeVisible();
});
