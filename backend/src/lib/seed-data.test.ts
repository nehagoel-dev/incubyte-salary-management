import { describe, it, expect } from "vitest";
import { generateEmployees } from "./seed-data.js";

const VALID_CURRENCIES = ["USD", "GBP", "EUR", "INR", "CAD", "AUD", "JPY", "BRL"];
const VALID_COUNTRIES  = ["US", "GB", "DE", "FR", "NL", "IN", "CA", "AU", "JP", "BR"];
const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD", GB: "GBP", DE: "EUR", FR: "EUR", NL: "EUR",
  IN: "INR", CA: "CAD", AU: "AUD", JP: "JPY", BR: "BRL",
};
const VALID_EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT"];
const ALL_DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "Finance", "HR", "Operations"];

describe("generateEmployees", () => {
  it("returns exact count", () => {
    expect(generateEmployees(100)).toHaveLength(100);
    expect(generateEmployees(1)).toHaveLength(1);
    expect(generateEmployees(0)).toHaveLength(0);
  });

  it("all required fields are present and non-empty", () => {
    const records = generateEmployees(50);
    for (const r of records) {
      expect(r.firstName).toBeTruthy();
      expect(r.lastName).toBeTruthy();
      expect(r.email).toBeTruthy();
      expect(r.department).toBeTruthy();
      expect(r.jobTitle).toBeTruthy();
      expect(r.country).toBeTruthy();
      expect(r.currency).toBeTruthy();
      expect(r.baseSalaryCents).toBeDefined();
      expect(r.employmentType).toBeDefined();
      expect(r.hireDate).toBeDefined();
    }
  });

  it("every currency is valid", () => {
    const records = generateEmployees(100);
    for (const r of records) {
      expect(VALID_CURRENCIES).toContain(r.currency);
    }
  });

  it("every country is valid", () => {
    const records = generateEmployees(100);
    for (const r of records) {
      expect(VALID_COUNTRIES).toContain(r.country);
    }
  });

  it("country and currency are consistent", () => {
    const records = generateEmployees(100);
    for (const r of records) {
      expect(r.currency).toBe(COUNTRY_CURRENCY[r.country]);
    }
  });

  it("every baseSalaryCents is a positive integer", () => {
    const records = generateEmployees(100);
    for (const r of records) {
      expect(r.baseSalaryCents).toBeGreaterThan(0);
      expect(Number.isInteger(r.baseSalaryCents)).toBe(true);
    }
  });

  it("every employmentType is valid", () => {
    const records = generateEmployees(100);
    for (const r of records) {
      expect(VALID_EMPLOYMENT_TYPES).toContain(r.employmentType);
    }
  });

  it("every hireDate is a Date in the past", () => {
    const now = new Date();
    const records = generateEmployees(50);
    for (const r of records) {
      expect(r.hireDate).toBeInstanceOf(Date);
      expect(r.hireDate.getTime()).toBeLessThan(now.getTime());
    }
  });

  it("all emails are unique within the batch", () => {
    const records = generateEmployees(200);
    const uniqueEmails = new Set(records.map((r) => r.email));
    expect(uniqueEmails.size).toBe(200);
  });

  it("department spread covers at least 6 of 8 departments", () => {
    const records = generateEmployees(800);
    const seen = new Set(records.map((r) => r.department));
    const covered = ALL_DEPARTMENTS.filter((d) => seen.has(d));
    expect(covered.length).toBeGreaterThanOrEqual(6);
  });

  it("country spread covers at least 8 of 10 countries", () => {
    const records = generateEmployees(1000);
    const seen = new Set(records.map((r) => r.country));
    const covered = VALID_COUNTRIES.filter((c) => seen.has(c));
    expect(covered.length).toBeGreaterThanOrEqual(8);
  });

  it("is a function", () => {
    expect(typeof generateEmployees).toBe("function");
  });
});
