import { test, expect } from "@playwright/test";

test("room labels are shown on the floor map", async ({ page }) => {
  await page.goto("http://localhost:5173");

  await page.waitForSelector(".room-group");

  const roomLabel = page
    .locator(".room-label")
    .filter({ hasText: "A210" })
    .first();
  await expect(roomLabel).toBeVisible();

  const tspans = roomLabel.locator("tspan");
  await expect(tspans).toHaveCount(3);
  await expect(tspans.nth(0)).toHaveText("A210");
  await expect(tspans.nth(1)).toHaveText("63.60m²");
  await expect(tspans.nth(2)).toHaveText("3/15");
});

test("room has correct availability color based on occupancy", async ({
  page,
}) => {
  await page.goto("http://localhost:5173");

  await page.waitForSelector(".room-group");

  const availableRoom = page.locator('[data-room="A210"]');
  await expect(availableRoom).toHaveClass(/available/);

  const limitedRoom = page.locator('[data-room="A211"]');
  await expect(limitedRoom).toHaveClass(/limited/);

  const fullRoom = page.locator('[data-room="A212"]');
  await expect(fullRoom).toHaveClass(/full/);
});
