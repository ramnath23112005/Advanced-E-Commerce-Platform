import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Discover");
    await expect(page.locator("text=Shop Now")).toBeVisible();
    await expect(page.locator("text=New Arrivals")).toBeVisible();
  });

  test("should navigate to products", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Shop Now");
    await expect(page).toHaveURL(/\/products/);
  });
});

test.describe("Authentication", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Welcome back");
  });

  test("should show register page", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("h1")).toContainText("Create an account");
  });
});
