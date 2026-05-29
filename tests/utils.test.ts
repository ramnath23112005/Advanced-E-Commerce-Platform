import { describe, it, expect } from "vitest";
import { formatPrice, slugify, truncate, calculateDiscount, generateOrderNumber } from "@/lib/utils";

describe("formatPrice", () => {
  it("formats USD price correctly", () => {
    expect(formatPrice(29.99)).toBe("$29.99");
  });
  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });
});

describe("slugify", () => {
  it("converts text to slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("handles special characters", () => {
    expect(slugify("Premium 100% Cotton!")).toBe("premium-100-cotton");
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("Hello World This Is Long", 10)).toBe("Hello Worl...");
  });
  it("returns short strings unchanged", () => {
    expect(truncate("Hi", 10)).toBe("Hi");
  });
});

describe("calculateDiscount", () => {
  it("calculates discount percentage", () => {
    expect(calculateDiscount(100, 75)).toBe(25);
  });
});

describe("generateOrderNumber", () => {
  it("generates order number with prefix", () => {
    const num = generateOrderNumber();
    expect(num).toMatch(/^ORD-/);
  });
});
