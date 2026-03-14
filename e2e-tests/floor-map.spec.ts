import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  await request.post("http://localhost:3000/api/testing/reset");
  await page.goto("");
  await page.waitForSelector(".room-group");
});

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

test("room details panel is hidden when clicking the close button", async ({
  page,
}) => {
  const availableRoom = page.locator('[data-room="A210"]');
  await availableRoom.click();

  const closeButton = page.getByTestId("close-room-details-panel");
  await closeButton.click();

  await expect(page.getByRole("heading", { name: "Huone" })).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "A210" })).not.toBeVisible();
});

test("zooming in with button works", async ({ page }) => {
  const mapBefore = await page.locator(".map-container");
  const scaleBefore = await mapBefore.evaluate((el) => {
    return Number(window.getComputedStyle(el).getPropertyValue("scale"));
  });

  const zoomInButton = page.getByTestId("zoom-increase-button");
  await zoomInButton.click();

  const mapAfter = await page.locator(".map-container");
  const scaleAfter = await mapAfter.evaluate((el) => {
    return Number(window.getComputedStyle(el).getPropertyValue("scale"));
  });

  expect(scaleAfter > scaleBefore);
});

test("zooming out with button works", async ({ page }) => {
  const mapBefore = await page.locator(".map-container");
  const scaleBefore = await mapBefore.evaluate((el) => {
    return Number(window.getComputedStyle(el).getPropertyValue("scale"));
  });

  const zoomInButton = page.getByTestId("zoom-decrease-button");
  await zoomInButton.click();

  const mapAfter = await page.locator(".map-container");
  const scaleAfter = await mapAfter.evaluate((el) => {
    return Number(window.getComputedStyle(el).getPropertyValue("scale"));
  });

  expect(scaleAfter < scaleBefore);
});

test("reset button works", async ({ page }) => {
  const mapBefore = await page.locator(".map-container");
  const scaleBefore = await mapBefore.evaluate((el) => {
    return Number(window.getComputedStyle(el).getPropertyValue("scale"));
  });

  const zoomButton = page.getByTestId("zoom-increase-button");
  await zoomButton.click();

  const resetButton = page.getByTestId("reset-transform-button");
  await resetButton.click();

  const mapAfter = await page.locator(".map-container");
  const scaleAfter = await mapAfter.evaluate((el) => {
    return Number(window.getComputedStyle(el).getPropertyValue("scale"));
  });

  expect(scaleAfter === scaleBefore);
});

test("zooming in with wheel works", async ({ page }) => {
  const mapBefore = await page.locator(".map-container");
  const scaleBefore = await mapBefore.evaluate((el) => {
    return Number(window.getComputedStyle(el).getPropertyValue("scale"));
  });

  await page.mouse.wheel(0, -1);

  const mapAfter = await page.locator(".map-container");
  const scaleAfter = await mapAfter.evaluate((el) => {
    return Number(window.getComputedStyle(el).getPropertyValue("scale"));
  });

  expect(scaleAfter > scaleBefore);
});

test("zooming out with wheel works", async ({ page }) => {
  const mapBefore = await page.locator(".map-container");
  const scaleBefore = await mapBefore.evaluate((el) => {
    return Number(window.getComputedStyle(el).getPropertyValue("scale"));
  });

  await page.mouse.wheel(0, 1);

  const mapAfter = await page.locator(".map-container");
  const scaleAfter = await mapAfter.evaluate((el) => {
    return Number(window.getComputedStyle(el).getPropertyValue("scale"));
  });

  expect(scaleAfter < scaleBefore);
});

test("moving map horizontally works", async ({ page }) => {
  const mapBefore = await page.locator(".map-container");
  const xPosBefore = await mapBefore.evaluate((el) => {
    return Number(
      window.getComputedStyle(el).getPropertyValue("left").replace("px", ""),
    );
  });

  await page.mouse.click(0, 0);
  await page.mouse.move(100, 0);

  const mapAfter = await page.locator(".map-container");
  const xPosAfter = await mapAfter.evaluate((el) => {
    return Number(
      window.getComputedStyle(el).getPropertyValue("left").replace("px", ""),
    );
  });

  expect(xPosAfter > xPosBefore);
});

test("moving map vertically works", async ({ page }) => {
  const mapBefore = await page.locator(".map-container");
  const yPosBefore = await mapBefore.evaluate((el) => {
    return Number(
      window.getComputedStyle(el).getPropertyValue("top").replace("px", ""),
    );
  });

  await page.mouse.click(0, 0);
  await page.mouse.move(0, 100);

  const mapAfter = await page.locator(".map-container");
  const yPosAfter = await mapAfter.evaluate((el) => {
    return Number(
      window.getComputedStyle(el).getPropertyValue("top").replace("px", ""),
    );
  });

  expect(yPosAfter > yPosBefore);
});
