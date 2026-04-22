import { expect } from "@playwright/test";
import { test } from "./testHelper";

test("legend shows correct entries in availability mode", async ({ page }) => {
  const legend = page.getByTestId("legend");

  const legendItems = legend.getByText(/tyhjä|tilaa|täynnä/i);
  expect(legendItems).toHaveCount(3);
});

test("legend shows correct entries in department mode", async ({ page }) => {
  const colorToggle = page.getByRole("button", { name: /vastuualueet/i });
  await colorToggle.click();

  const legend = page.getByTestId("legend");

  const legendItems = legend.getByText(/h516 mathstat|h523 cs/i);
  expect(legendItems).toHaveCount(2);
});
