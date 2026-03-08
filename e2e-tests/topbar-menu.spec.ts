import { test, expect, Page } from "@playwright/test";

async function openProfileMenu(page: Page) {
  await page.getByTestId("topbar-profile-button").click();
}

test.beforeEach(async ({ page, request }) => {
  await request.post("http://localhost:3000/api/testing/reset");
  await page.goto("");
});

test("topbar menu can be opened and closed by the profile button", async ({
  page,
}) => {
  await openProfileMenu(page);
  await expect(page.getByTestId("topbar-settings-button")).toBeVisible();

  await openProfileMenu(page);
  await expect(page.getByTestId("topbar-settings-button")).not.toBeVisible();
});

test("topbar menu can be closed by clicking outside", async ({ page }) => {
  await openProfileMenu(page);
  await expect(page.getByTestId("topbar-settings-button")).toBeVisible();

  await page.click("body", { position: { x: 0, y: 0 } });
  await expect(page.getByTestId("topbar-settings-button")).not.toBeVisible();
});

test("topbar menu can be closed by the close button", async ({ page }) => {
  await openProfileMenu(page);
  await expect(page.getByTestId("topbar-settings-button")).toBeVisible();

  await page.getByTestId("profile-menu-close-button").click();
  await expect(page.getByTestId("topbar-settings-button")).not.toBeVisible();
});

test("logout shows redirect message", async ({ page }) => {
  await openProfileMenu(page);
  await page.getByText("Log Out").click();

  await expect(page.getByText("Redirecting to login page...")).toBeVisible();
});
