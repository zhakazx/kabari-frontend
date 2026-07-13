import { describe, it, expect } from "vitest";

import {
  cn,
  formatDate,
  formatDateTime,
  formatRupiah,
  statusBadgeVariant,
  toNumber,
} from "./utils";

describe("cn", () => {
  it("merges class names, with later wins", () => {
    expect(cn("a", "b")).toBe("a b");
  });
  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
  it("dedupes tailwind utilities via twMerge", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("toNumber", () => {
  it("returns 0 for null / undefined", () => {
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
  });
  it("parses numeric strings", () => {
    expect(toNumber("12.5")).toBe(12.5);
    expect(toNumber("0")).toBe(0);
  });
  it("passes through numbers", () => {
    expect(toNumber(7)).toBe(7);
  });
  it("falls back to 0 for non-finite input", () => {
    expect(toNumber("not-a-number")).toBe(0);
    expect(toNumber(Number.NaN)).toBe(0);
  });
});

describe("formatRupiah", () => {
  it("formats integer amounts with no fraction digits", () => {
    const out = formatRupiah(10000);
    expect(out).toMatch(/10\.000/);
    expect(out).toMatch(/Rp/);
  });
  it("handles numeric strings from SQL COUNT", () => {
    const out = formatRupiah("1500000");
    expect(out).toMatch(/1\.500\.000/);
  });
  it("falls back to 0 when value cannot be parsed", () => {
    const out = formatRupiah(Number.NaN);
    expect(out).toMatch(/0/);
  });
});

describe("formatDate / formatDateTime", () => {
  it("renders ISO dates in Indonesian long form", () => {
    const out = formatDate("2025-08-17T00:00:00.000Z");
    expect(out.length).toBeGreaterThan(0);
    expect(out).not.toBe("2025-08-17");
    expect(out).not.toBe("-");
  });
  it("returns dash for empty inputs", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("")).toBe("-");
    expect(formatDateTime(undefined)).toBe("-");
  });
  it("falls back to the raw string when invalid", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("statusBadgeVariant", () => {
  it("maps known statuses to a variant", () => {
    expect(statusBadgeVariant("published")).toBe("success");
    expect(statusBadgeVariant("rejected")).toBe("danger");
    expect(statusBadgeVariant("draft")).toBe("neutral");
    expect(statusBadgeVariant("active")).toBe("info");
  });
  it("falls back to neutral for unknown statuses", () => {
    expect(statusBadgeVariant("mystery")).toBe("neutral");
  });
});
