import { expect } from "@playwright/test";
import { test, openSidePanel } from "./testHelper";

test.use({ viewport: { width: 1920, height: 1080 } });

test("edit person button is visible for each room occupant", async ({
  page,
}) => {
  await openSidePanel(page);
  const editButtons = page.locator(".edit-person-button");

  const count = await editButtons.count();
  for (let i = 0; i < count; i++) {
    await expect(editButtons.nth(i)).toBeVisible();
  }
});

test("edit person modal opens when edit button is clicked", async ({
  page,
}) => {
  await openSidePanel(page);
  await page.locator(".edit-person-button").first().click();
  await expect(page.locator(".personmodal-overlay")).toBeVisible();
  await expect(page.locator(".personmodal-content")).toBeVisible();
});

test("clicking outside edit person modal triggers cancel confirmation dialog", async ({
  page,
}) => {
  await openSidePanel(page);
  await page.locator(".edit-person-button").first().click();

  // Click on overlay background outside the topbar and modal (top-left corner)
  await page
    .locator(".personmodal-overlay")
    .click({ position: { x: 200, y: 200 } });

  await expect(page.locator(".confirmation-title")).toBeVisible();
});

test("edit person save button is disabled when required fields are empty", async ({
  page,
}) => {
  await openSidePanel(page);
  await page.locator(".edit-person-button").first().click();
  await expect(page.locator(".personmodal-content")).toBeVisible();

  const firstNameInput = page.locator('input[name="firstName"]');
  await firstNameInput.clear();

  const saveButton = page.locator(".personmodal-save-button");
  await expect(saveButton).toBeDisabled();
});

test("cancelling edit person without saving closes the modal", async ({
  page,
}) => {
  await openSidePanel(page);
  await page.locator(".edit-person-button").first().click();
  await expect(page.locator(".personmodal-content")).toBeVisible();

  await page.locator(".personmodal-close-button").click();
  await page.locator(".confirmation-button", { hasText: "Kyllä" }).click();

  await expect(page.locator(".personmodal-content")).not.toBeVisible();
  await expect(page.locator(".personmodal-overlay")).not.toBeVisible();
});

test("cancelling from confirmation modal keeps the edit person modal open", async ({
  page,
}) => {
  await openSidePanel(page);
  await page.locator(".edit-person-button").first().click();
  await expect(page.locator(".personmodal-content")).toBeVisible();

  const firstNameInput = page.locator('input[name="firstName"]');
  await firstNameInput.clear();
  await firstNameInput.fill("Uusi nimi");

  await page.locator(".personmodal-save-button").click();
  await page.locator(".confirmation-button", { hasText: "Peruuta" }).click();

  await expect(page.locator(".personmodal-content")).toBeVisible();
});

test("editing and saving person details displays updated info in the room list", async ({
  page,
}) => {
  await openSidePanel(page);

  await page.locator(".edit-person-button").first().click();
  await expect(page.locator(".personmodal-content")).toBeVisible();

  const firstNameInput = page.locator('input[name="firstName"]');
  const lastNameInput = page.locator('input[name="lastName"]');

  await firstNameInput.clear();
  await firstNameInput.fill("Uusi nimi");

  await lastNameInput.clear();
  await lastNameInput.fill("Uusi sukunimi");

  await page.locator(".personmodal-save-button").click();
  await page.locator(".confirmation-button", { hasText: "Tallenna" }).click();

  await expect(page.locator(".personmodal-content")).not.toBeVisible();
  await expect(page.locator(".personmodal-overlay")).not.toBeVisible();

  await expect(page.locator("details .person-name").first()).toContainText(
    "Uusi nimi Uusi sukunimi",
  );
});
