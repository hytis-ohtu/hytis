import { expect } from "@playwright/test";
import { test } from "./testHelper";

test("room labels are shown on the floor map", async ({ page }) => {
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
  const availableRoom = page.locator('[data-room="A210"]');
  await expect(availableRoom).toHaveClass(/available/);

  const limitedRoom = page.locator('[data-room="A211"]');
  await expect(limitedRoom).toHaveClass(/limited/);

  const fullRoom = page.locator('[data-room="A212"]');
  await expect(fullRoom).toHaveClass(/full/);
});

test("room details panel is shown with room name when clicking room from the map", async ({
  page,
}) => {
  const availableRoom = page.locator('[data-room="A210"]');
  await availableRoom.click();
  await expect(page.getByRole("heading", { name: "Huone" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A210" })).toBeVisible();
});

test("side panel is closed when clicking the close button", async ({
  page,
}) => {
  const availableRoom = page.locator('[data-room="A210"]');
  await availableRoom.click();

  const closeButton = page.getByRole("button", { name: /^sulje huone$/i });
  await closeButton.click();

  await expect(page.getByRole("heading", { name: "Huone" })).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "A210" })).not.toBeVisible();
});
