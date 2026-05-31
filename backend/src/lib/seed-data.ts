import { faker } from "@faker-js/faker";

const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD", GB: "GBP", DE: "EUR", FR: "EUR", NL: "EUR",
  IN: "INR", CA: "CAD", AU: "AUD", JP: "JPY", BR: "BRL",
};
const COUNTRIES = Object.keys(COUNTRY_CURRENCY);

const SALARY_RANGES: Record<string, [number, number]> = {
  US: [6_000_000, 15_000_000], GB: [5_000_000, 12_000_000], DE: [4_500_000, 11_000_000],
  FR: [4_000_000, 10_000_000], NL: [4_500_000, 11_000_000], IN: [1_200_000,  4_000_000],
  CA: [6_500_000, 13_000_000], AU: [7_000_000, 14_000_000], JP: [40_000_000, 90_000_000],
  BR: [8_000_000, 20_000_000],
};

const DEPARTMENTS = [
  "Engineering", "Product", "Sales", "Marketing",
  "Finance", "HR", "Operations", "Design",
];

const JOB_TITLES_BY_DEPT: Record<string, string[]> = {
  Engineering: ["Software Engineer", "Senior Software Engineer", "Staff Engineer", "Engineering Manager"],
  Product:     ["Product Manager", "Senior Product Manager", "Principal PM", "Director of Product"],
  Sales:       ["Sales Representative", "Account Executive", "Sales Manager", "VP of Sales"],
  Marketing:   ["Marketing Specialist", "Content Strategist", "Marketing Manager", "CMO"],
  Finance:     ["Financial Analyst", "Senior Analyst", "Finance Manager", "CFO"],
  HR:          ["HR Coordinator", "HR Business Partner", "Recruiter", "HR Manager"],
  Operations:  ["Operations Analyst", "Operations Manager", "COO", "Business Analyst"],
  Design:      ["UI Designer", "UX Designer", "Senior Designer", "Design Lead"],
};

const EMPLOYMENT_WEIGHTS = [
  ...Array(60).fill("FULL_TIME"),
  ...Array(20).fill("PART_TIME"),
  ...Array(20).fill("CONTRACT"),
] as const;

export interface EmployeeSeed {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  country: string;
  currency: string;
  baseSalaryCents: number;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  hireDate: Date;
}

export function generateEmployees(count: number): EmployeeSeed[] {
  if (count === 0) return [];
  return Array.from({ length: count }, (_, i) => {
    const country    = faker.helpers.arrayElement(COUNTRIES);
    const currency   = COUNTRY_CURRENCY[country];
    const [min, max] = SALARY_RANGES[country];
    const department = faker.helpers.arrayElement(DEPARTMENTS);
    const firstName  = faker.person.firstName();
    const lastName   = faker.person.lastName();
    const localPart  = faker.internet.email({ firstName, lastName }).split("@")[0];
    const email      = `${localPart}.${i}@${faker.internet.domainName()}`;

    return {
      firstName,
      lastName,
      email,
      department,
      jobTitle:        faker.helpers.arrayElement(JOB_TITLES_BY_DEPT[department]),
      country,
      currency,
      baseSalaryCents: faker.number.int({ min, max }),
      employmentType:  faker.helpers.arrayElement(EMPLOYMENT_WEIGHTS),
      hireDate:        faker.date.between({ from: "2015-01-01", to: new Date() }),
    };
  });
}
