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
  await page
    .getByRole("button", { name: "Muokkaa henkilön tietoja" })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa henkilöä" }),
  ).toBeVisible();
});

test("clicking outside edit person modal triggers cancel confirmation dialog", async ({
  page,
}) => {
  await openSidePanel(page);
  await page
    .getByRole("button", { name: "Muokkaa henkilön tietoja" })
    .first()
    .click();

  // TODO: add semantic clicking target
  const modalBox = await page.locator(".person-modal-content").boundingBox();
  expect(modalBox).not.toBeNull();
  if (!modalBox) {
    throw new Error("Person modal content bounding box not found");
  }

  const clickX = Math.max(5, modalBox.x - 20);
  const clickY = modalBox.y + modalBox.height / 2;
  await page.mouse.click(clickX, clickY);

  await expect(
    page.getByRole("heading", { name: "Sulje ilman tallennusta?" }),
  ).toBeVisible();
});

test("edit person save button is disabled when required fields are empty", async ({
  page,
}) => {
  await openSidePanel(page);
  await page
    .getByRole("button", { name: "Muokkaa henkilön tietoja" })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa henkilöä" }),
  ).toBeVisible();

  const firstNameInput = page.locator('input[name="firstName"]');
  await firstNameInput.clear();

  const saveButton = page.getByRole("button", { name: "Tallenna" });
  await expect(saveButton).toBeDisabled();
});

test("cancelling edit person without saving closes the modal", async ({
  page,
}) => {
  await openSidePanel(page);
  await page
    .getByRole("button", { name: "Muokkaa henkilön tietoja" })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa henkilöä" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Sulje henkilön muokkaus" }).click();
  await page.getByRole("button", { name: "Kyllä" }).click();

  await expect(page.locator(".person-modal-content")).not.toBeVisible();
  await expect(page.locator(".person-modal-overlay")).not.toBeVisible();
});

test("cancelling from confirmation modal keeps the edit person modal open", async ({
  page,
}) => {
  await openSidePanel(page);
  await page
    .getByRole("button", { name: "Muokkaa henkilön tietoja" })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa henkilöä" }),
  ).toBeVisible();

  const firstNameInput = page.locator('input[name="firstName"]');
  await firstNameInput.clear();
  await firstNameInput.fill("Uusi nimi");

  await page.getByRole("button", { name: "Sulje henkilön muokkaus" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Peruuta" })
    .click();

  await expect(
    page.getByRole("heading", { name: "Muokkaa henkilöä" }),
  ).toBeVisible();
});

test("editing and saving person details displays updated info in the room list", async ({
  page,
}) => {
  await openSidePanel(page);

  await page
    .getByRole("button", { name: "Muokkaa henkilön tietoja" })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Muokkaa henkilöä" }),
  ).toBeVisible();

  const firstNameInput = page.locator('input[name="firstName"]');
  const lastNameInput = page.locator('input[name="lastName"]');

  await firstNameInput.clear();
  await firstNameInput.fill("Uusi nimi");

  await lastNameInput.clear();
  await lastNameInput.fill("Uusi sukunimi");

  await page.getByRole("button", { name: "Tallenna" }).click();
  const dialog = page.getByRole("alertdialog");
  await dialog.getByRole("button", { name: "Tallenna" }).click();

  await expect(
    page.getByRole("heading", { name: "Muokkaa henkilöä" }),
  ).not.toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Uusi sukunimi Uusi nimi" }),
  ).toBeVisible();
});
