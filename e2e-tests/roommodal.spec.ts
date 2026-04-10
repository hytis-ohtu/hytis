import { expect, Page } from "@playwright/test";
import { test } from "./testHelper";

test.use({ viewport: { width: 1920, height: 1080 } });

async function openEditRoomModal(page: Page) {
  await page.locator('[data-room="A210"]').click();
  await page.waitForSelector(".room-details-button", { state: "visible" });
  await page.locator('[data-testid="edit-room-button"]').click();
}

async function fillRoomFields(page: Page) {
  await page.getByLabel("Kapasiteetti:").fill("10");
  await page.getByLabel("Huonetyyppi:").fill("Toimisto");
  await page.getByLabel("Osasto:").selectOption({ index: 1 });
  await page.getByLabel("Lisätiedot:").fill("Lisätietoja huoneesta");
}

// --- Modal lifecycle ---

test("edit room modal can be opened", async ({ page }) => {
  await openEditRoomModal(page);
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).toBeVisible();
});

test("close button opens confirmation dialog", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-close-button").click();
  await expect(page.getByText("Sulje ilman tallennusta?")).toBeVisible();
});

test("clicking outside modal opens confirmation dialog", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-overlay").dispatchEvent("click");
  await expect(page.getByText("Sulje ilman tallennusta?")).toBeVisible();
});

test("confirming close via overlay dismisses modal", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-overlay").dispatchEvent("click");
  await page.getByText("Kyllä").click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).not.toBeVisible();
});

test("confirming close button dismisses modal", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-close-button").click();
  await page.getByText("Kyllä").click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).not.toBeVisible();
});

test("cancelling close keeps modal open", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-close-button").click();
  await page.getByText("Peruuta").click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).toBeVisible();
});

// --- Form fields ---

test("form fields are pre-populated with existing room values", async ({
  page,
}) => {
  await openEditRoomModal(page);
  // Capacity and roomType should have the room's current values, not be empty
  await expect(page.getByLabel("Kapasiteetti:")).not.toHaveValue("");
});

test("capacity field accepts numeric input", async ({ page }) => {
  await openEditRoomModal(page);
  await page.getByLabel("Kapasiteetti:").fill("15");
  await expect(page.getByLabel("Kapasiteetti:")).toHaveValue("15");
});

test("room type field accepts text input", async ({ page }) => {
  await openEditRoomModal(page);
  await page.getByLabel("Huonetyyppi:").fill("Neuvotteluhuone");
  await expect(page.getByLabel("Huonetyyppi:")).toHaveValue("Neuvotteluhuone");
});

test("department dropdown can be selected", async ({ page }) => {
  await openEditRoomModal(page);
  await page.getByLabel("Osasto:").selectOption({ index: 1 });
  await expect(page.getByLabel("Osasto:")).not.toHaveValue("");
});

test("free text field accepts input", async ({ page }) => {
  await openEditRoomModal(page);
  await page.getByLabel("Lisätiedot:").fill("Tämä huone on erityinen");
  await expect(page.getByLabel("Lisätiedot:")).toHaveValue(
    "Tämä huone on erityinen",
  );
});

test("capacity field does not accept negative values", async ({ page }) => {
  await openEditRoomModal(page);
  await page.getByLabel("Kapasiteetti:").fill("-5");
  // HTML min=1 prevents values below 1; the field should be invalid
  const isValid = await page
    .getByLabel("Kapasiteetti:")
    .evaluate((el: HTMLInputElement) => el.validity.valid);
  expect(isValid).toBe(false);
});

// --- Save flow ---

test("save button triggers confirmation dialog", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-save-button").click();
  await expect(page.getByText("Tallenna muutokset?")).toBeVisible();
});

test("cancelling save confirmation keeps modal open", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-save-button").click();
  await page.getByText("Peruuta").click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).toBeVisible();
});

test("confirming save closes modal", async ({ page }) => {
  await openEditRoomModal(page);
  await page.locator(".roommodal-save-button").click();
  await page
    .locator(".confirmation-modal")
    .getByRole("button", { name: "Tallenna" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).not.toBeVisible();
});

test("confirming save after editing fields closes modal", async ({ page }) => {
  await openEditRoomModal(page);
  await fillRoomFields(page);
  await page.locator(".roommodal-save-button").click();
  await page
    .locator(".confirmation-modal")
    .getByRole("button", { name: "Tallenna" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).not.toBeVisible();
});

test("saved changes are reflected in room info after modal closes", async ({
  page,
}) => {
  await openEditRoomModal(page);
  await page.getByLabel("Huonetyyppi:").fill("Laboratorio");
  await page.locator(".roommodal-save-button").click();
  await page
    .locator(".confirmation-modal")
    .getByRole("button", { name: "Tallenna" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa huonetta" }),
  ).not.toBeVisible();
  // Side panel should now display the updated room type
  await expect(page.getByText("Laboratorio")).toBeVisible();
});
