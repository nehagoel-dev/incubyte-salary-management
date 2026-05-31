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

export function generateEmployees(_count: number): EmployeeSeed[] {
  throw new Error("not implemented");
}
